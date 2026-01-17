/**
 * API Route: /api/tokens/[mint]
 * ==============================
 * GET: Get detailed token analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  try {
    const { mint } = await params;

    // First check our database
    let token = await prisma.scannedToken.findUnique({
      where: { mint },
      include: {
        safeFork: true,
      },
    });

    // If not found or stale, fetch from RugCheck
    const isStale = token && (Date.now() - token.updatedAt.getTime()) > 60 * 60 * 1000;
    
    if (!token || isStale) {
      const rugcheckResponse = await fetch(
        `https://api.rugcheck.xyz/v1/tokens/${mint}/report`
      );

      if (!rugcheckResponse.ok) {
        if (token) {
          // Return cached data if RugCheck fails
          return NextResponse.json({
            ...token,
            riskFactors: JSON.parse(token.riskFactors || '[]'),
          });
        }
        return NextResponse.json(
          { error: 'Token not found' },
          { status: 404 }
        );
      }

      const rugData = await rugcheckResponse.json();

      const riskScore = rugData.score || 0;
      const riskLevel = getRiskLevel(riskScore);
      const forkable = riskScore >= 50;

      const riskFactors = rugData.risks?.map((risk: { name: string; description: string; level: string; score: number }) => ({
        name: risk.name,
        description: risk.description,
        severity: risk.level,
        score: risk.score,
      })) || [];

      token = await prisma.scannedToken.upsert({
        where: { mint },
        update: {
          riskScore,
          riskLevel,
          forkable,
          riskFactors: JSON.stringify(riskFactors),
          updatedAt: new Date(),
        },
        create: {
          mint,
          name: rugData.tokenMeta?.name || 'Unknown',
          symbol: rugData.tokenMeta?.symbol || 'UNK',
          platform: 'pump.fun',
          riskScore,
          riskLevel,
          forkable,
          riskFactors: JSON.stringify(riskFactors),
          imageUrl: rugData.tokenMeta?.image || null,
          description: rugData.tokenMeta?.description || null,
        },
        include: {
          safeFork: true,
        },
      });
    }

    return NextResponse.json({
      ...token,
      riskFactors: JSON.parse(token.riskFactors || '[]'),
    });
  } catch (error) {
    console.error('Error fetching token:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token' },
      { status: 500 }
    );
  }
}

function getRiskLevel(score: number): string {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}
