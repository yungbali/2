/**
 * React Hook for Safe Forks Data
 * ================================
 * Fetches and manages fork data from the API
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface SafeFork {
  id: string;
  mint: string;
  name: string;
  symbol: string;
  originalMint: string;
  deployTx: string;
  decimals: number;
  initialSupply: string;
  transferFeeBps: number;
  treasuryWallet: string;
  mintRevoked: boolean;
  freezeRevoked: boolean;
  metadataLocked: boolean;
  holders: number;
  volume24h: number;
  price: number;
  priceChange24h: number;
  deployedAt: string;
  originalToken: {
    name: string;
    symbol: string;
    imageUrl: string | null;
  };
}

export interface ForksResponse {
  forks: SafeFork[];
  total: number;
  limit: number;
  offset: number;
  stats: {
    totalForks: number;
    totalHolders: number;
    totalVolume24h: number;
  };
}

export function useForks(options?: {
  search?: string;
  sortBy?: 'volume' | 'holders' | 'recent';
  limit?: number;
}) {
  const [forks, setForks] = useState<SafeFork[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<ForksResponse['stats'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options?.search) {
        params.set('search', options.search);
      }
      if (options?.sortBy) {
        params.set('sortBy', options.sortBy);
      }
      if (options?.limit) {
        params.set('limit', options.limit.toString());
      }

      const response = await fetch(`/api/forks?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch forks');
      }

      const data: ForksResponse = await response.json();
      setForks(data.forks);
      setTotal(data.total);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [options?.search, options?.sortBy, options?.limit]);

  useEffect(() => {
    fetchForks();
  }, [fetchForks]);

  return { forks, total, stats, loading, error, refetch: fetchForks };
}
