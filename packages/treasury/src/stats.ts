/**
 * Treasury Statistics Manager
 * ============================
 * Track and report treasury metrics
 */

import * as fs from 'fs';
import * as path from 'path';
import { logger } from '@forkoor/core';
import type { TreasuryStats, BuybackExecution } from '@forkoor/core';

// ============================================
// Stats Manager
// ============================================

export class TreasuryStatsManager {
  private stats: TreasuryStats;
  private history: BuybackExecution[] = [];
  private statsPath: string;

  constructor() {
    this.statsPath = path.join(process.cwd(), 'data', 'treasury-stats.json');
    this.stats = this.loadStats();
  }

  /**
   * Load stats from disk
   */
  private loadStats(): TreasuryStats {
    try {
      if (fs.existsSync(this.statsPath)) {
        const data = JSON.parse(fs.readFileSync(this.statsPath, 'utf8'));
        this.history = data.history || [];
        return data.stats;
      }
    } catch (error) {
      logger.warn('Could not load treasury stats, starting fresh');
    }

    return {
      totalFeesCollected: 0,
      totalFeesUsd: 0,
      totalBuybackAmount: 0,
      buybackCount: 0,
      lastBuybackAt: undefined,
      currentBalance: 0,
    };
  }

  /**
   * Save stats to disk
   */
  private saveStats(): void {
    try {
      const dir = path.dirname(this.statsPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(
        this.statsPath,
        JSON.stringify({ stats: this.stats, history: this.history }, null, 2)
      );
    } catch (error) {
      logger.error('Failed to save treasury stats:', error);
    }
  }

  /**
   * Record a fee collection
   */
  recordFeeCollection(amount: number, usdValue?: number): void {
    this.stats.totalFeesCollected += amount;
    if (usdValue) {
      this.stats.totalFeesUsd += usdValue;
    }
    this.saveStats();
  }

  /**
   * Record a buyback execution
   */
  recordBuyback(execution: BuybackExecution): void {
    this.stats.totalBuybackAmount += execution.tokensBought;
    this.stats.buybackCount += 1;
    this.stats.lastBuybackAt = execution.timestamp;
    
    this.history.push(execution);
    
    // Keep only last 100 buybacks in history
    if (this.history.length > 100) {
      this.history = this.history.slice(-100);
    }
    
    this.saveStats();
  }

  /**
   * Update current balance
   */
  updateBalance(balance: number): void {
    this.stats.currentBalance = balance;
    this.saveStats();
  }

  /**
   * Get current stats
   */
  getStats(): TreasuryStats {
    return { ...this.stats };
  }

  /**
   * Get buyback history
   */
  getHistory(): BuybackExecution[] {
    return [...this.history];
  }

  /**
   * Get stats summary for display
   */
  getSummary(): string {
    const { stats } = this;
    const lastBuyback = stats.lastBuybackAt 
      ? new Date(stats.lastBuybackAt).toISOString()
      : 'Never';

    return `
╔═══════════════════════════════════════════════════════════════╗
║                    FORK-VAULT TREASURY STATS                  ║
╠═══════════════════════════════════════════════════════════════╣
║  Total Fees Collected:    ${stats.totalFeesCollected.toLocaleString().padStart(20)} tokens  ║
║  Total Fees (USD):        $${stats.totalFeesUsd.toFixed(2).padStart(19)}        ║
║  Total Buyback Amount:    ${stats.totalBuybackAmount.toLocaleString().padStart(20)} $FORK  ║
║  Buyback Count:           ${stats.buybackCount.toString().padStart(20)}        ║
║  Last Buyback:            ${lastBuyback.padStart(20)}        ║
║  Current Balance:         ${stats.currentBalance.toFixed(2).padStart(20)}        ║
╚═══════════════════════════════════════════════════════════════╝`;
  }

  /**
   * Calculate average buyback price
   */
  getAverageBuybackPrice(): number {
    if (this.history.length === 0) return 0;
    
    const totalSpent = this.history.reduce((sum, b) => sum + b.amountSpent, 0);
    const totalBought = this.history.reduce((sum, b) => sum + b.tokensBought, 0);
    
    return totalBought > 0 ? totalSpent / totalBought : 0;
  }

  /**
   * Get stats for the last N days
   */
  getRecentStats(days: number = 7): {
    feesCollected: number;
    buybacks: number;
    tokensBought: number;
  } {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    const recentBuybacks = this.history.filter(b => b.timestamp >= cutoff);
    
    return {
      feesCollected: 0, // Would need fee history to track this
      buybacks: recentBuybacks.length,
      tokensBought: recentBuybacks.reduce((sum, b) => sum + b.tokensBought, 0),
    };
  }
}
