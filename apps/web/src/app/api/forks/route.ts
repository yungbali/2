/**
 * API Route: /api/forks
 * ======================
 * GET: List all safe forks
 * POST: Deploy a new safe fork
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'deployedAt';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { symbol: { contains: search } },
        { mint: { contains: search } },
      ];
    }

    const orderBy: Record<string, string> = {};
    switch (sortBy) {
      case 'volume':
        orderBy.volume24h = 'desc';
        break;
      case 'holders':
        orderBy.holders = 'desc';
        break;
      case 'recent':
      default:
        orderBy.deployedAt = 'desc';
    }

    const [forks, total] = await Promise.all([
      prisma.safeFork.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
        include: {
          originalToken: {
            select: {
              name: true,
              symbol: true,
              imageUrl: true,
            },
          },
        },
      }),
      prisma.safeFork.count({ where }),
    ]);

    // Calculate aggregated stats
    const stats = await prisma.safeFork.aggregate({
      _sum: {
        holders: true,
        volume24h: true,
      },
      _count: true,
    });

    return NextResponse.json({
      forks,
      total,
      limit,
      offset,
      stats: {
        totalForks: stats._count,
        totalHolders: stats._sum.holders || 0,
        totalVolume24h: stats._sum.volume24h || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching forks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      originalMint,
      treasuryWallet,
      name,
      symbol,
      initialSupply,
      transferFeeBps,
    } = body;

    if (!originalMint || !treasuryWallet) {
      return NextResponse.json(
        { error: 'originalMint and treasuryWallet are required' },
        { status: 400 }
      );
    }

    // Check if original token exists and is forkable
    const originalToken = await prisma.scannedToken.findUnique({
      where: { mint: originalMint },
    });

    if (!originalToken) {
      return NextResponse.json(
        { error: 'Original token not found. Please scan it first.' },
        { status: 404 }
      );
    }

    if (!originalToken.forkable) {
      return NextResponse.json(
        { error: 'This token does not meet the criteria for forking.' },
        { status: 400 }
      );
    }

    // Check if already forked
    const existingFork = await prisma.safeFork.findUnique({
      where: { originalMint },
    });

    if (existingFork) {
      return NextResponse.json(
        { error: 'This token has already been forked.', fork: existingFork },
        { status: 409 }
      );
    }

    // In production, this would call the forker service to actually deploy
    // For now, we'll create a placeholder that would be updated by the deployment script
    
    // Generate safe name/symbol
    const safeName = name || `SAFE ${originalToken.name}`;
    const safeSymbol = symbol || `SAFE_${originalToken.symbol}`.slice(0, 10);

    // This would be replaced with actual deployment
    // For now, return instructions for CLI deployment
    return NextResponse.json({
      status: 'pending',
      message: 'Fork deployment requires CLI execution',
      command: `npm run deploy-fork -- --original ${originalMint} --treasury ${treasuryWallet} --name "${safeName}" --symbol "${safeSymbol}" ${initialSupply ? `--supply ${initialSupply}` : ''} ${transferFeeBps ? `--fee ${transferFeeBps}` : ''}`,
      originalToken: {
        mint: originalToken.mint,
        name: originalToken.name,
        symbol: originalToken.symbol,
        riskScore: originalToken.riskScore,
      },
    });
  } catch (error) {
    console.error('Error creating fork:', error);
    return NextResponse.json(
      { error: 'Failed to create fork' },
      { status: 500 }
    );
  }
}
