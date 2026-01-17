/**
 * React Hook for Token Data
 * ==========================
 * Fetches and manages token data from the API
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface RiskFactor {
  name: string;
  description: string;
  severity: string;
  score: number;
}

export interface ScannedToken {
  id: string;
  mint: string;
  name: string;
  symbol: string;
  platform: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  forkable: boolean;
  riskFactors: RiskFactor[];
  imageUrl: string | null;
  description: string | null;
  scannedAt: string;
  safeFork?: {
    mint: string;
    symbol: string;
  } | null;
}

export interface TokensResponse {
  tokens: ScannedToken[];
  total: number;
  limit: number;
  offset: number;
}

export function useTokens(options?: {
  riskLevel?: string;
  forkable?: boolean;
  search?: string;
  limit?: number;
}) {
  const [tokens, setTokens] = useState<ScannedToken[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options?.riskLevel && options.riskLevel !== 'ALL') {
        params.set('riskLevel', options.riskLevel);
      }
      if (options?.forkable) {
        params.set('forkable', 'true');
      }
      if (options?.search) {
        params.set('search', options.search);
      }
      if (options?.limit) {
        params.set('limit', options.limit.toString());
      }

      const response = await fetch(`/api/tokens?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tokens');
      }

      const data: TokensResponse = await response.json();
      setTokens(data.tokens);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [options?.riskLevel, options?.forkable, options?.search, options?.limit]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  return { tokens, total, loading, error, refetch: fetchTokens };
}

export function useScanToken() {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scanToken = async (mint: string): Promise<ScannedToken | null> => {
    setScanning(true);
    setError(null);

    try {
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mint }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to scan token');
      }

      const data = await response.json();
      return data.token;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setScanning(false);
    }
  };

  return { scanToken, scanning, error };
}

export function useStats() {
  const [stats, setStats] = useState<{
    scanner: {
      tokensScanned: number;
      riskDistribution: Record<string, number>;
      criticalTokens: number;
      highRiskTokens: number;
    };
    forks: {
      totalForks: number;
      totalHolders: number;
      volume24h: number;
    };
    migration: {
      totalClaims: number;
      victimsProtected: number;
      valueProtectedUsd: number;
    };
    treasury: {
      feesCollected: number;
      totalBuybacks: number;
      balance: number;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error };
}
