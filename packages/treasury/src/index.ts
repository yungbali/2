/**
 * Claude Forkoor - Treasury (FORK-Vault)
 * ========================================
 * Automated fee collection and buyback system
 * 
 * The Ralph Loop:
 * 1. Safe forks generate 0.5% transfer fees
 * 2. Fees accumulate in the treasury
 * 3. Every $1,000 in fees triggers a $FORK buyback
 * 4. Buybacks pump $FORK, increasing the "Safety Score"
 * 5. Higher Safety Score = More resources to monitor and fork
 */

export * from './collector.js';
export * from './buyback.js';
export * from './stats.js';

import { loadConfig, getConnection, logger, TREASURY_CHECK_INTERVAL_MS, BUYBACK_THRESHOLD_USD } from '@forkoor/core';
import { FeeCollector } from './collector.js';
import { BuybackExecutor } from './buyback.js';
import { TreasuryStatsManager } from './stats.js';

// ============================================
// Treasury Service
// ============================================

export class TreasuryService {
  private collector: FeeCollector;
  private buyback: BuybackExecutor;
  private stats: TreasuryStatsManager;
  private running: boolean = false;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    const config = loadConfig();
    const connection = getConnection(config);
    
    this.collector = new FeeCollector(connection, config);
    this.buyback = new BuybackExecutor(connection, config);
    this.stats = new TreasuryStatsManager();
  }

  /**
   * Start the treasury service
   */
  async start(): Promise<void> {
    if (this.running) {
      logger.warn('Treasury service is already running');
      return;
    }

    logger.info('Starting Claude Forkoor Treasury Service...');
    logger.info('💰 The Ralph Loop is engaged. Fees → Buybacks → Growth.');
    
    this.running = true;

    // Initial check
    await this.checkAndExecute();

    // Set up periodic checks
    this.checkInterval = setInterval(
      () => this.checkAndExecute(),
      TREASURY_CHECK_INTERVAL_MS
    );

    logger.success('Treasury service started');
  }

  /**
   * Stop the treasury service
   */
  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }

    logger.info('Stopping treasury service...');
    this.running = false;

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    logger.success('Treasury service stopped');
  }

  /**
   * Check fees and execute buyback if threshold reached
   */
  private async checkAndExecute(): Promise<void> {
    try {
      logger.info('Checking treasury balance...');

      // Collect pending fees from all forked tokens
      const collectedFees = await this.collector.collectAllPendingFees();
      
      if (collectedFees > 0) {
        logger.success(`Collected ${collectedFees} in transfer fees`);
        this.stats.recordFeeCollection(collectedFees);
      }

      // Get current treasury balance in USD
      const balanceUsd = await this.collector.getTreasuryBalanceUsd();
      logger.info(`Treasury balance: $${balanceUsd.toFixed(2)} USD`);

      // Check if buyback threshold reached
      if (balanceUsd >= BUYBACK_THRESHOLD_USD) {
        logger.info(`🚀 Buyback threshold reached! Executing buyback...`);
        
        const result = await this.buyback.executeBuyback(balanceUsd);
        
        if (result) {
          this.stats.recordBuyback(result);
          logger.success(`Bought ${result.tokensBought} $FORK at avg price $${result.avgPrice.toFixed(6)}`);
        }
      } else {
        const remaining = BUYBACK_THRESHOLD_USD - balanceUsd;
        logger.info(`$${remaining.toFixed(2)} USD until next buyback`);
      }
    } catch (error) {
      logger.error('Treasury check failed:', error);
    }
  }

  /**
   * Get treasury statistics
   */
  getStats() {
    return this.stats.getStats();
  }

  /**
   * Manual buyback trigger (for testing or emergency)
   */
  async manualBuyback(amountUsd: number) {
    logger.info(`Manual buyback triggered: $${amountUsd} USD`);
    return this.buyback.executeBuyback(amountUsd);
  }
}

// Run if executed directly
if (require.main === module) {
  const service = new TreasuryService();
  
  process.on('SIGINT', async () => {
    await service.stop();
    process.exit(0);
  });
  
  service.start().catch((error) => {
    logger.error('Failed to start treasury service:', error);
    process.exit(1);
  });
}
