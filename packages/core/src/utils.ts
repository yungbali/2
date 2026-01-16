/**
 * Utility Functions for Claude Forkoor
 * =====================================
 */

import { PublicKey, Connection, Keypair } from '@solana/web3.js';
import { RISK_THRESHOLDS, SAFE_PREFIX, FORK_SUFFIX } from './constants.js';
import type { RiskLevel, TokenRiskFlags, TokenRiskAssessment } from './types.js';

// ============================================
// Risk Calculation
// ============================================

/**
 * Calculate risk score from flags
 */
export function calculateRiskScore(flags: TokenRiskFlags): number {
  let score = 0;
  
  // Critical flags (highest weight)
  if (flags.mintAuthorityActive) score += 35;
  if (flags.freezeAuthorityActive) score += 25;
  if (flags.honeypot) score += 40;
  
  // High risk flags
  if (flags.metadataMutable) score += 10;
  if (flags.highHolderConcentration) score += 15;
  
  // Medium risk flags
  if (flags.lpNotBurned) score += 10;
  if (flags.lowLiquidity) score += 5;
  
  return Math.min(100, score);
}

/**
 * Get risk level from score
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score < RISK_THRESHOLDS.LOW) return 'LOW';
  if (score < RISK_THRESHOLDS.MEDIUM) return 'MEDIUM';
  if (score < RISK_THRESHOLDS.HIGH) return 'HIGH';
  return 'CRITICAL';
}

/**
 * Generate human-readable risk summary
 */
export function generateRiskSummary(flags: TokenRiskFlags): string {
  const issues: string[] = [];
  
  if (flags.mintAuthorityActive) {
    issues.push('⚠️ MINT AUTHORITY ACTIVE - Developer can print unlimited tokens');
  }
  if (flags.freezeAuthorityActive) {
    issues.push('🥶 FREEZE AUTHORITY ACTIVE - Developer can freeze any wallet');
  }
  if (flags.honeypot) {
    issues.push('🍯 HONEYPOT DETECTED - Selling is restricted or impossible');
  }
  if (flags.metadataMutable) {
    issues.push('📝 Metadata is mutable - Token identity can be changed');
  }
  if (flags.highHolderConcentration) {
    issues.push('🐋 High holder concentration - Whale dump risk');
  }
  if (flags.lpNotBurned) {
    issues.push('💧 LP tokens not burned - Liquidity can be pulled');
  }
  if (flags.lowLiquidity) {
    issues.push('📉 Low liquidity - High slippage risk');
  }
  
  if (issues.length === 0) {
    return '✅ No significant risks detected';
  }
  
  return issues.join('\n');
}

/**
 * Check if a token is forkable
 */
export function isForkable(assessment: TokenRiskAssessment): { forkable: boolean; reason?: string } {
  // Only fork HIGH or CRITICAL risk tokens
  if (assessment.riskLevel === 'LOW') {
    return { forkable: false, reason: 'Token is low risk - no need to fork' };
  }
  
  // Must have at least one critical flaw
  const { flags } = assessment;
  if (!flags.mintAuthorityActive && !flags.freezeAuthorityActive && !flags.honeypot) {
    return { forkable: false, reason: 'No critical flaws that can be fixed via fork' };
  }
  
  return { forkable: true };
}

// ============================================
// Naming Utilities
// ============================================

/**
 * Generate safe fork name from original
 */
export function generateSafeName(originalName: string): string {
  // Remove any existing "SAFE" prefix
  const cleanName = originalName.replace(/^SAFE[_\s]*/i, '');
  return `${SAFE_PREFIX}${cleanName}`;
}

/**
 * Generate safe fork symbol from original
 */
export function generateSafeSymbol(originalSymbol: string): string {
  // Remove any existing "_F" suffix
  const cleanSymbol = originalSymbol.replace(/_F$/i, '');
  // Ensure symbol isn't too long (max 10 chars)
  const maxBase = 10 - FORK_SUFFIX.length;
  const truncated = cleanSymbol.slice(0, maxBase);
  return `${truncated}${FORK_SUFFIX}`;
}

// ============================================
// Solana Utilities
// ============================================

/**
 * Validate Solana public key
 */
export function isValidPublicKey(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Shorten address for display
 */
export function shortenAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Convert lamports to SOL
 */
export function lamportsToSol(lamports: number): number {
  return lamports / 1_000_000_000;
}

/**
 * Convert SOL to lamports
 */
export function solToLamports(sol: number): number {
  return Math.floor(sol * 1_000_000_000);
}

/**
 * Format token amount with decimals
 */
export function formatTokenAmount(amount: number, decimals: number): string {
  const value = amount / Math.pow(10, decimals);
  return value.toLocaleString('en-US', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  });
}

// ============================================
// Time Utilities
// ============================================

/**
 * Get relative time string
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// Logging Utilities
// ============================================

const LOG_COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
} as const;

/**
 * Logger with Claude Forkoor branding
 */
export const logger = {
  info: (message: string, ...args: unknown[]) => {
    console.log(`${LOG_COLORS.cyan}[FORKOOR]${LOG_COLORS.reset} ${message}`, ...args);
  },
  success: (message: string, ...args: unknown[]) => {
    console.log(`${LOG_COLORS.green}[FORKOOR ✓]${LOG_COLORS.reset} ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.log(`${LOG_COLORS.yellow}[FORKOOR ⚠]${LOG_COLORS.reset} ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    console.log(`${LOG_COLORS.red}[FORKOOR ✗]${LOG_COLORS.reset} ${message}`, ...args);
  },
  scan: (message: string, ...args: unknown[]) => {
    console.log(`${LOG_COLORS.magenta}[SCANNER]${LOG_COLORS.reset} ${message}`, ...args);
  },
  fork: (message: string, ...args: unknown[]) => {
    console.log(`${LOG_COLORS.blue}[FORKER]${LOG_COLORS.reset} ${message}`, ...args);
  },
};
