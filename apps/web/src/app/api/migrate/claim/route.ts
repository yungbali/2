/**
 * API Route: /api/migrate/claim
 * ==============================
 * POST: Process a claim for victim relief tokens
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, safeForkMint, signature } = body;

    if (!walletAddress || !safeForkMint) {
      return NextResponse.json(
        { error: 'walletAddress and safeForkMint are required' },
        { status: 400 }
      );
    }

    // Find the claim
    const claim = await prisma.migrationClaim.findUnique({
      where: {
        walletAddress_safeForkMint: {
          walletAddress,
          safeForkMint,
        },
      },
      include: {
        safeFork: true,
      },
    });

    if (!claim) {
      return NextResponse.json(
        { error: 'No eligible claim found' },
        { status: 404 }
      );
    }

    if (claim.status === 'CLAIMED') {
      return NextResponse.json(
        { error: 'This claim has already been processed', claimTx: claim.claimTx },
        { status: 409 }
      );
    }

    if (claim.status === 'EXPIRED' || claim.expiresAt < new Date()) {
      // Update status to expired if not already
      await prisma.migrationClaim.update({
        where: { id: claim.id },
        data: { status: 'EXPIRED' },
      });
      return NextResponse.json(
        { error: 'This claim has expired' },
        { status: 410 }
      );
    }

    if (claim.status !== 'VERIFIED') {
      return NextResponse.json(
        { error: 'Claim is not verified for claiming' },
        { status: 400 }
      );
    }

    // In a full implementation, this would:
    // 1. Verify the signature from the wallet
    // 2. Execute a Solana transaction to transfer tokens
    // 3. Record the transaction
    //
    // For now, we'll simulate the claim if a signature is provided

    if (signature) {
      // Update the claim as claimed
      const updatedClaim = await prisma.migrationClaim.update({
        where: { id: claim.id },
        data: {
          status: 'CLAIMED',
          claimTx: signature,
          claimedAt: new Date(),
        },
      });

      // Update system stats
      await prisma.systemStats.upsert({
        where: { id: 'singleton' },
        update: {
          victimsProtected: { increment: 1 },
        },
        create: {
          id: 'singleton',
          victimsProtected: 1,
        },
      });

      return NextResponse.json({
        success: true,
        claim: updatedClaim,
        message: 'Claim processed successfully',
      });
    }

    // If no signature, return the claim details for signing
    return NextResponse.json({
      success: false,
      claim: {
        id: claim.id,
        safeForkMint: claim.safeForkMint,
        safeForkName: claim.safeFork.name,
        safeForkSymbol: claim.safeFork.symbol,
        allocation: claim.allocation,
        treasuryWallet: claim.safeFork.treasuryWallet,
      },
      message: 'Please sign the transaction to claim your tokens',
      // In production, include transaction details for signing
      transactionDetails: {
        type: 'SPL_TRANSFER',
        mint: claim.safeForkMint,
        amount: claim.allocation,
        recipient: walletAddress,
      },
    });
  } catch (error) {
    console.error('Error processing claim:', error);
    return NextResponse.json(
      { error: 'Failed to process claim' },
      { status: 500 }
    );
  }
}
