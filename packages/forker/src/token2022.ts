/**
 * Token-2022 Utilities
 * =====================
 * Functions for creating tokens with Transfer Fee extension
 */

import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  TOKEN_2022_PROGRAM_ID,
  ExtensionType,
  createInitializeMintInstruction,
  createInitializeTransferFeeConfigInstruction,
  getMintLen,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  AuthorityType,
  getAccount,
  getMint,
} from '@solana/spl-token';
import { 
  logger, 
  DEFAULT_TRANSFER_FEE_BPS, 
  DEFAULT_DECIMALS,
  FEE_DENOMINATOR,
} from '@forkoor/core';

// ============================================
// Types
// ============================================

export interface CreateToken2022Params {
  connection: Connection;
  payer: Keypair;
  mintKeypair: Keypair;
  decimals?: number;
  /** Transfer fee in basis points (50 = 0.5%) */
  transferFeeBps?: number;
  /** Maximum fee per transfer (in smallest units) */
  maxFee?: bigint;
  /** Wallet that receives transfer fees */
  feeRecipient: PublicKey;
  /** Initial supply to mint */
  initialSupply?: bigint;
  /** Recipient of initial supply */
  initialRecipient?: PublicKey;
}

export interface Token2022Result {
  mint: PublicKey;
  mintTx: string;
  tokenAccount?: PublicKey;
  mintToTx?: string;
}

// ============================================
// Token-2022 Creation
// ============================================

/**
 * Create a Token-2022 token with Transfer Fee extension
 */
export async function createToken2022WithTransferFee(
  params: CreateToken2022Params
): Promise<Token2022Result> {
  const {
    connection,
    payer,
    mintKeypair,
    decimals = DEFAULT_DECIMALS,
    transferFeeBps = DEFAULT_TRANSFER_FEE_BPS,
    maxFee = BigInt(1_000_000_000_000), // Max fee cap
    feeRecipient,
    initialSupply,
    initialRecipient,
  } = params;

  logger.fork(`Creating Token-2022 with ${transferFeeBps / 100}% transfer fee`);
  logger.fork(`Fee recipient: ${feeRecipient.toBase58()}`);

  // Calculate the space needed for mint with transfer fee extension
  const extensions = [ExtensionType.TransferFeeConfig];
  const mintLen = getMintLen(extensions);
  
  // Get minimum rent
  const mintRent = await connection.getMinimumBalanceForRentExemption(mintLen);

  // Build transaction
  const transaction = new Transaction();

  // 1. Create account for mint
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: mintLen,
      lamports: mintRent,
      programId: TOKEN_2022_PROGRAM_ID,
    })
  );

  // 2. Initialize transfer fee config BEFORE mint
  transaction.add(
    createInitializeTransferFeeConfigInstruction(
      mintKeypair.publicKey,
      payer.publicKey, // Transfer fee config authority (can update fees)
      feeRecipient,    // Withdraw withheld authority (receives fees)
      transferFeeBps,
      maxFee,
      TOKEN_2022_PROGRAM_ID
    )
  );

  // 3. Initialize the mint
  transaction.add(
    createInitializeMintInstruction(
      mintKeypair.publicKey,
      decimals,
      payer.publicKey, // Mint authority (will be revoked)
      payer.publicKey, // Freeze authority (will be revoked)
      TOKEN_2022_PROGRAM_ID
    )
  );

  // Send and confirm
  logger.fork('Sending mint creation transaction...');
  const mintTx = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer, mintKeypair],
    { commitment: 'confirmed' }
  );

  logger.success(`Token-2022 mint created: ${mintKeypair.publicKey.toBase58()}`);
  logger.success(`Transaction: ${mintTx}`);

  const result: Token2022Result = {
    mint: mintKeypair.publicKey,
    mintTx,
  };

  // Mint initial supply if specified
  if (initialSupply && initialSupply > 0n) {
    const recipient = initialRecipient || payer.publicKey;
    
    // Get or create associated token account
    const tokenAccount = getAssociatedTokenAddressSync(
      mintKeypair.publicKey,
      recipient,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const mintToTx = new Transaction();

    // Create ATA if it doesn't exist
    try {
      await getAccount(connection, tokenAccount, 'confirmed', TOKEN_2022_PROGRAM_ID);
    } catch {
      mintToTx.add(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          tokenAccount,
          recipient,
          mintKeypair.publicKey,
          TOKEN_2022_PROGRAM_ID
        )
      );
    }

    // Mint tokens
    mintToTx.add(
      createMintToInstruction(
        mintKeypair.publicKey,
        tokenAccount,
        payer.publicKey,
        initialSupply,
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );

    logger.fork(`Minting ${initialSupply} tokens to ${recipient.toBase58()}`);
    const mintToTxSig = await sendAndConfirmTransaction(
      connection,
      mintToTx,
      [payer],
      { commitment: 'confirmed' }
    );

    logger.success(`Tokens minted: ${mintToTxSig}`);
    
    result.tokenAccount = tokenAccount;
    result.mintToTx = mintToTxSig;
  }

  return result;
}

/**
 * Revoke mint and freeze authorities (makes token immutable)
 */
export async function revokeAuthorities(
  connection: Connection,
  payer: Keypair,
  mint: PublicKey
): Promise<string> {
  logger.fork('Revoking mint and freeze authorities...');
  
  const transaction = new Transaction();

  // Revoke mint authority
  transaction.add(
    createSetAuthorityInstruction(
      mint,
      payer.publicKey,
      AuthorityType.MintTokens,
      null, // Set to null to revoke
      [],
      TOKEN_2022_PROGRAM_ID
    )
  );

  // Revoke freeze authority
  transaction.add(
    createSetAuthorityInstruction(
      mint,
      payer.publicKey,
      AuthorityType.FreezeAccount,
      null, // Set to null to revoke
      [],
      TOKEN_2022_PROGRAM_ID
    )
  );

  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer],
    { commitment: 'confirmed' }
  );

  logger.success(`Authorities revoked! Transaction: ${signature}`);
  return signature;
}

/**
 * Verify token authorities are revoked
 */
export async function verifyAuthoritiesRevoked(
  connection: Connection,
  mint: PublicKey
): Promise<{ mintRevoked: boolean; freezeRevoked: boolean }> {
  const mintInfo = await getMint(connection, mint, 'confirmed', TOKEN_2022_PROGRAM_ID);
  
  return {
    mintRevoked: mintInfo.mintAuthority === null,
    freezeRevoked: mintInfo.freezeAuthority === null,
  };
}

/**
 * Calculate transfer fee for an amount
 */
export function calculateTransferFee(
  amount: bigint,
  feeBps: number,
  maxFee: bigint
): bigint {
  const fee = (amount * BigInt(feeBps)) / BigInt(FEE_DENOMINATOR);
  return fee > maxFee ? maxFee : fee;
}
