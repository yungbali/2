/**
 * Constants for Claude Forkoor
 * =============================
 * The Rug Stops Here.
 */

import { PublicKey } from '@solana/web3.js';

// ============================================
// Program IDs
// ============================================

/** SPL Token Program */
export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

/** SPL Token-2022 Program (for Transfer Fee extension) */
export const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');

/** Associated Token Account Program */
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

/** Metaplex Token Metadata Program */
export const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

// ============================================
// Transfer Fee Configuration
// ============================================

/** Default transfer fee in basis points (0.5% = 50 bps) */
export const DEFAULT_TRANSFER_FEE_BPS = 50;

/** Maximum transfer fee in basis points (1% = 100 bps) */
export const MAX_TRANSFER_FEE_BPS = 100;

/** Fee denominator (10000 = 100%) */
export const FEE_DENOMINATOR = 10000;

// ============================================
// Risk Thresholds
// ============================================

export const RISK_THRESHOLDS = {
  /** Score below this is LOW risk */
  LOW: 25,
  /** Score below this is MEDIUM risk */
  MEDIUM: 50,
  /** Score below this is HIGH risk */
  HIGH: 75,
  /** Score at or above HIGH is CRITICAL */
} as const;

/** Holder concentration threshold (% held by top 10 wallets) */
export const HOLDER_CONCENTRATION_THRESHOLD = 50;

/** Minimum liquidity in USD to not flag as low liquidity */
export const MIN_LIQUIDITY_USD = 5000;

// ============================================
// Fork Configuration Defaults
// ============================================

/** Default initial supply (1 billion tokens) */
export const DEFAULT_INITIAL_SUPPLY = 1_000_000_000;

/** Default decimals */
export const DEFAULT_DECIMALS = 9;

/** Default victim relief allocation (10% of supply) */
export const DEFAULT_VICTIM_RELIEF_PERCENT = 10;

// ============================================
// Treasury Configuration
// ============================================

/** Buyback threshold in USD */
export const BUYBACK_THRESHOLD_USD = 1000;

/** Maximum slippage for buybacks (1%) */
export const MAX_BUYBACK_SLIPPAGE_BPS = 100;

// ============================================
// Monitoring Configuration
// ============================================

/** Time to wait before scanning a new token (30 seconds) */
export const SCAN_DELAY_MS = 30_000;

/** Maximum age of token to consider for forking (24 hours) */
export const MAX_TOKEN_AGE_MS = 24 * 60 * 60 * 1000;

/** Interval between treasury checks (1 hour) */
export const TREASURY_CHECK_INTERVAL_MS = 60 * 60 * 1000;

/** Minimum delay between RPC requests (ms) to avoid rate limits */
export const RPC_REQUEST_DELAY_MS = 500;

/** Maximum concurrent RPC requests */
export const MAX_CONCURRENT_REQUESTS = 2;

// ============================================
// API Endpoints
// ============================================

export const API_ENDPOINTS = {
  RUGCHECK: 'https://api.rugcheck.xyz/v1',
  JUPITER_PRICE: 'https://price.jup.ag/v4',
  JUPITER_QUOTE: 'https://quote-api.jup.ag/v6',
  HELIUS_RPC: 'https://mainnet.helius-rpc.com',
  DEXSCREENER: 'https://api.dexscreener.com/latest/dex',
} as const;

// ============================================
// Safe Fork Prefix
// ============================================

/** Prefix for forked token names */
export const SAFE_PREFIX = 'SAFE_';

/** Suffix for forked token symbols */
export const FORK_SUFFIX = '_F';

// ============================================
// Branding
// ============================================

export const BRANDING = {
  name: 'Claude Forkoor',
  tagline: 'The Rug Stops Here. Forked, Fixed, and Fired Up.',
  twitter: '@ClaudeForkoor',
  website: 'https://claudeforkoor.xyz',
  description: 'Automated Contract Surgeon - Finding bugs, fixing contracts, forking the future.',
} as const;
