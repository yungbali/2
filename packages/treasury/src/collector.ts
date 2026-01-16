/**
 * Fee Collector
 * ==============
 * Collects transfer fees from Token-2022 forked tokens
 */

import { Connection, PublicKey, Keypair, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import {
  TOKEN_2022_PROGRAM_ID,
  getTransferFeeConfig,
  getMint,
  getAccount,
  withdrawWithheldTokensFromAccounts,
  harvestWithheldTokensToMint,
} from '@solana/spl-token';
import axios from 'axios';
import { logger, getDeployerKeypair, API_ENDPOINTS } from '@forkoor/core';
import type { ForkoorConfig } from '@forkoor/core';

// ============================================
// Fee Collector
// ============================================

export class FeeCollector {
  private connection: Connection;
  private config: ForkoorConfig;
  private trackedMints: Set<string> = new Set();

  constructor(connection: Connection, config: ForkoorConfig) {
    this.connection = connection;
    this.config = config;
  }

  /**
   * Add a forked token to track for fees
   */
  trackMint(mint: string): void {
    this.trackedMints.add(mint);
    logger.info(`Now tracking fees for: ${mint}`);
  }

  /**
   * Remove a token from tracking
   */
  untrackMint(mint: string): void {
    this.trackedMints.delete(mint);
  }

  /**
   * Get all tracked mints
   */
  getTrackedMints(): string[] {
    return Array.from(this.trackedMints);
  }

  /**
   * Get withheld fees for a specific mint
   */
  async getWithheldFees(mint: string): Promise<bigint> {
    try {
      const mintPubkey = new PublicKey(mint);
      
      // Get the mint info to check transfer fee config
      const mintInfo = await getMint(
        this.connection,
        mintPubkey,
        'confirmed',
        TOKEN_2022_PROGRAM_ID
      );

      // Get transfer fee config extension
      const feeConfig = getTransferFeeConfig(mintInfo);
      
      if (!feeConfig) {
        logger.warn(`No transfer fee config found for ${mint}`);
        return 0n;
      }

      // Get withheld amount from mint account
      // Note: Fees are withheld on token accounts and harvested to mint
      return feeConfig.withheldAmount;
    } catch (error) {
      logger.error(`Failed to get withheld fees for ${mint}:`, error);
      return 0n;
    }
  }

  /**
   * Harvest withheld tokens from all token accounts to mint
   */
  async harvestFeesToMint(mint: string): Promise<string | null> {
    try {
      const payer = getDeployerKeypair(this.config);
      if (!payer) {
        throw new Error('Deployer keypair not configured');
      }

      const mintPubkey = new PublicKey(mint);
      
      // Get all token accounts for this mint
      const tokenAccounts = await this.connection.getTokenAccountsByOwner(
        payer.publicKey,
        { mint: mintPubkey, programId: TOKEN_2022_PROGRAM_ID }
      );

      if (tokenAccounts.value.length === 0) {
        logger.info(`No token accounts to harvest from for ${mint}`);
        return null;
      }

      // Harvest tokens from accounts to mint
      const accountPubkeys = tokenAccounts.value.map(ta => ta.pubkey);
      
      const signature = await harvestWithheldTokensToMint(
        this.connection,
        payer,
        mintPubkey,
        accountPubkeys,
        undefined,
        TOKEN_2022_PROGRAM_ID
      );

      logger.success(`Harvested fees to mint: ${signature}`);
      return signature;
    } catch (error) {
      logger.error(`Failed to harvest fees for ${mint}:`, error);
      return null;
    }
  }

  /**
   * Withdraw collected fees to treasury
   */
  async withdrawFeesToTreasury(mint: string): Promise<{ amount: bigint; signature: string } | null> {
    try {
      const payer = getDeployerKeypair(this.config);
      if (!payer) {
        throw new Error('Deployer keypair not configured');
      }

      const treasuryWallet = this.config.treasury.treasuryWallet;
      if (!treasuryWallet) {
        throw new Error('Treasury wallet not configured');
      }

      const mintPubkey = new PublicKey(mint);
      const treasuryPubkey = new PublicKey(treasuryWallet);

      // First harvest fees from all accounts to mint
      await this.harvestFeesToMint(mint);

      // Get withheld amount
      const mintInfo = await getMint(
        this.connection,
        mintPubkey,
        'confirmed',
        TOKEN_2022_PROGRAM_ID
      );

      const feeConfig = getTransferFeeConfig(mintInfo);
      if (!feeConfig || feeConfig.withheldAmount === 0n) {
        logger.info(`No fees to withdraw for ${mint}`);
        return null;
      }

      const amount = feeConfig.withheldAmount;

      // Withdraw from mint to treasury
      const signature = await withdrawWithheldTokensFromAccounts(
        this.connection,
        payer,
        mintPubkey,
        treasuryPubkey,
        payer.publicKey, // withdraw withheld authority
        [],
        [mintPubkey], // withdraw from mint
        undefined,
        TOKEN_2022_PROGRAM_ID
      );

      logger.success(`Withdrew ${amount} fees to treasury: ${signature}`);
      return { amount, signature };
    } catch (error) {
      logger.error(`Failed to withdraw fees for ${mint}:`, error);
      return null;
    }
  }

  /**
   * Collect all pending fees from all tracked mints
   */
  async collectAllPendingFees(): Promise<number> {
    let totalCollected = 0;

    for (const mint of this.trackedMints) {
      const result = await this.withdrawFeesToTreasury(mint);
      if (result) {
        totalCollected += Number(result.amount);
      }
    }

    return totalCollected;
  }

  /**
   * Get treasury balance in USD
   */
  async getTreasuryBalanceUsd(): Promise<number> {
    try {
      const treasuryWallet = this.config.treasury.treasuryWallet;
      if (!treasuryWallet) {
        return 0;
      }

      const treasuryPubkey = new PublicKey(treasuryWallet);
      
      // Get SOL balance
      const solBalance = await this.connection.getBalance(treasuryPubkey);
      const solBalanceUi = solBalance / 1_000_000_000;

      // Get SOL price
      const solPrice = await this.getTokenPrice('So11111111111111111111111111111111111111112');
      
      let totalUsd = solBalanceUi * solPrice;

      // Get FORK token balance if configured
      const forkMint = this.config.treasury.forkTokenMint;
      if (forkMint) {
        // Would get ATA balance and price here
        // For now, just return SOL value
      }

      return totalUsd;
    } catch (error) {
      logger.error('Failed to get treasury balance:', error);
      return 0;
    }
  }

  /**
   * Get token price from Jupiter
   */
  async getTokenPrice(mint: string): Promise<number> {
    try {
      const response = await axios.get(
        `${API_ENDPOINTS.JUPITER_PRICE}/price?ids=${mint}`
      );
      
      return response.data.data?.[mint]?.price || 0;
    } catch (error) {
      logger.error('Failed to get token price:', error);
      return 0;
    }
  }
}
