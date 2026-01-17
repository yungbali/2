/**
 * API Route: /api/tokens
 * =======================
 * GET: List scanned tokens with filtering
 * POST: Manually scan a token
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const riskLevel = searchParams.get('riskLevel');
    const forkable = searchParams.get('forkable');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};

    if (riskLevel && riskLevel !== 'ALL') {
      where.riskLevel = riskLevel;
    }

    if (forkable === 'true') {
      where.forkable = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { symbol: { contains: search } },
        { mint: { contains: search } },
      ];
    }

    const [tokens, total] = await Promise.all([
      prisma.scannedToken.findMany({
        where,
        orderBy: { scannedAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          safeFork: {
            select: {
              mint: true,
              symbol: true,
            },
          },
        },
      }),
      prisma.scannedToken.count({ where }),
    ]);

    // Parse riskFactors JSON for each token
    const formattedTokens = tokens.map((token) => ({
      ...token,
      riskFactors: JSON.parse(token.riskFactors || '[]'),
    }));

    return NextResponse.json({
      tokens: formattedTokens,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mint } = body;

    if (!mint) {
      return NextResponse.json(
        { error: 'Mint address is required' },
        { status: 400 }
      );
    }

    // Check if already scanned recently
    const existing = await prisma.scannedToken.findUnique({
      where: { mint },
    });

    if (existing) {
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (existing.scannedAt > hourAgo) {
        return NextResponse.json({
          token: {
            ...existing,
            riskFactors: JSON.parse(existing.riskFactors || '[]'),
          },
          cached: true,
        });
      }
    }

    // Call the scanner service to analyze the token
    // For now, we'll use the RugCheck API directly
    const rugcheckResponse = await fetch(
      `https://api.rugcheck.xyz/v1/tokens/${mint}/report`
    );

    if (!rugcheckResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch token data from RugCheck' },
        { status: 502 }
      );
    }

    const rugData = await rugcheckResponse.json();

    // Map RugCheck data to our schema
    const riskScore = rugData.score || 0;
    const riskLevel = getRiskLevel(riskScore);
    const forkable = riskScore >= 50; // Tokens with score >= 50 are forkable

    const riskFactors = rugData.risks?.map((risk: { name: string; description: string; level: string; score: number }) => ({
      name: risk.name,
      description: risk.description,
      severity: risk.level,
      score: risk.score,
    })) || [];

    // Upsert the token
    const token = await prisma.scannedToken.upsert({
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
    });

    // Update system stats
    await prisma.systemStats.upsert({
      where: { id: 'singleton' },
      update: {
        tokensScanned: { increment: existing ? 0 : 1 },
        criticalTokens: { increment: riskLevel === 'CRITICAL' && !existing ? 1 : 0 },
      },
      create: {
        id: 'singleton',
        tokensScanned: 1,
        criticalTokens: riskLevel === 'CRITICAL' ? 1 : 0,
      },
    });

    return NextResponse.json({
      token: {
        ...token,
        riskFactors,
      },
      cached: false,
    });
  } catch (error) {
    console.error('Error scanning token:', error);
    return NextResponse.json(
      { error: 'Failed to scan token' },
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
