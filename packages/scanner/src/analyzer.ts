/**
 * Token Analyzer
 * ===============
 * Deep analysis of token contracts for rug vectors
 */

import { Connection, PublicKey } from '@solana/web3.js';
import { getMint, getAccount, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { RugCheckClient } from './rugcheck.js';
import { 
  logger, 
  calculateRiskScore, 
  getRiskLevel, 
  generateRiskSummary,
  isForkable,
  METADATA_PROGRAM_ID,
} from '@forkoor/core';
import type { TokenRiskFlags, TokenRiskAssessment, TokenMetadata } from '@forkoor/core';

// ============================================
// Token Analyzer
// ============================================

export class TokenAnalyzer {
  private connection: Connection;
  private rugcheck: RugCheckClient;

  constructor(connection: Connection, rugcheck: RugCheckClient) {
    this.connection = connection;
    this.rugcheck = rugcheck;
  }

  /**
   * Perform comprehensive analysis on a token
   */
  async analyze(mint: string): Promise<TokenRiskAssessment> {
    logger.scan(`Analyzing token: ${mint}`);
    
    // Try RugCheck first for quick analysis
    const rugcheckAssessment = await this.rugcheck.getRiskAssessment(mint);
    
    if (rugcheckAssessment) {
      // Enhance with on-chain verification
      const onChainFlags = await this.getOnChainFlags(mint);
      
      // Merge flags (on-chain takes precedence)
      const mergedFlags: TokenRiskFlags = {
        ...rugcheckAssessment.flags,
        ...onChainFlags,
      };
      
      const riskScore = calculateRiskScore(mergedFlags);
      const riskLevel = getRiskLevel(riskScore);
      const summary = generateRiskSummary(mergedFlags);
      
      const assessment: TokenRiskAssessment = {
        mint,
        riskScore,
        riskLevel,
        flags: mergedFlags,
        summary,
        timestamp: Date.now(),
        forkable: false,
      };
      
      const forkability = isForkable(assessment);
      assessment.forkable = forkability.forkable;
      assessment.forkableReason = forkability.reason;
      
      return assessment;
    }
    
    // Fallback to pure on-chain analysis
    return this.analyzeOnChain(mint);
  }

  /**
   * Get risk flags directly from on-chain data
   */
  async getOnChainFlags(mint: string): Promise<Partial<TokenRiskFlags>> {
    const flags: Partial<TokenRiskFlags> = {};
    
    try {
      const mintPubkey = new PublicKey(mint);
      
      // Try Token-2022 first, then regular SPL Token
      let mintInfo;
      let isToken2022 = false;
      
      try {
        mintInfo = await getMint(this.connection, mintPubkey, 'confirmed', TOKEN_2022_PROGRAM_ID);
        isToken2022 = true;
      } catch {
        mintInfo = await getMint(this.connection, mintPubkey, 'confirmed', TOKEN_PROGRAM_ID);
      }
      
      // Check mint authority
      if (mintInfo.mintAuthority) {
        flags.mintAuthorityActive = true;
        logger.scan(`⚠️ Mint authority active: ${mintInfo.mintAuthority.toBase58()}`);
      } else {
        flags.mintAuthorityActive = false;
        logger.scan(`✅ Mint authority revoked`);
      }
      
      // Check freeze authority
      if (mintInfo.freezeAuthority) {
        flags.freezeAuthorityActive = true;
        logger.scan(`⚠️ Freeze authority active: ${mintInfo.freezeAuthority.toBase58()}`);
      } else {
        flags.freezeAuthorityActive = false;
        logger.scan(`✅ Freeze authority revoked`);
      }
      
      // Check metadata mutability
      const metadataMutable = await this.checkMetadataMutability(mint);
      if (metadataMutable !== null) {
        flags.metadataMutable = metadataMutable;
      }
      
    } catch (error) {
      logger.error(`Failed to get on-chain data for ${mint}:`, error);
    }
    
    return flags;
  }

  /**
   * Check if token metadata is mutable
   */
  async checkMetadataMutability(mint: string): Promise<boolean | null> {
    try {
      const mintPubkey = new PublicKey(mint);
      
      // Derive metadata PDA
      const [metadataPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          METADATA_PROGRAM_ID.toBuffer(),
          mintPubkey.toBuffer(),
        ],
        METADATA_PROGRAM_ID
      );
      
      const accountInfo = await this.connection.getAccountInfo(metadataPDA);
      
      if (!accountInfo) {
        return null;
      }
      
      // The isMutable flag is typically at offset 1 after the key field
      // This is a simplified check - full parsing would use Metaplex SDK
      const data = accountInfo.data;
      
      // Metadata V1 structure: key (1) + updateAuthority (32) + mint (32) + data...
      // isMutable is typically near offset 326-327 in V1
      // This is an approximation - for production, use proper deserialization
      if (data.length > 326) {
        const isMutableByte = data[326];
        return isMutableByte === 1;
      }
      
      return null;
    } catch (error) {
      logger.warn(`Could not check metadata mutability: ${error}`);
      return null;
    }
  }

  /**
   * Perform analysis using only on-chain data
   */
  async analyzeOnChain(mint: string): Promise<TokenRiskAssessment> {
    logger.scan(`Performing on-chain analysis for ${mint}`);
    
    const flags: TokenRiskFlags = {
      mintAuthorityActive: false,
      freezeAuthorityActive: false,
      metadataMutable: false,
      highHolderConcentration: false,
      lpNotBurned: false,
      lowLiquidity: false,
      honeypot: false,
    };
    
    const onChainFlags = await this.getOnChainFlags(mint);
    Object.assign(flags, onChainFlags);
    
    // Check holder concentration
    const holderConcentration = await this.checkHolderConcentration(mint);
    if (holderConcentration !== null) {
      flags.highHolderConcentration = holderConcentration > 50;
    }
    
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

  /**
   * Check holder concentration (% held by top 10)
   */
  async checkHolderConcentration(mint: string): Promise<number | null> {
    try {
      const mintPubkey = new PublicKey(mint);
      
      // Get largest token accounts
      const largestAccounts = await this.connection.getTokenLargestAccounts(mintPubkey);
      
      if (!largestAccounts.value || largestAccounts.value.length === 0) {
        return null;
      }
      
      // Get total supply
      const mintInfo = await getMint(this.connection, mintPubkey);
      const totalSupply = Number(mintInfo.supply);
      
      if (totalSupply === 0) {
        return null;
      }
      
      // Calculate top 10 concentration
      const top10Amount = largestAccounts.value
        .slice(0, 10)
        .reduce((sum, account) => sum + Number(account.amount), 0);
      
      const concentration = (top10Amount / totalSupply) * 100;
      
      logger.scan(`Top 10 holder concentration: ${concentration.toFixed(2)}%`);
      
      return concentration;
    } catch (error) {
      logger.warn(`Could not check holder concentration: ${error}`);
      return null;
    }
  }

  /**
   * Get token metadata
   */
  async getTokenMetadata(mint: string): Promise<TokenMetadata | null> {
    try {
      const mintPubkey = new PublicKey(mint);
      
      // Derive metadata PDA
      const [metadataPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          METADATA_PROGRAM_ID.toBuffer(),
          mintPubkey.toBuffer(),
        ],
        METADATA_PROGRAM_ID
      );
      
      const accountInfo = await this.connection.getAccountInfo(metadataPDA);
      
      if (!accountInfo) {
        return null;
      }
      
      // For proper metadata parsing, we'd use Metaplex SDK
      // This is a simplified extraction
      const data = accountInfo.data;
      
      // Parse the name (starts at offset 65, 4-byte length prefix + string)
      let offset = 65;
      const nameLength = data.readUInt32LE(offset);
      offset += 4;
      const name = data.subarray(offset, offset + nameLength).toString('utf8').replace(/\0/g, '').trim();
      offset += nameLength;
      
      // Parse symbol
      const symbolLength = data.readUInt32LE(offset);
      offset += 4;
      const symbol = data.subarray(offset, offset + symbolLength).toString('utf8').replace(/\0/g, '').trim();
      offset += symbolLength;
      
      // Parse URI
      const uriLength = data.readUInt32LE(offset);
      offset += 4;
      const uri = data.subarray(offset, offset + uriLength).toString('utf8').replace(/\0/g, '').trim();
      
      // Get decimals from mint
      const mintInfo = await getMint(this.connection, mintPubkey);
      
      return {
        name,
        symbol,
        uri,
        decimals: mintInfo.decimals,
      };
    } catch (error) {
      logger.error(`Failed to get metadata for ${mint}:`, error);
      return null;
    }
  }
}
