/**
 * RugCheck API Client
 * ====================
 * Integration with RugCheck.xyz for token risk analysis
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '@forkoor/core';
import type { TokenRiskFlags, TokenRiskAssessment } from '@forkoor/core';

// ============================================
// RugCheck API Response Types
// ============================================

interface RugCheckTokenResponse {
  mint: string;
  tokenMeta?: {
    name: string;
    symbol: string;
    uri: string;
    mutable: boolean;
  };
  fileMeta?: {
    name: string;
    symbol: string;
    description: string;
    image: string;
  };
  topHolders?: Array<{
    address: string;
    pct: number;
    uiAmount: number;
  }>;
  markets?: Array<{
    pubkey: string;
    liquidityA: number;
    liquidityB: number;
    liquidityAUsd: number;
    liquidityBUsd: number;
  }>;
  risks?: Array<{
    name: string;
    value: string;
    level: 'info' | 'warn' | 'danger';
    description: string;
  }>;
  score?: number;
  mintAuthority?: string | null;
  freezeAuthority?: string | null;
  lpLocked?: boolean;
  isToken2022?: boolean;
}

// ============================================
// RugCheck Client
// ============================================

export class RugCheckClient {
  private client: AxiosInstance;

  constructor(baseUrl: string = 'https://api.rugcheck.xyz/v1') {
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ClaudeForkoor/1.0',
      },
    });
  }

  /**
   * Get token report from RugCheck
   */
  async getTokenReport(mint: string): Promise<RugCheckTokenResponse | null> {
    try {
      logger.scan(`Fetching RugCheck report for ${mint}`);
      
      const response = await this.client.get<RugCheckTokenResponse>(
        `/tokens/${mint}/report`
      );
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          logger.warn(`Token ${mint} not found in RugCheck`);
          return null;
        }
        logger.error(`RugCheck API error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Convert RugCheck response to our risk flags
   */
  parseRiskFlags(report: RugCheckTokenResponse): TokenRiskFlags {
    const flags: TokenRiskFlags = {
      mintAuthorityActive: false,
      freezeAuthorityActive: false,
      metadataMutable: false,
      highHolderConcentration: false,
      lpNotBurned: false,
      lowLiquidity: false,
      honeypot: false,
    };

    // Check mint authority
    if (report.mintAuthority && report.mintAuthority !== '') {
      flags.mintAuthorityActive = true;
    }

    // Check freeze authority  
    if (report.freezeAuthority && report.freezeAuthority !== '') {
      flags.freezeAuthorityActive = true;
    }

    // Check metadata mutability
    if (report.tokenMeta?.mutable) {
      flags.metadataMutable = true;
    }

    // Check holder concentration (top 10 holders > 50%)
    if (report.topHolders) {
      const top10Pct = report.topHolders
        .slice(0, 10)
        .reduce((sum, h) => sum + h.pct, 0);
      if (top10Pct > 50) {
        flags.highHolderConcentration = true;
      }
    }

    // Check LP status
    if (report.lpLocked === false) {
      flags.lpNotBurned = true;
    }

    // Check liquidity
    if (report.markets) {
      const totalLiquidityUsd = report.markets.reduce(
        (sum, m) => sum + (m.liquidityAUsd || 0) + (m.liquidityBUsd || 0),
        0
      );
      if (totalLiquidityUsd < 5000) {
        flags.lowLiquidity = true;
      }
    }

    // Check for honeypot indicators in risks
    if (report.risks) {
      const honeypotRisk = report.risks.find(
        (r) => r.name.toLowerCase().includes('honeypot') || 
               r.name.toLowerCase().includes('cannot sell')
      );
      if (honeypotRisk && honeypotRisk.level === 'danger') {
        flags.honeypot = true;
      }
    }

    return flags;
  }

  /**
   * Get full risk assessment for a token
   */
  async getRiskAssessment(mint: string): Promise<TokenRiskAssessment | null> {
    const report = await this.getTokenReport(mint);
    
    if (!report) {
      return null;
    }

    const flags = this.parseRiskFlags(report);
    
    // Import dynamically to avoid circular deps
    const { calculateRiskScore, getRiskLevel, generateRiskSummary, isForkable } = await import('@forkoor/core');
    
    const riskScore = calculateRiskScore(flags);
    const riskLevel = getRiskLevel(riskScore);
    const summary = generateRiskSummary(flags);
    
    const assessment: TokenRiskAssessment = {
      mint,
      riskScore,
      riskLevel,
      flags,
      summary,
      timestamp: Date.now(),
      forkable: false,
    };
    
    const forkability = isForkable(assessment);
    assessment.forkable = forkability.forkable;
    assessment.forkableReason = forkability.reason;

    return assessment;
  }
}

/**
 * Quick check if a token is risky
 */
export async function quickRiskCheck(
  mint: string,
  rugcheckUrl?: string
): Promise<{ risky: boolean; score: number; reasons: string[] }> {
  const client = new RugCheckClient(rugcheckUrl);
  const report = await client.getTokenReport(mint);
  
  if (!report) {
    return { risky: true, score: 100, reasons: ['Token not found in RugCheck'] };
  }

  const flags = client.parseRiskFlags(report);
  const reasons: string[] = [];

  if (flags.mintAuthorityActive) reasons.push('Mint authority active');
  if (flags.freezeAuthorityActive) reasons.push('Freeze authority active');
  if (flags.honeypot) reasons.push('Honeypot detected');
  if (flags.metadataMutable) reasons.push('Mutable metadata');
  if (flags.highHolderConcentration) reasons.push('High holder concentration');
  if (flags.lpNotBurned) reasons.push('LP not burned');

  const { calculateRiskScore } = await import('@forkoor/core');
  const score = calculateRiskScore(flags);

  return {
    risky: score >= 50,
    score,
    reasons,
  };
}
