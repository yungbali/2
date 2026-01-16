/**
 * Claude Forkoor - Rug Scanner (Sentinel)
 * ========================================
 * "I find the bugs. I fix the contracts. I fork the future."
 * 
 * Monitors new token launches and analyzes them for rug vectors.
 */

export * from './rugcheck.js';
export * from './analyzer.js';
export * from './monitor.js';

import { loadConfig, getConnection, logger } from '@forkoor/core';
import { TokenMonitor } from './monitor.js';
import { RugCheckClient } from './rugcheck.js';
import { TokenAnalyzer } from './analyzer.js';

/**
 * Main Scanner Service
 */
export class ScannerService {
  private monitor: TokenMonitor;
  private analyzer: TokenAnalyzer;
  private rugcheck: RugCheckClient;
  private running: boolean = false;

  constructor() {
    const config = loadConfig();
    const connection = getConnection(config);
    
    this.rugcheck = new RugCheckClient(config.api.rugcheckUrl);
    this.analyzer = new TokenAnalyzer(connection, this.rugcheck);
    this.monitor = new TokenMonitor(connection, config.monitoring.pumpfunWsUrl);
  }

  /**
   * Start the scanner service
   */
  async start(): Promise<void> {
    if (this.running) {
      logger.warn('Scanner is already running');
      return;
    }

    logger.info('Starting Claude Forkoor Scanner Service...');
    logger.info('🔍 The Rug Stops Here. Forked, Fixed, and Fired Up.');
    
    this.running = true;

    // Set up event handlers
    this.monitor.on('newToken', async (event) => {
      logger.scan(`New token detected: ${event.name} (${event.symbol})`);
      logger.scan(`Mint: ${event.mint}`);
      logger.scan(`Platform: ${event.platform}`);
      
      // Analyze the token
      try {
        const assessment = await this.analyzer.analyze(event.mint);
        
        logger.scan(`Risk Score: ${assessment.riskScore}/100 (${assessment.riskLevel})`);
        
        if (assessment.forkable) {
          logger.fork(`🎯 FORKABLE TARGET IDENTIFIED: ${event.symbol}`);
          logger.fork(assessment.summary);
          
          // Emit fork opportunity event
          this.monitor.emit('forkOpportunity', {
            original: event,
            assessment,
          });
        }
      } catch (error) {
        logger.error(`Failed to analyze ${event.mint}:`, error);
      }
    });

    // Start monitoring
    await this.monitor.start();
    
    logger.success('Scanner service started successfully');
  }

  /**
   * Stop the scanner service
   */
  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }

    logger.info('Stopping scanner service...');
    this.running = false;
    await this.monitor.stop();
    logger.success('Scanner service stopped');
  }

  /**
   * Manually scan a specific token
   */
  async scanToken(mint: string) {
    logger.scan(`Manual scan requested for: ${mint}`);
    return this.analyzer.analyze(mint);
  }

  /**
   * Get the monitor instance for event subscriptions
   */
  getMonitor(): TokenMonitor {
    return this.monitor;
  }
}

// Run if executed directly
const isMainModule = require.main === module || process.argv[1]?.includes('scanner');

if (isMainModule) {
  const scanner = new ScannerService();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    await scanner.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    await scanner.stop();
    process.exit(0);
  });
  
  scanner.start().catch((error) => {
    logger.error('Failed to start scanner:', error);
    process.exit(1);
  });
}
