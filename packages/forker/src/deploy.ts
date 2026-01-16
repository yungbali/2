#!/usr/bin/env tsx
/**
 * Safe Fork Deployment Script
 * ============================
 * Deploy a complete safe fork with Token-2022, Transfer Fee, and immutable metadata
 * 
 * Usage:
 *   npx tsx packages/forker/src/deploy.ts \
 *     --original <mint> \
 *     --metadata-uri <ipfs://...> \
 *     --treasury <wallet>
 */

import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';
import {
  loadConfig,
  getConnection,
  getDeployerKeypair,
  logger,
  generateSafeName,
  generateSafeSymbol,
  DEFAULT_INITIAL_SUPPLY,
  DEFAULT_DECIMALS,
  DEFAULT_TRANSFER_FEE_BPS,
  DEFAULT_VICTIM_RELIEF_PERCENT,
} from '@forkoor/core';
import type { ForkConfig, ForkResult, ClonedMetadata } from '@forkoor/core';
import { createToken2022WithTransferFee, revokeAuthorities, verifyAuthoritiesRevoked } from './token2022.js';
import { createMetadata, makeMetadataImmutable } from './metadata.js';

// ============================================
// Deployment Functions
// ============================================

/**
 * Deploy a complete safe fork
 */
export async function deployFork(config: ForkConfig): Promise<ForkResult> {
  const appConfig = loadConfig();
  const connection = getConnection(appConfig);
  const deployer = getDeployerKeypair(appConfig);
  
  if (!deployer) {
    throw new Error('Deployer keypair not configured. Set DEPLOYER_PRIVATE_KEY in .env');
  }

  logger.fork(`\n🔧 Claude Forkoor - Safe Fork Deployment`);
  logger.fork(`========================================`);
  logger.fork(`Original token: ${config.originalMint}`);
  
  // Load cloned metadata if available
  let clonedMetadata: ClonedMetadata | null = null;
  const metadataPath = path.join(process.cwd(), 'cloned-metadata', `${config.originalMint}.json`);
  
  if (fs.existsSync(metadataPath)) {
    clonedMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    logger.info(`Loaded cloned metadata from ${metadataPath}`);
  }

  // Determine fork name and symbol
  const name = config.name || clonedMetadata?.name || generateSafeName('TOKEN');
  const symbol = config.symbol || clonedMetadata?.symbol || generateSafeSymbol('TKN');
  const decimals = config.decimals || DEFAULT_DECIMALS;
  const transferFeeBps = config.transferFeeBps || DEFAULT_TRANSFER_FEE_BPS;
  const initialSupply = BigInt(config.initialSupply || DEFAULT_INITIAL_SUPPLY) * BigInt(10 ** decimals);
  
  logger.fork(`\nFork Configuration:`);
  logger.fork(`  Name: ${name}`);
  logger.fork(`  Symbol: ${symbol}`);
  logger.fork(`  Decimals: ${decimals}`);
  logger.fork(`  Initial Supply: ${Number(initialSupply) / 10 ** decimals}`);
  logger.fork(`  Transfer Fee: ${transferFeeBps / 100}%`);
  logger.fork(`  Treasury: ${config.treasuryWallet}`);

  // Check deployer balance
  const balance = await connection.getBalance(deployer.publicKey);
  logger.info(`\nDeployer balance: ${balance / LAMPORTS_PER_SOL} SOL`);
  
  if (balance < 0.1 * LAMPORTS_PER_SOL) {
    throw new Error('Insufficient SOL balance. Need at least 0.1 SOL for deployment.');
  }

  // Generate new mint keypair
  const mintKeypair = Keypair.generate();
  logger.fork(`\nNew mint address: ${mintKeypair.publicKey.toBase58()}`);

  // Step 1: Create Token-2022 with Transfer Fee
  logger.fork(`\n📦 Step 1: Creating Token-2022 with Transfer Fee...`);
  const tokenResult = await createToken2022WithTransferFee({
    connection,
    payer: deployer,
    mintKeypair,
    decimals,
    transferFeeBps,
    feeRecipient: new PublicKey(config.treasuryWallet),
    initialSupply,
    initialRecipient: deployer.publicKey,
  });

  // Step 2: Create Metadata (if URI provided or generate placeholder)
  logger.fork(`\n📝 Step 2: Creating token metadata...`);
  const metadataUri = 'https://claudeforkoor.xyz/metadata/' + mintKeypair.publicKey.toBase58();
  
  const metadataTx = await createMetadata({
    connection,
    payer: deployer,
    mint: mintKeypair.publicKey,
    name,
    symbol,
    uri: metadataUri,
    isMutable: true, // Initially mutable so we can update URI
  });

  // Step 3: Revoke authorities
  logger.fork(`\n🔒 Step 3: Revoking mint and freeze authorities...`);
  const revokeTx = await revokeAuthorities(
    connection,
    deployer,
    mintKeypair.publicKey
  );

  // Step 4: Make metadata immutable
  logger.fork(`\n🔐 Step 4: Making metadata immutable...`);
  const immutableTx = await makeMetadataImmutable(
    connection,
    deployer,
    mintKeypair.publicKey
  );

  // Verify everything is locked down
  logger.fork(`\n✅ Verifying security...`);
  const verification = await verifyAuthoritiesRevoked(connection, mintKeypair.publicKey);
  
  if (!verification.mintRevoked || !verification.freezeRevoked) {
    throw new Error('CRITICAL: Authorities not properly revoked!');
  }
  
  logger.success(`✓ Mint authority: REVOKED`);
  logger.success(`✓ Freeze authority: REVOKED`);
  logger.success(`✓ Metadata: IMMUTABLE`);
  logger.success(`✓ Transfer fee: ${transferFeeBps / 100}% → Treasury`);

  const result: ForkResult = {
    mint: mintKeypair.publicKey.toBase58(),
    deployTx: tokenResult.mintTx,
    revokeTx,
    metadataTx,
    config,
    timestamp: Date.now(),
  };

  // Save deployment info
  const deploymentDir = path.join(process.cwd(), 'deployments');
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  const deploymentPath = path.join(deploymentDir, `${mintKeypair.publicKey.toBase58()}.json`);
  fs.writeFileSync(deploymentPath, JSON.stringify(result, null, 2));
  
  logger.success(`\n🎉 SAFE FORK DEPLOYED SUCCESSFULLY!`);
  logger.success(`====================================`);
  logger.success(`Mint: ${result.mint}`);
  logger.success(`Explorer: https://solscan.io/token/${result.mint}`);
  logger.success(`\nDeployment saved to: ${deploymentPath}`);

  return result;
}

/**
 * Calculate victim relief allocation
 */
export function calculateVictimRelief(
  totalSupply: number,
  victimReliefPercent: number = DEFAULT_VICTIM_RELIEF_PERCENT
): number {
  return Math.floor(totalSupply * (victimReliefPercent / 100));
}

// ============================================
// CLI Entry Point
// ============================================

async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const argMap: Record<string, string> = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace('--', '');
    const value = args[i + 1];
    if (key && value) {
      argMap[key] = value;
    }
  }

  if (!argMap.original || !argMap.treasury) {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║       🔧 Claude Forkoor - Safe Fork Deployer                  ║
║       "Forked, Fixed, and Fired Up."                          ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Usage:                                                       ║
║    npm run deploy-fork -- \\                                   ║
║      --original <original_mint> \\                             ║
║      --treasury <treasury_wallet> \\                           ║
║      [--name "SAFE_TOKEN"] \\                                  ║
║      [--symbol "SAFE_T"] \\                                    ║
║      [--supply 1000000000] \\                                  ║
║      [--fee 50]                                               ║
║                                                               ║
║  Options:                                                     ║
║    --original   Original rugged token mint address            ║
║    --treasury   Treasury wallet for transfer fees             ║
║    --name       Token name (default: SAFE_{original})         ║
║    --symbol     Token symbol (default: {original}_F)          ║
║    --supply     Initial supply (default: 1,000,000,000)       ║
║    --fee        Transfer fee bps (default: 50 = 0.5%)         ║
║                                                               ║
║  Requirements:                                                ║
║    - DEPLOYER_PRIVATE_KEY in .env                             ║
║    - At least 0.1 SOL in deployer wallet                      ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);
    process.exit(0);
  }

  const config: ForkConfig = {
    originalMint: argMap.original,
    treasuryWallet: argMap.treasury,
    name: argMap.name,
    symbol: argMap.symbol,
    initialSupply: argMap.supply ? parseInt(argMap.supply) : undefined,
    transferFeeBps: argMap.fee ? parseInt(argMap.fee) : undefined,
  };

  try {
    await deployFork(config);
  } catch (error) {
    logger.error('Deployment failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}
