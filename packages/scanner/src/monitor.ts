/**
 * Token Monitor
 * ==============
 * Real-time monitoring of new token launches on Pump.fun and Raydium
 */

import { Connection, PublicKey, Logs, Context } from '@solana/web3.js';
import WebSocket from 'ws';
import EventEmitter from 'eventemitter3';
import { logger, sleep, SCAN_DELAY_MS } from '@forkoor/core';
import type { TokenLaunchEvent, TokenRiskAssessment } from '@forkoor/core';

// ============================================
// Event Types
// ============================================

interface MonitorEvents {
  newToken: (event: TokenLaunchEvent) => void;
  forkOpportunity: (data: { original: TokenLaunchEvent; assessment: TokenRiskAssessment }) => void;
  error: (error: Error) => void;
}

// ============================================
// Known Program IDs
// ============================================

const PUMPFUN_PROGRAM_ID = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');
const RAYDIUM_AMM_ID = new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8');
const RAYDIUM_CLMM_ID = new PublicKey('CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK');

// ============================================
// Token Monitor
// ============================================

export class TokenMonitor extends EventEmitter<MonitorEvents> {
  private connection: Connection;
  private pumpfunWsUrl: string | null;
  private pumpfunWs: WebSocket | null = null;
  private subscriptionId: number | null = null;
  private running: boolean = false;
  private processedMints: Set<string> = new Set();

  constructor(connection: Connection, pumpfunWsUrl: string | null = null) {
    super();
    this.connection = connection;
    this.pumpfunWsUrl = pumpfunWsUrl;
  }

  /**
   * Start monitoring for new tokens
   */
  async start(): Promise<void> {
    if (this.running) {
      return;
    }

    this.running = true;
    logger.info('Starting token monitor...');

    // Start pump.fun WebSocket if URL provided
    if (this.pumpfunWsUrl) {
      this.connectPumpfunWs();
    }

    // Subscribe to Raydium program logs
    await this.subscribeToRaydium();
    
    // Subscribe to pump.fun program logs (fallback)
    await this.subscribeToPumpfun();

    logger.success('Token monitor started');
  }

  /**
   * Stop monitoring
   */
  async stop(): Promise<void> {
    this.running = false;

    if (this.pumpfunWs) {
      this.pumpfunWs.close();
      this.pumpfunWs = null;
    }

    if (this.subscriptionId !== null) {
      await this.connection.removeOnLogsListener(this.subscriptionId);
      this.subscriptionId = null;
    }

    logger.info('Token monitor stopped');
  }

  /**
   * Connect to pump.fun WebSocket for real-time updates
   */
  private connectPumpfunWs(): void {
    if (!this.pumpfunWsUrl) return;

    logger.info('Connecting to pump.fun WebSocket...');

    this.pumpfunWs = new WebSocket(this.pumpfunWsUrl);

    this.pumpfunWs.on('open', () => {
      logger.success('Connected to pump.fun WebSocket');
      
      // Subscribe to new token events
      this.pumpfunWs?.send(JSON.stringify({
        method: 'subscribeNewToken',
      }));
    });

    this.pumpfunWs.on('message', async (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'newToken') {
          await this.handleNewToken({
            mint: message.mint,
            name: message.name,
            symbol: message.symbol,
            platform: 'PUMPFUN',
            timestamp: Date.now(),
            initialLiquidity: message.vSolInBondingCurve || 0,
            creator: message.creator || '',
          });
        }
      } catch (error) {
        logger.error('Failed to parse pump.fun message:', error);
      }
    });

    this.pumpfunWs.on('close', () => {
      logger.warn('Pump.fun WebSocket disconnected');
      
      // Attempt reconnection
      if (this.running) {
        setTimeout(() => this.connectPumpfunWs(), 5000);
      }
    });

    this.pumpfunWs.on('error', (error) => {
      logger.error('Pump.fun WebSocket error:', error);
      this.emit('error', error);
    });
  }

  /**
   * Subscribe to Raydium program logs for new pool creation
   */
  private async subscribeToRaydium(): Promise<void> {
    logger.info('Subscribing to Raydium AMM...');

    this.connection.onLogs(
      RAYDIUM_AMM_ID,
      async (logs: Logs, ctx: Context) => {
        if (!this.running) return;
        
        // Look for pool initialization logs
        const isPoolInit = logs.logs.some(
          (log) => log.includes('initialize') || log.includes('Initialize')
        );

        if (isPoolInit) {
          await this.processRaydiumLogs(logs, 'RAYDIUM');
        }
      },
      'confirmed'
    );
  }

  /**
   * Subscribe to pump.fun program logs (fallback)
   */
  private async subscribeToPumpfun(): Promise<void> {
    logger.info('Subscribing to Pump.fun program...');

    this.subscriptionId = this.connection.onLogs(
      PUMPFUN_PROGRAM_ID,
      async (logs: Logs, ctx: Context) => {
        if (!this.running) return;
        
        // Look for token creation logs
        const isCreate = logs.logs.some(
          (log) => log.includes('create') || log.includes('Create')
        );

        if (isCreate) {
          await this.processPumpfunLogs(logs);
        }
      },
      'confirmed'
    );
  }

  /**
   * Process pump.fun logs to extract new token info
   */
  private async processPumpfunLogs(logs: Logs): Promise<void> {
    try {
      // Extract mint address from transaction
      const signature = logs.signature;
      
      // Wait a bit for transaction to be finalized
      await sleep(2000);
      
      const tx = await this.connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });

      if (!tx) return;

      // Look for token mint creation in inner instructions
      const innerInstructions = tx.meta?.innerInstructions || [];
      
      for (const inner of innerInstructions) {
        for (const ix of inner.instructions) {
          if ('parsed' in ix && ix.parsed?.type === 'initializeMint') {
            const mint = ix.parsed.info?.mint;
            
            if (mint && !this.processedMints.has(mint)) {
              this.processedMints.add(mint);
              
              // Get token metadata
              await sleep(SCAN_DELAY_MS); // Wait for metadata to propagate
              
              await this.handleNewToken({
                mint,
                name: 'Unknown',
                symbol: 'UNK',
                platform: 'PUMPFUN',
                timestamp: Date.now(),
                initialLiquidity: 0,
                creator: tx.transaction.message.accountKeys[0]?.pubkey.toBase58() || '',
              });
            }
          }
        }
      }
    } catch (error) {
      logger.error('Failed to process pump.fun logs:', error);
    }
  }

  /**
   * Process Raydium logs for new pool creation
   */
  private async processRaydiumLogs(logs: Logs, platform: 'RAYDIUM' | 'ORCA'): Promise<void> {
    try {
      const signature = logs.signature;
      
      await sleep(2000);
      
      const tx = await this.connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });

      if (!tx) return;

      // Look for new token in pool creation
      const accountKeys = tx.transaction.message.accountKeys;
      
      // Find potential new token mints (non-SOL, non-USDC, etc.)
      for (const key of accountKeys) {
        const pubkey = key.pubkey.toBase58();
        
        // Skip known tokens
        if (this.isKnownToken(pubkey)) continue;
        if (this.processedMints.has(pubkey)) continue;
        
        // Check if this is a mint account
        const accountInfo = await this.connection.getAccountInfo(new PublicKey(pubkey));
        
        if (accountInfo && accountInfo.data.length === 82) {
          // This is likely a mint account
          this.processedMints.add(pubkey);
          
          await this.handleNewToken({
            mint: pubkey,
            name: 'Unknown',
            symbol: 'UNK',
            platform,
            timestamp: Date.now(),
            initialLiquidity: 0,
            creator: tx.transaction.message.accountKeys[0]?.pubkey.toBase58() || '',
          });
        }
      }
    } catch (error) {
      logger.error('Failed to process Raydium logs:', error);
    }
  }

  /**
   * Check if a token is a known base token
   */
  private isKnownToken(mint: string): boolean {
    const knownTokens = [
      'So11111111111111111111111111111111111111112', // Wrapped SOL
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
      '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs', // ETH (Wormhole)
    ];
    return knownTokens.includes(mint);
  }

  /**
   * Handle a new token launch event
   */
  private async handleNewToken(event: TokenLaunchEvent): Promise<void> {
    logger.scan(`New token launch detected: ${event.mint}`);
    
    // Emit the event for processing
    this.emit('newToken', event);
  }

  /**
   * Manually trigger analysis of a token
   */
  async triggerAnalysis(mint: string): Promise<void> {
    await this.handleNewToken({
      mint,
      name: 'Manual Check',
      symbol: 'MANUAL',
      platform: 'OTHER',
      timestamp: Date.now(),
      initialLiquidity: 0,
      creator: '',
    });
  }
}
