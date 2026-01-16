'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ExternalLink, Shield, AlertTriangle, Clock, Users } from 'lucide-react';
import { RiskBadge, RiskScoreBar } from './RiskBadge';

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface TokenData {
  mint: string;
  name: string;
  symbol: string;
  image?: string;
  riskScore: number;
  riskLevel: RiskLevel;
  flags: {
    mintAuthorityActive: boolean;
    freezeAuthorityActive: boolean;
    metadataMutable: boolean;
    highHolderConcentration: boolean;
    lpNotBurned: boolean;
  };
  detectedAt: number;
  platform: string;
  forkAvailable?: string; // Fork mint address if available
}

interface TokenCardProps {
  token: TokenData;
  showForkButton?: boolean;
}

export function TokenCard({ token, showForkButton = true }: TokenCardProps) {
  const timeAgo = getRelativeTime(token.detectedAt);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="surgical-card p-5"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Token Image */}
        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
          {token.image ? (
            <Image
              src={token.image}
              alt={token.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-display text-slate-600">
              {token.symbol.charAt(0)}
            </div>
          )}
          
          {/* Risk indicator dot */}
          <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
            token.riskLevel === 'CRITICAL' ? 'bg-vital-red animate-pulse' :
            token.riskLevel === 'HIGH' ? 'bg-vital-orange' :
            token.riskLevel === 'MEDIUM' ? 'bg-vital-yellow' :
            'bg-vital-green'
          }`} />
        </div>

        {/* Token Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display text-lg font-bold text-white truncate">
              {token.name}
            </h3>
            <RiskBadge level={token.riskLevel} size="sm" />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-surgical-500 font-mono">${token.symbol}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-500 font-mono text-xs truncate">
              {token.mint.slice(0, 8)}...{token.mint.slice(-4)}
            </span>
          </div>
        </div>

        {/* External Link */}
        <a
          href={`https://solscan.io/token/${token.mint}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-slate-500 hover:text-surgical-500 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Risk Score */}
      <div className="mb-4">
        <RiskScoreBar score={token.riskScore} />
      </div>

      {/* Risk Flags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {token.flags.mintAuthorityActive && (
          <FlagBadge type="danger" label="Mint Auth Active" />
        )}
        {token.flags.freezeAuthorityActive && (
          <FlagBadge type="danger" label="Freeze Auth" />
        )}
        {token.flags.metadataMutable && (
          <FlagBadge type="warning" label="Mutable" />
        )}
        {token.flags.highHolderConcentration && (
          <FlagBadge type="warning" label="Concentrated" />
        )}
        {token.flags.lpNotBurned && (
          <FlagBadge type="warning" label="LP Not Burned" />
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {token.platform}
          </span>
        </div>

        {showForkButton && (
          token.forkAvailable ? (
            <Link
              href={`/forks/${token.forkAvailable}`}
              className="flex items-center gap-2 px-3 py-1.5 bg-surgical-500/10 border border-surgical-500/30 rounded-lg text-surgical-500 text-sm font-mono hover:bg-surgical-500/20 transition-colors"
            >
              <Shield className="w-3 h-3" />
              Safe Fork Available
            </Link>
          ) : (
            <button className="flex items-center gap-2 px-3 py-1.5 bg-plasma-500/10 border border-plasma-500/30 rounded-lg text-plasma-500 text-sm font-mono hover:bg-plasma-500/20 transition-colors">
              <AlertTriangle className="w-3 h-3" />
              Request Fork
            </button>
          )
        )}
      </div>
    </motion.div>
  );
}

function FlagBadge({ type, label }: { type: 'danger' | 'warning'; label: string }) {
  const classes = type === 'danger' 
    ? 'bg-vital-red/10 text-vital-red border-vital-red/20'
    : 'bg-vital-yellow/10 text-vital-yellow border-vital-yellow/20';
    
  return (
    <span className={`px-2 py-0.5 text-xs font-mono border rounded ${classes}`}>
      {label}
    </span>
  );
}

function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}

// Example token data for demonstration
export const mockTokens: TokenData[] = [
  {
    mint: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
    name: 'TRUMP COIN',
    symbol: 'TRUMP',
    riskScore: 85,
    riskLevel: 'CRITICAL',
    flags: {
      mintAuthorityActive: true,
      freezeAuthorityActive: true,
      metadataMutable: true,
      highHolderConcentration: true,
      lpNotBurned: true,
    },
    detectedAt: Date.now() - 1000 * 60 * 5,
    platform: 'pump.fun',
    forkAvailable: 'SAFE_TRUMP_MINT_ADDRESS',
  },
  {
    mint: '8HGiDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW3xa',
    name: 'SHIBA MOON',
    symbol: 'SHIBMOON',
    riskScore: 72,
    riskLevel: 'HIGH',
    flags: {
      mintAuthorityActive: true,
      freezeAuthorityActive: false,
      metadataMutable: true,
      highHolderConcentration: true,
      lpNotBurned: false,
    },
    detectedAt: Date.now() - 1000 * 60 * 30,
    platform: 'pump.fun',
  },
  {
    mint: '9JDimgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW4yb',
    name: 'PEPE CLASSIC',
    symbol: 'PEPEC',
    riskScore: 45,
    riskLevel: 'MEDIUM',
    flags: {
      mintAuthorityActive: false,
      freezeAuthorityActive: false,
      metadataMutable: true,
      highHolderConcentration: true,
      lpNotBurned: true,
    },
    detectedAt: Date.now() - 1000 * 60 * 60 * 2,
    platform: 'Raydium',
  },
];
