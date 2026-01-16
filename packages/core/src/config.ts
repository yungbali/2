/**
 * Configuration Management for Claude Forkoor
 * =============================================
 */

import { Connection, Keypair } from '@solana/web3.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ============================================
// Environment Configuration
// ============================================

export interface ForkoorConfig {
  solana: {
    rpcUrl: string;
    wsUrl: string;
    commitment: 'processed' | 'confirmed' | 'finalized';
  };
  deployer: {
    privateKey: string | null;
  };
  treasury: {
    forkTokenMint: string | null;
    treasuryWallet: string | null;
    buybackThresholdUsd: number;
  };
  api: {
    rugcheckUrl: string;
  };
  monitoring: {
    pumpfunWsUrl: string | null;
  };
}

/**
 * Load configuration from environment
 */
export function loadConfig(): ForkoorConfig {
  return {
    solana: {
      rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
      wsUrl: process.env.SOLANA_WS_URL || 'wss://api.mainnet-beta.solana.com',
      commitment: 'confirmed',
    },
    deployer: {
      privateKey: process.env.DEPLOYER_PRIVATE_KEY || null,
    },
    treasury: {
      forkTokenMint: process.env.FORK_TOKEN_MINT || null,
      treasuryWallet: process.env.TREASURY_WALLET || null,
      buybackThresholdUsd: parseInt(process.env.BUYBACK_THRESHOLD_USD || '1000', 10),
    },
    api: {
      rugcheckUrl: process.env.RUGCHECK_API_URL || 'https://api.rugcheck.xyz/v1',
    },
    monitoring: {
      pumpfunWsUrl: process.env.PUMPFUN_WS_URL || null,
    },
  };
}

/**
 * Get Solana connection
 */
export function getConnection(config?: ForkoorConfig): Connection {
  const cfg = config || loadConfig();
  return new Connection(cfg.solana.rpcUrl, {
    commitment: cfg.solana.commitment,
    wsEndpoint: cfg.solana.wsUrl,
  });
}

/**
 * Get deployer keypair from private key
 */
export function getDeployerKeypair(config?: ForkoorConfig): Keypair | null {
  const cfg = config || loadConfig();
  
  if (!cfg.deployer.privateKey) {
    return null;
  }
  
  try {
    // Handle base58 encoded private key
    const { decode } = require('bs58');
    const secretKey = decode(cfg.deployer.privateKey);
    return Keypair.fromSecretKey(secretKey);
  } catch {
    try {
      // Handle JSON array format
      const secretKey = new Uint8Array(JSON.parse(cfg.deployer.privateKey));
      return Keypair.fromSecretKey(secretKey);
    } catch {
      console.error('Failed to parse deployer private key');
      return null;
    }
  }
}

/**
 * Validate configuration
 */
export function validateConfig(config: ForkoorConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.solana.rpcUrl) {
    errors.push('SOLANA_RPC_URL is required');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
