/**
 * Core Types for Claude Forkoor
 * ==============================
 */

import { PublicKey } from '@solana/web3.js';

// ============================================
// Token Risk Assessment Types
// ============================================

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TokenRiskFlags {
  /** Mint authority is still active - can print unlimited tokens */
  mintAuthorityActive: boolean;
  /** Freeze authority is active - can freeze any wallet */
  freezeAuthorityActive: boolean;
  /** Metadata is mutable - can change token identity */
  metadataMutable: boolean;
  /** High concentration in top holders */
  highHolderConcentration: boolean;
  /** LP tokens not burned */
  lpNotBurned: boolean;
  /** Very low liquidity */
  lowLiquidity: boolean;
  /** Token is honeypot (can't sell) */
  honeypot: boolean;
}

export interface TokenRiskAssessment {
  /** Token mint address */
  mint: string;
  /** Overall risk score (0-100, higher = riskier) */
  riskScore: number;
  /** Risk level classification */
  riskLevel: RiskLevel;
  /** Individual risk flags */
  flags: TokenRiskFlags;
  /** Human-readable risk summary */
  summary: string;
  /** Timestamp of assessment */
  timestamp: number;
  /** Is this token forkable by Claude? */
  forkable: boolean;
  /** Reason if not forkable */
  forkableReason?: string;
}

// ============================================
// Token Metadata Types
// ============================================

export interface TokenMetadata {
  /** Token name */
  name: string;
  /** Token symbol */
  symbol: string;
  /** Token URI (usually IPFS) */
  uri: string;
  /** Decimals */
  decimals: number;
  /** Image URL (resolved from URI) */
  image?: string;
  /** Description */
  description?: string;
  /** External URL */
  externalUrl?: string;
  /** Additional attributes */
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface ClonedMetadata extends TokenMetadata {
  /** Original token mint this was cloned from */
  originalMint: string;
  /** Indicates this is a safe fork */
  isSafeFork: boolean;
  /** Fork timestamp */
  forkedAt: number;
}

// ============================================
// Fork Configuration Types
// ============================================

export interface ForkConfig {
  /** Original token to fork */
  originalMint: string;
  /** New token name (defaults to SAFE_{original}) */
  name?: string;
  /** New token symbol (defaults to SAFE_{original}) */
  symbol?: string;
  /** Initial supply (defaults to 1 billion) */
  initialSupply?: number;
  /** Decimals (defaults to 9) */
  decimals?: number;
  /** Transfer fee in basis points (default 50 = 0.5%) */
  transferFeeBps?: number;
  /** Treasury wallet for fees */
  treasuryWallet: string;
  /** Victim relief allocation percentage (default 10%) */
  victimReliefPercent?: number;
}

export interface ForkResult {
  /** New safe token mint address */
  mint: string;
  /** Deployment transaction signature */
  deployTx: string;
  /** Authority revocation transaction signature */
  revokeTx: string;
  /** Metadata update transaction signature */
  metadataTx: string;
  /** Fork configuration used */
  config: ForkConfig;
  /** Timestamp of fork */
  timestamp: number;
}

// ============================================
// Migration Hub Types
// ============================================

export interface VictimClaim {
  /** Victim wallet address */
  wallet: string;
  /** Original rugged token mint */
  originalMint: string;
  /** Amount held at time of rug */
  originalBalance: number;
  /** Safe fork token mint */
  forkMint: string;
  /** Allocated tokens in fork */
  allocation: number;
  /** Claim status */
  status: 'PENDING' | 'VERIFIED' | 'CLAIMED' | 'REJECTED';
  /** Claim transaction signature (if claimed) */
  claimTx?: string;
  /** Verification timestamp */
  verifiedAt?: number;
  /** Claim timestamp */
  claimedAt?: number;
}

export interface MigrationPool {
  /** Original rugged token */
  originalMint: string;
  /** Safe fork token */
  forkMint: string;
  /** Total tokens allocated for victims */
  totalAllocation: number;
  /** Tokens remaining for claims */
  remainingAllocation: number;
  /** Number of verified victims */
  verifiedVictims: number;
  /** Number of claims processed */
  claimsProcessed: number;
  /** Pool status */
  status: 'ACTIVE' | 'EXHAUSTED' | 'CLOSED';
  /** Creation timestamp */
  createdAt: number;
}

// ============================================
// Treasury Types
// ============================================

export interface TreasuryStats {
  /** Total fees collected (in FORK tokens) */
  totalFeesCollected: number;
  /** Total USD value of fees collected */
  totalFeesUsd: number;
  /** Total buyback amount (in FORK) */
  totalBuybackAmount: number;
  /** Number of buybacks executed */
  buybackCount: number;
  /** Last buyback timestamp */
  lastBuybackAt?: number;
  /** Current treasury balance */
  currentBalance: number;
}

export interface BuybackExecution {
  /** Amount spent on buyback */
  amountSpent: number;
  /** FORK tokens bought */
  tokensBought: number;
  /** Average price per token */
  avgPrice: number;
  /** Transaction signature */
  txSignature: string;
  /** Timestamp */
  timestamp: number;
}

// ============================================
// Monitoring Types
// ============================================

export interface TokenLaunchEvent {
  /** Token mint address */
  mint: string;
  /** Token name */
  name: string;
  /** Token symbol */
  symbol: string;
  /** Launch platform */
  platform: 'PUMPFUN' | 'RAYDIUM' | 'ORCA' | 'OTHER';
  /** Launch timestamp */
  timestamp: number;
  /** Initial liquidity */
  initialLiquidity: number;
  /** Creator wallet */
  creator: string;
}

export interface RugEvent {
  /** Token mint address */
  mint: string;
  /** Type of rug */
  type: 'MINT_DUMP' | 'LP_PULL' | 'FREEZE' | 'HONEYPOT' | 'OTHER';
  /** Estimated loss in USD */
  estimatedLossUsd: number;
  /** Number of affected wallets */
  affectedWallets: number;
  /** Detection timestamp */
  detectedAt: number;
  /** Evidence (transaction signatures) */
  evidence: string[];
}
