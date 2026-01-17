/**
 * API Route: /api/stats
 * ======================
 * GET: Get system-wide statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get or create system stats
    let stats = await prisma.systemStats.findUnique({
      where: { id: 'singleton' },
    });

    if (!stats) {
      stats = await prisma.systemStats.create({
        data: { id: 'singleton' },
      });
    }

    // Get real-time counts
    const [tokenStats, forkStats, claimStats, treasuryStats] = await Promise.all([
      // Token stats
      prisma.scannedToken.groupBy({
        by: ['riskLevel'],
        _count: { riskLevel: true },
      }),
      // Fork stats
      prisma.safeFork.aggregate({
        _count: true,
        _sum: {
          holders: true,
          volume24h: true,
        },
      }),
      // Claim stats
      prisma.migrationClaim.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      // Treasury stats
      prisma.treasuryTransaction.aggregate({
        _sum: {
          amountSol: true,
          amountUsd: true,
        },
        where: {
          type: 'FEE_COLLECTED',
        },
      }),
    ]);

    // Format token counts by risk level
    const riskDistribution: Record<string, number> = {};
    let totalScanned = 0;
    tokenStats.forEach((stat) => {
      riskDistribution[stat.riskLevel] = stat._count.riskLevel;
      totalScanned += stat._count.riskLevel;
    });

    // Format claim counts by status
    const claimDistribution: Record<string, number> = {};
    claimStats.forEach((stat) => {
      claimDistribution[stat.status] = stat._count.status;
    });

    return NextResponse.json({
      scanner: {
        tokensScanned: totalScanned,
        riskDistribution,
        criticalTokens: riskDistribution['CRITICAL'] || 0,
        highRiskTokens: riskDistribution['HIGH'] || 0,
      },
      forks: {
        totalForks: forkStats._count,
        totalHolders: forkStats._sum.holders || 0,
        volume24h: forkStats._sum.volume24h || 0,
      },
      migration: {
        totalClaims: Object.values(claimDistribution).reduce((a, b) => a + b, 0),
        claimDistribution,
        victimsProtected: stats.victimsProtected,
        valueProtectedUsd: stats.valueProtectedUsd,
      },
      treasury: {
        feesCollected: treasuryStats._sum.amountUsd || 0,
        totalBuybacks: stats.totalBuybacks,
        balance: stats.treasuryBalance,
      },
      lastUpdated: stats.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
