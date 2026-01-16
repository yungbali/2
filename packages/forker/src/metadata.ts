/**
 * Metadata Management
 * ====================
 * Create and update token metadata for safe forks
 */

import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  createCreateMetadataAccountV3Instruction,
  createUpdateMetadataAccountV2Instruction,
  PROGRAM_ID as METADATA_PROGRAM_ID,
  DataV2,
} from '@metaplex-foundation/mpl-token-metadata';
import { logger } from '@forkoor/core';
import type { ClonedMetadata } from '@forkoor/core';

// ============================================
// Metadata Creation
// ============================================

export interface CreateMetadataParams {
  connection: Connection;
  payer: Keypair;
  mint: PublicKey;
  name: string;
  symbol: string;
  uri: string;
  /** If true, metadata can be updated later */
  isMutable?: boolean;
  /** Optional: Collection key */
  collection?: PublicKey;
}

/**
 * Derive metadata PDA for a mint
 */
export function getMetadataPDA(mint: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  );
  return pda;
}

/**
 * Create metadata account for a token
 */
export async function createMetadata(
  params: CreateMetadataParams
): Promise<string> {
  const {
    connection,
    payer,
    mint,
    name,
    symbol,
    uri,
    isMutable = false, // Safe forks are immutable by default
    collection,
  } = params;

  logger.fork(`Creating metadata for ${mint.toBase58()}`);
  logger.fork(`Name: ${name}, Symbol: ${symbol}`);
  
  const metadataPDA = getMetadataPDA(mint);
  
  const data: DataV2 = {
    name,
    symbol,
    uri,
    sellerFeeBasisPoints: 0, // No royalties on transfers
    creators: [
      {
        address: payer.publicKey,
        verified: true,
        share: 100,
      },
    ],
    collection: collection ? { key: collection, verified: false } : null,
    uses: null,
  };

  const instruction = createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataPDA,
      mint: mint,
      mintAuthority: payer.publicKey,
      payer: payer.publicKey,
      updateAuthority: payer.publicKey,
    },
    {
      createMetadataAccountArgsV3: {
        data,
        isMutable,
        collectionDetails: null,
      },
    }
  );

  const transaction = new Transaction().add(instruction);
  
  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer],
    { commitment: 'confirmed' }
  );

  logger.success(`Metadata created: ${signature}`);
  return signature;
}

/**
 * Create metadata from cloned metadata object
 */
export async function createMetadataFromClone(
  connection: Connection,
  payer: Keypair,
  mint: PublicKey,
  clonedMetadata: ClonedMetadata,
  metadataUri: string
): Promise<string> {
  return createMetadata({
    connection,
    payer,
    mint,
    name: clonedMetadata.name,
    symbol: clonedMetadata.symbol,
    uri: metadataUri,
    isMutable: false, // Safe forks are always immutable
  });
}

/**
 * Update metadata (only works if isMutable was true)
 */
export async function updateMetadata(
  connection: Connection,
  payer: Keypair,
  mint: PublicKey,
  newData: Partial<{ name: string; symbol: string; uri: string }>
): Promise<string> {
  logger.fork(`Updating metadata for ${mint.toBase58()}`);
  
  const metadataPDA = getMetadataPDA(mint);
  
  const instruction = createUpdateMetadataAccountV2Instruction(
    {
      metadata: metadataPDA,
      updateAuthority: payer.publicKey,
    },
    {
      updateMetadataAccountArgsV2: {
        data: {
          name: newData.name || '',
          symbol: newData.symbol || '',
          uri: newData.uri || '',
          sellerFeeBasisPoints: 0,
          creators: null,
          collection: null,
          uses: null,
        },
        updateAuthority: payer.publicKey,
        primarySaleHappened: null,
        isMutable: null,
      },
    }
  );

  const transaction = new Transaction().add(instruction);
  
  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer],
    { commitment: 'confirmed' }
  );

  logger.success(`Metadata updated: ${signature}`);
  return signature;
}

/**
 * Make metadata immutable (can't be changed after this)
 */
export async function makeMetadataImmutable(
  connection: Connection,
  payer: Keypair,
  mint: PublicKey
): Promise<string> {
  logger.fork(`Making metadata immutable for ${mint.toBase58()}`);
  
  const metadataPDA = getMetadataPDA(mint);
  
  // Update with isMutable set to false
  const instruction = createUpdateMetadataAccountV2Instruction(
    {
      metadata: metadataPDA,
      updateAuthority: payer.publicKey,
    },
    {
      updateMetadataAccountArgsV2: {
        data: null, // Keep existing data
        updateAuthority: null, // Keep existing authority
        primarySaleHappened: null,
        isMutable: false, // Make immutable
      },
    }
  );

  const transaction = new Transaction().add(instruction);
  
  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer],
    { commitment: 'confirmed' }
  );

  logger.success(`Metadata is now immutable: ${signature}`);
  return signature;
}
