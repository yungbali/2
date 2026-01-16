#!/usr/bin/env tsx
/**
 * Metaplex Metadata Cloner
 * =========================
 * Claude Forkoor's Metadata Surgeon
 * 
 * Clones the metadata (name, symbol, image) from any token
 * and prepares it for a safe fork deployment.
 * 
 * Usage:
 *   npx tsx scripts/metaplex-metadata-clone.ts <mint_address>
 *   npm run clone-metadata -- <mint_address>
 */

import { Connection, PublicKey } from '@solana/web3.js';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { 
  loadConfig, 
  getConnection, 
  logger,
  generateSafeName,
  generateSafeSymbol,
  METADATA_PROGRAM_ID,
} from '@forkoor/core';
import type { TokenMetadata, ClonedMetadata } from '@forkoor/core';

// ============================================
// Metadata Extraction
// ============================================

interface MetadataJson {
  name?: string;
  symbol?: string;
  description?: string;
  image?: string;
  external_url?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

/**
 * Fetch and parse metadata from URI
 */
async function fetchMetadataJson(uri: string): Promise<MetadataJson | null> {
  try {
    logger.info(`Fetching metadata from: ${uri}`);
    
    // Handle IPFS URIs
    let fetchUrl = uri;
    if (uri.startsWith('ipfs://')) {
      fetchUrl = `https://ipfs.io/ipfs/${uri.replace('ipfs://', '')}`;
    } else if (uri.includes('arweave.net')) {
      // Arweave URLs work as-is
      fetchUrl = uri;
    }
    
    const response = await axios.get<MetadataJson>(fetchUrl, {
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
      },
    });
    
    return response.data;
  } catch (error) {
    logger.error(`Failed to fetch metadata: ${error}`);
    return null;
  }
}

/**
 * Extract on-chain metadata from token mint
 */
async function extractOnChainMetadata(
  connection: Connection,
  mint: string
): Promise<{ name: string; symbol: string; uri: string } | null> {
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
    
    const accountInfo = await connection.getAccountInfo(metadataPDA);
    
    if (!accountInfo) {
      logger.warn('No metadata account found for this mint');
      return null;
    }
    
    const data = accountInfo.data;
    
    // Parse Metaplex Metadata structure
    // Key (1) + UpdateAuthority (32) + Mint (32) = 65 bytes offset
    let offset = 65;
    
    // Name: 4-byte length + string (padded to 32 bytes total)
    const nameLength = data.readUInt32LE(offset);
    offset += 4;
    const name = data.subarray(offset, offset + 32).toString('utf8').replace(/\0/g, '').trim();
    offset += 32;
    
    // Symbol: 4-byte length + string (padded to 10 bytes total)
    const symbolLength = data.readUInt32LE(offset);
    offset += 4;
    const symbol = data.subarray(offset, offset + 10).toString('utf8').replace(/\0/g, '').trim();
    offset += 10;
    
    // URI: 4-byte length + string (padded to 200 bytes total)
    const uriLength = data.readUInt32LE(offset);
    offset += 4;
    const uri = data.subarray(offset, offset + 200).toString('utf8').replace(/\0/g, '').trim();
    
    return { name, symbol, uri };
  } catch (error) {
    logger.error(`Failed to extract on-chain metadata: ${error}`);
    return null;
  }
}

/**
 * Download image from URL
 */
async function downloadImage(
  imageUrl: string,
  outputPath: string
): Promise<boolean> {
  try {
    // Handle IPFS URLs
    let fetchUrl = imageUrl;
    if (imageUrl.startsWith('ipfs://')) {
      fetchUrl = `https://ipfs.io/ipfs/${imageUrl.replace('ipfs://', '')}`;
    }
    
    logger.info(`Downloading image from: ${fetchUrl}`);
    
    const response = await axios.get(fetchUrl, {
      responseType: 'arraybuffer',
      timeout: 60000,
    });
    
    fs.writeFileSync(outputPath, response.data);
    logger.success(`Image saved to: ${outputPath}`);
    
    return true;
  } catch (error) {
    logger.error(`Failed to download image: ${error}`);
    return false;
  }
}

/**
 * Clone metadata from a token
 */
async function cloneMetadata(mint: string): Promise<ClonedMetadata | null> {
  const config = loadConfig();
  const connection = getConnection(config);
  
  logger.info(`\n🔬 Claude Forkoor Metadata Cloner`);
  logger.info(`================================`);
  logger.info(`Target mint: ${mint}\n`);
  
  // Step 1: Extract on-chain metadata
  logger.info('Step 1: Extracting on-chain metadata...');
  const onChainMeta = await extractOnChainMetadata(connection, mint);
  
  if (!onChainMeta) {
    logger.error('Could not extract on-chain metadata');
    return null;
  }
  
  logger.success(`Name: ${onChainMeta.name}`);
  logger.success(`Symbol: ${onChainMeta.symbol}`);
  logger.success(`URI: ${onChainMeta.uri}`);
  
  // Step 2: Fetch off-chain metadata
  logger.info('\nStep 2: Fetching off-chain metadata...');
  const offChainMeta = await fetchMetadataJson(onChainMeta.uri);
  
  // Step 3: Build cloned metadata
  logger.info('\nStep 3: Building safe fork metadata...');
  
  const safeName = generateSafeName(onChainMeta.name);
  const safeSymbol = generateSafeSymbol(onChainMeta.symbol);
  
  const clonedMetadata: ClonedMetadata = {
    name: safeName,
    symbol: safeSymbol,
    uri: '', // Will be set after uploading new metadata
    decimals: 9, // Default
    originalMint: mint,
    isSafeFork: true,
    forkedAt: Date.now(),
    image: offChainMeta?.image,
    description: offChainMeta?.description 
      ? `[SAFE FORK] ${offChainMeta.description} | Original: ${mint}`
      : `Safe fork of ${onChainMeta.name} by Claude Forkoor. Original mint: ${mint}`,
    externalUrl: 'https://claudeforkoor.xyz',
    attributes: [
      ...(offChainMeta?.attributes || []),
      { trait_type: 'Fork Type', value: 'Safe Fork' },
      { trait_type: 'Original Mint', value: mint },
      { trait_type: 'Forked By', value: 'Claude Forkoor' },
      { trait_type: 'Mint Authority', value: 'Revoked' },
      { trait_type: 'Freeze Authority', value: 'Revoked' },
    ],
  };
  
  logger.success(`\n✅ Metadata cloned successfully!`);
  logger.info(`\nSafe Fork Details:`);
  logger.info(`  Name: ${clonedMetadata.name}`);
  logger.info(`  Symbol: ${clonedMetadata.symbol}`);
  logger.info(`  Description: ${clonedMetadata.description?.slice(0, 50)}...`);
  
  // Step 4: Create output directory and save
  const outputDir = path.join(process.cwd(), 'cloned-metadata');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputFile = path.join(outputDir, `${mint}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(clonedMetadata, null, 2));
  logger.success(`\nMetadata saved to: ${outputFile}`);
  
  // Step 5: Download image if available
  if (clonedMetadata.image) {
    const imageExt = clonedMetadata.image.split('.').pop()?.split('?')[0] || 'png';
    const imagePath = path.join(outputDir, `${mint}.${imageExt}`);
    await downloadImage(clonedMetadata.image, imagePath);
  }
  
  return clonedMetadata;
}

/**
 * Generate uploadable metadata JSON for IPFS/Arweave
 */
function generateUploadableMetadata(cloned: ClonedMetadata): object {
  return {
    name: cloned.name,
    symbol: cloned.symbol,
    description: cloned.description,
    image: cloned.image, // This should be updated to new IPFS URL after upload
    external_url: cloned.externalUrl,
    attributes: cloned.attributes,
    properties: {
      files: cloned.image ? [{ uri: cloned.image, type: 'image/png' }] : [],
      category: 'image',
    },
  };
}

// ============================================
// CLI Entry Point
// ============================================

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║       🔬 Claude Forkoor - Metadata Cloner                     ║
║       "I find the bugs. I fix the contracts."                 ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Usage:                                                       ║
║    npx tsx scripts/metaplex-metadata-clone.ts <mint>          ║
║                                                               ║
║  Example:                                                     ║
║    npx tsx scripts/metaplex-metadata-clone.ts \\               ║
║      7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr             ║
║                                                               ║
║  Output:                                                      ║
║    ./cloned-metadata/<mint>.json  - Cloned metadata           ║
║    ./cloned-metadata/<mint>.png   - Token image (if found)    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);
    process.exit(0);
  }
  
  const mint = args[0];
  
  // Validate mint address
  try {
    new PublicKey(mint);
  } catch {
    logger.error(`Invalid mint address: ${mint}`);
    process.exit(1);
  }
  
  const result = await cloneMetadata(mint);
  
  if (!result) {
    logger.error('\nFailed to clone metadata');
    process.exit(1);
  }
  
  // Generate uploadable JSON
  const uploadable = generateUploadableMetadata(result);
  const uploadablePath = path.join(process.cwd(), 'cloned-metadata', `${mint}-uploadable.json`);
  fs.writeFileSync(uploadablePath, JSON.stringify(uploadable, null, 2));
  
  logger.success(`\nUploadable metadata saved to: ${uploadablePath}`);
  logger.info('\n📤 Next steps:');
  logger.info('  1. Upload image to IPFS/Arweave');
  logger.info('  2. Update image URL in uploadable metadata');
  logger.info('  3. Upload metadata JSON to IPFS/Arweave');
  logger.info('  4. Use the metadata URI for token deployment');
  logger.info('\n🚀 Ready to fork with: npm run deploy-fork');
}

main().catch((error) => {
  logger.error('Unexpected error:', error);
  process.exit(1);
});

export { cloneMetadata, fetchMetadataJson, extractOnChainMetadata, generateUploadableMetadata };
