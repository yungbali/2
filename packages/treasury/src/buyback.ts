#!/usr/bin/env tsx
/**
 * Buyback Executor
 * =================
 * Automated $FORK token buybacks from treasury fees
 * 
 * The Pump (The Loop):
 * Every $1,000 in fees collected → Market Buy of $FORK
 */

import { Connection, PublicKey, Keypair, VersionedTransaction } from '@solana/web3.js';
import axios from 'axios';
import { 
  logger, 
  getDeployerKeypair, 
  API_ENDPOINTS, 
  MAX_BUYBACK_SLIPPAGE_BPS,
  BUYBACK_THRESHOLD_USD,
} from '@forkoor/core';
import type { ForkoorConfig, BuybackExecution } from '@forkoor/core';

// ============================================
// Jupiter Swap Types
// ============================================

interface JupiterQuote {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  priceImpactPct: string;
  routePlan: unknown[];
}

interface JupiterSwapResponse {
  swapTransaction: string;
}

// ============================================
// Buyback Executor
// ============================================

export class BuybackExecutor {
  private connection: Connection;
  private config: ForkoorConfig;

  // Well-known mints
  private readonly WSOL_MINT = 'So11111111111111111111111111111111111111112';
  private readonly USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

  constructor(connection: Connection, config: ForkoorConfig) {
    this.connection = connection;
    this.config = config;
  }

  /**
   * Get a quote from Jupiter for the swap
   */
  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = MAX_BUYBACK_SLIPPAGE_BPS
  ): Promise<JupiterQuote | null> {
    try {
      const params = new URLSearchParams({
        inputMint,
        outputMint,
        amount: amount.toString(),
        slippageBps: slippageBps.toString(),
      });

      const response = await axios.get<JupiterQuote>(
        `${API_ENDPOINTS.JUPITER_QUOTE}/quote?${params}`
      );

      return response.data;
    } catch (error) {
      logger.error('Failed to get Jupiter quote:', error);
      return null;
    }
  }

  /**
   * Execute a swap via Jupiter
   */
  async executeSwap(
    quote: JupiterQuote,
    userPublicKey: PublicKey
  ): Promise<string | null> {
    try {
      // Get swap transaction
      const response = await axios.post<JupiterSwapResponse>(
        `${API_ENDPOINTS.JUPITER_QUOTE}/swap`,
        {
          quoteResponse: quote,
          userPublicKey: userPublicKey.toBase58(),
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: 'auto',
        }
      );

      const { swapTransaction } = response.data;

      // Decode and sign the transaction
      const payer = getDeployerKeypair(this.config);
      if (!payer) {
        throw new Error('Deployer keypair not configured');
      }

      const transactionBuf = Buffer.from(swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(transactionBuf);
      
      // Sign
      transaction.sign([payer]);

      // Send
      const signature = await this.connection.sendRawTransaction(
        transaction.serialize(),
        {
          skipPreflight: true,
          maxRetries: 3,
        }
      );

      // Confirm
      await this.connection.confirmTransaction(signature, 'confirmed');

      return signature;
    } catch (error) {
      logger.error('Failed to execute swap:', error);
      return null;
    }
  }

  /**
   * Execute a buyback of $FORK tokens
   */
  async executeBuyback(amountUsd: number): Promise<BuybackExecution | null> {
    const forkMint = this.config.treasury.forkTokenMint;
    
    if (!forkMint) {
      logger.error('FORK token mint not configured');
      return null;
    }

    const payer = getDeployerKeypair(this.config);
    if (!payer) {
      logger.error('Deployer keypair not configured');
      return null;
    }

    logger.info(`Executing buyback: $${amountUsd.toFixed(2)} USD → $FORK`);

    try {
      // Step 1: Get SOL price to calculate input amount
      const solPrice = await this.getSolPrice();
      const solAmount = amountUsd / solPrice;
      const lamports = Math.floor(solAmount * 1_000_000_000);

      logger.info(`Converting ${solAmount.toFixed(4)} SOL ($${amountUsd.toFixed(2)}) to $FORK`);

      // Step 2: Get quote from Jupiter
      const quote = await this.getQuote(
        this.WSOL_MINT,
        forkMint,
        lamports
      );

      if (!quote) {
        throw new Error('Failed to get quote');
      }

      const outputAmount = Number(quote.outAmount);
      const priceImpact = parseFloat(quote.priceImpactPct);

      logger.info(`Quote received: ${outputAmount} $FORK (${priceImpact.toFixed(2)}% price impact)`);

      // Check price impact
      if (priceImpact > 5) {
        logger.warn(`High price impact detected: ${priceImpact.toFixed(2)}%`);
        // Could split into smaller trades or abort
      }

      // Step 3: Execute the swap
      const signature = await this.executeSwap(quote, payer.publicKey);

      if (!signature) {
        throw new Error('Swap execution failed');
      }

      // Calculate average price
      const avgPrice = amountUsd / outputAmount;

      const result: BuybackExecution = {
        amountSpent: amountUsd,
        tokensBought: outputAmount,
        avgPrice,
        txSignature: signature,
        timestamp: Date.now(),
      };

      logger.success(`🎯 Buyback complete!`);
      logger.success(`  Spent: $${amountUsd.toFixed(2)} USD`);
      logger.success(`  Bought: ${outputAmount.toLocaleString()} $FORK`);
      logger.success(`  Avg Price: $${avgPrice.toFixed(8)}`);
      logger.success(`  TX: ${signature}`);

      return result;
    } catch (error) {
      logger.error('Buyback failed:', error);
      return null;
    }
  }

  /**
   * Get current SOL price in USD
   */
  async getSolPrice(): Promise<number> {
    try {
      const response = await axios.get(
        `${API_ENDPOINTS.JUPITER_PRICE}/price?ids=${this.WSOL_MINT}`
      );
      
      return response.data.data?.[this.WSOL_MINT]?.price || 0;
    } catch (error) {
      logger.error('Failed to get SOL price:', error);
      return 0;
    }
  }

  /**
   * Get current $FORK price
   */
  async getForkPrice(): Promise<number> {
    const forkMint = this.config.treasury.forkTokenMint;
    if (!forkMint) return 0;

    try {
      const response = await axios.get(
        `${API_ENDPOINTS.JUPITER_PRICE}/price?ids=${forkMint}`
      );
      
      return response.data.data?.[forkMint]?.price || 0;
    } catch (error) {
      logger.error('Failed to get FORK price:', error);
      return 0;
    }
  }

  /**
   * Estimate buyback output
   */
  async estimateBuyback(amountUsd: number): Promise<{
    inputSol: number;
    outputFork: number;
    priceImpact: number;
  } | null> {
    const forkMint = this.config.treasury.forkTokenMint;
    if (!forkMint) return null;

    try {
      const solPrice = await this.getSolPrice();
      const solAmount = amountUsd / solPrice;
      const lamports = Math.floor(solAmount * 1_000_000_000);

      const quote = await this.getQuote(this.WSOL_MINT, forkMint, lamports);
      
      if (!quote) return null;

      return {
        inputSol: solAmount,
        outputFork: Number(quote.outAmount),
        priceImpact: parseFloat(quote.priceImpactPct),
      };
    } catch (error) {
      logger.error('Failed to estimate buyback:', error);
      return null;
    }
  }
}

// ============================================
// CLI Entry Point
// ============================================

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║       💰 Claude Forkoor - Treasury Buyback                    ║
║       "The Ralph Loop: Fees → Buybacks → Growth"              ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Usage:                                                       ║
║    npm run treasury:buyback -- <amount_usd>                   ║
║    npm run treasury:buyback -- estimate <amount_usd>          ║
║                                                               ║
║  Examples:                                                    ║
║    npm run treasury:buyback -- 1000      Execute $1000 buyback║
║    npm run treasury:buyback -- estimate 500   Estimate output ║
║                                                               ║
║  Requirements:                                                ║
║    - DEPLOYER_PRIVATE_KEY in .env                             ║
║    - FORK_TOKEN_MINT in .env                                  ║
║    - Sufficient SOL in treasury                               ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);
    process.exit(0);
  }

  const { loadConfig, getConnection } = await import('@forkoor/core');
  const config = loadConfig();
  const connection = getConnection(config);
  const executor = new BuybackExecutor(connection, config);

  if (args[0] === 'estimate') {
    const amount = parseFloat(args[1] || '1000');
    logger.info(`Estimating buyback for $${amount} USD...`);
    
    const estimate = await executor.estimateBuyback(amount);
    
    if (estimate) {
      console.log(`\nEstimate:`);
      console.log(`  Input: ${estimate.inputSol.toFixed(4)} SOL`);
      console.log(`  Output: ${estimate.outputFork.toLocaleString()} $FORK`);
      console.log(`  Price Impact: ${estimate.priceImpact.toFixed(2)}%`);
    } else {
      logger.error('Failed to estimate buyback');
    }
  } else {
    const amount = parseFloat(args[0]);
    
    if (isNaN(amount) || amount <= 0) {
      logger.error('Invalid amount');
      process.exit(1);
    }

    if (amount < BUYBACK_THRESHOLD_USD) {
      logger.warn(`Amount ($${amount}) is below threshold ($${BUYBACK_THRESHOLD_USD})`);
    }

    const result = await executor.executeBuyback(amount);
    
    if (!result) {
      logger.error('Buyback failed');
      process.exit(1);
    }
  }
}

if (require.main === module) {
  main().catch((error) => {
    logger.error('Error:', error);
    process.exit(1);
  });
}
