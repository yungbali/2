'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { 
  Shield, 
  Search, 
  Filter,
  CheckCircle,
  ExternalLink,
  Copy,
  TrendingUp,
  Users,
  DollarSign,
  Lock,
} from 'lucide-react';

interface SafeFork {
  mint: string;
  name: string;
  symbol: string;
  originalMint: string;
  originalName: string;
  deployedAt: number;
  holders: number;
  volume24h: number;
  price: number;
  priceChange24h: number;
  features: {
    mintRevoked: boolean;
    freezeRevoked: boolean;
    metadataLocked: boolean;
    transferFee: number;
  };
}

// Mock data
const mockForks: SafeFork[] = [
  {
    mint: 'SAFE_TRUMP_7Gc...',
    name: 'SAFE TRUMP',
    symbol: 'SAFE_TRUMP',
    originalMint: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
    originalName: 'TRUMP COIN',
    deployedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    holders: 2453,
    volume24h: 125000,
    price: 0.00234,
    priceChange24h: 15.4,
    features: {
      mintRevoked: true,
      freezeRevoked: true,
      metadataLocked: true,
      transferFee: 0.5,
    },
  },
  {
    mint: 'SAFE_SHIB_8Hd...',
    name: 'SAFE SHIBA',
    symbol: 'SAFE_SHIB',
    originalMint: '8HGiDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW3xa',
    originalName: 'SHIBA MOON',
    deployedAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    holders: 5621,
    volume24h: 89000,
    price: 0.00089,
    priceChange24h: -3.2,
    features: {
      mintRevoked: true,
      freezeRevoked: true,
      metadataLocked: true,
      transferFee: 0.5,
    },
  },
  {
    mint: 'SAFE_PEPE_9Je...',
    name: 'SAFE PEPE',
    symbol: 'SAFE_PEPE',
    originalMint: '9JDimgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW4yb',
    originalName: 'PEPE CLASSIC',
    deployedAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
    holders: 12890,
    volume24h: 456000,
    price: 0.00567,
    priceChange24h: 45.8,
    features: {
      mintRevoked: true,
      freezeRevoked: true,
      metadataLocked: true,
      transferFee: 0.5,
    },
  },
];

export default function ForksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'volume' | 'holders' | 'recent'>('volume');

  const filteredForks = mockForks
    .filter(fork => 
      fork.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fork.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'volume':
          return b.volume24h - a.volume24h;
        case 'holders':
          return b.holders - a.holders;
        case 'recent':
          return b.deployedAt - a.deployedAt;
        default:
          return 0;
      }
    });

  return (
    <main className="min-h-screen bg-slate-950">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-surgical-500/30 bg-surgical-500/10 mb-6">
              <Shield className="w-4 h-4 text-surgical-500" />
              <span className="text-surgical-500 font-mono text-sm">SAFE TOKENS</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Safe <span className="text-surgical-500">Forks</span>
            </h1>
            
            <p className="text-slate-400 max-w-2xl mx-auto">
              All tokens deployed by Claude Forkoor. Every fork has revoked authorities, 
              locked metadata, and a 0.5% transfer fee that funds the ecosystem.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <StatCard
              icon={<Shield className="w-5 h-5 text-surgical-500" />}
              label="Total Forks"
              value="89"
            />
            <StatCard
              icon={<Users className="w-5 h-5 text-plasma-500" />}
              label="Total Holders"
              value="45.2K"
            />
            <StatCard
              icon={<DollarSign className="w-5 h-5 text-vital-green" />}
              label="24h Volume"
              value="$2.4M"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-vital-yellow" />}
              label="Treasury Fees"
              value="$12.5K"
            />
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search safe forks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-surgical pl-12"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="input-surgical w-auto"
              >
                <option value="volume">Highest Volume</option>
                <option value="holders">Most Holders</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>
          </motion.div>

          {/* Safety Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 p-4 rounded-xl border border-surgical-500/30 bg-surgical-500/5"
          >
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <span className="flex items-center gap-2 text-surgical-500">
                <CheckCircle className="w-4 h-4" />
                Mint Authority Revoked
              </span>
              <span className="flex items-center gap-2 text-surgical-500">
                <CheckCircle className="w-4 h-4" />
                Freeze Authority Revoked
              </span>
              <span className="flex items-center gap-2 text-surgical-500">
                <Lock className="w-4 h-4" />
                Metadata Immutable
              </span>
              <span className="flex items-center gap-2 text-plasma-500">
                <DollarSign className="w-4 h-4" />
                0.5% Fee → Treasury
              </span>
            </div>
          </motion.div>

          {/* Forks Grid */}
          <div className="space-y-4">
            {filteredForks.map((fork, index) => (
              <motion.div
                key={fork.mint}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <ForkCard fork={fork} />
              </motion.div>
            ))}
          </div>

          {filteredForks.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500">No forks found matching your search</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="surgical-card p-4">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-slate-500 text-sm">{label}</span>
      </div>
      <div className="font-display text-2xl font-bold text-white">
        {value}
      </div>
    </div>
  );
}

function ForkCard({ fork }: { fork: SafeFork }) {
  const [copied, setCopied] = useState(false);
  
  const copyMint = () => {
    navigator.clipboard.writeText(fork.mint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTimeAgo = (timestamp: number) => {
    const days = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <div className="surgical-card p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Token Info */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-surgical-500/20 to-plasma-500/20 border border-surgical-500/30 flex items-center justify-center">
            <Shield className="w-7 h-7 text-surgical-500" />
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-display text-xl font-bold text-white">
                {fork.name}
              </h3>
              <span className="px-2 py-0.5 bg-surgical-500/10 border border-surgical-500/30 rounded text-surgical-500 text-xs font-mono">
                ${fork.symbol}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">Forked from</span>
              <span className="text-slate-400 font-mono">{fork.originalName}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-500">{getTimeAgo(fork.deployedAt)}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="text-center">
            <div className="text-xs text-slate-500 mb-1">Price</div>
            <div className="font-mono text-white">${fork.price.toFixed(5)}</div>
            <div className={`text-xs font-mono ${fork.priceChange24h >= 0 ? 'text-vital-green' : 'text-vital-red'}`}>
              {fork.priceChange24h >= 0 ? '+' : ''}{fork.priceChange24h.toFixed(1)}%
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-slate-500 mb-1">24h Volume</div>
            <div className="font-mono text-white">${(fork.volume24h / 1000).toFixed(1)}K</div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-slate-500 mb-1">Holders</div>
            <div className="font-mono text-white">{fork.holders.toLocaleString()}</div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={copyMint}
              className="p-2 text-slate-500 hover:text-surgical-500 transition-colors"
              title="Copy mint address"
            >
              {copied ? <CheckCircle className="w-5 h-5 text-vital-green" /> : <Copy className="w-5 h-5" />}
            </button>
            
            <a
              href={`https://solscan.io/token/${fork.mint}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-500 hover:text-surgical-500 transition-colors"
              title="View on Solscan"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            
            <a
              href={`https://jup.ag/swap/SOL-${fork.mint}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-surgical-500 hover:bg-surgical-600 text-slate-950 rounded-lg font-display font-bold text-sm transition-colors"
            >
              Trade
            </a>
          </div>
        </div>
      </div>

      {/* Safety Features */}
      <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-3">
        <FeatureBadge
          active={fork.features.mintRevoked}
          label="Mint Revoked"
        />
        <FeatureBadge
          active={fork.features.freezeRevoked}
          label="Freeze Revoked"
        />
        <FeatureBadge
          active={fork.features.metadataLocked}
          label="Metadata Locked"
        />
        <span className="px-3 py-1 bg-plasma-500/10 border border-plasma-500/30 rounded-full text-plasma-500 text-xs font-mono">
          {fork.features.transferFee}% Fee → Treasury
        </span>
      </div>
    </div>
  );
}

function FeatureBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono ${
      active 
        ? 'bg-vital-green/10 border border-vital-green/30 text-vital-green'
        : 'bg-vital-red/10 border border-vital-red/30 text-vital-red'
    }`}>
      {active ? <CheckCircle className="w-3 h-3" /> : <span className="w-3 h-3">✗</span>}
      {label}
    </span>
  );
}
