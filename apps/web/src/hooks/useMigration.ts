/**
 * React Hook for Migration/Claims Data
 * ======================================
 * Manages wallet eligibility and claim processing
 */

'use client';

import { useState, useCallback } from 'react';

export interface EligibleToken {
  originalMint: string;
  originalName: string;
  originalSymbol: string;
  safeForkMint: string;
  safeForkName: string;
  safeForkSymbol: string;
  originalBalance: string;
  allocation: string;
  status: 'PENDING' | 'VERIFIED' | 'CLAIMED' | 'EXPIRED';
  claimTx: string | null;
  expiresAt: string;
}

export interface EligibilityResponse {
  wallet: string;
  eligibleTokens: EligibleToken[];
  availableForks: number;
  totalClaims: number;
  pendingClaims: number;
  claimedCount: number;
}

export function useCheckEligibility() {
  const [eligibility, setEligibility] = useState<EligibilityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkEligibility = useCallback(async (walletAddress: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/migrate/check/${walletAddress}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to check eligibility');
      }

      const data: EligibilityResponse = await response.json();
      setEligibility(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { eligibility, checkEligibility, loading, error };
}

export function useClaimTokens() {
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const claim = useCallback(async (
    walletAddress: string,
    safeForkMint: string,
    signature?: string
  ) => {
    setClaiming(true);
    setError(null);

    try {
      const response = await fetch('/api/migrate/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, safeForkMint, signature }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process claim');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setClaiming(false);
    }
  }, []);

  return { claim, claiming, error };
}
