/**
 * API Route: /api/migrate/check/[wallet]
 * =======================================
 * GET: Check wallet eligibility for victim relief
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wallet: string }> }
) {
  try {
    const { wallet } = await params;

    if (!wallet || wallet.length < 32) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Check for existing claims
    const existingClaims = await prisma.migrationClaim.findMany({
      where: { walletAddress: wallet },
      include: {
        safeFork: {
          include: {
            originalToken: {
              select: {
                name: true,
                symbol: true,
              },
            },
          },
        },
      },
    });

    // Get all available safe forks
    const availableForks = await prisma.safeFork.findMany({
      include: {
        originalToken: {
          select: {
            name: true,
            symbol: true,
            mint: true,
          },
        },
      },
    });

    // In a full implementation, we would:
    // 1. Query the Solana blockchain for the wallet's token holdings
    // 2. Cross-reference with rugged tokens that have safe forks
    // 3. Calculate allocations based on historical holdings
    //
    // For now, we return the existing claims and available forks
    // The actual eligibility check would require Helius/Solana RPC calls

    const eligibleTokens = existingClaims.map((claim) => ({
      originalMint: claim.originalMint,
      originalName: claim.safeFork.originalToken.name,
      originalSymbol: claim.safeFork.originalToken.symbol,
      safeForkMint: claim.safeForkMint,
      safeForkName: claim.safeFork.name,
      safeForkSymbol: claim.safeFork.symbol,
      originalBalance: claim.originalBalance,
      allocation: claim.allocation,
      status: claim.status,
      claimTx: claim.claimTx,
      expiresAt: claim.expiresAt,
    }));

    return NextResponse.json({
      wallet,
      eligibleTokens,
      availableForks: availableForks.length,
      totalClaims: existingClaims.length,
      pendingClaims: existingClaims.filter((c) => c.status === 'VERIFIED').length,
      claimedCount: existingClaims.filter((c) => c.status === 'CLAIMED').length,
    });
  } catch (error) {
    console.error('Error checking eligibility:', error);
    return NextResponse.json(
      { error: 'Failed to check eligibility' },
      { status: 500 }
    );
  }
}
