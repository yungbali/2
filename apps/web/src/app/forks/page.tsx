'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useForks, SafeFork } from '@/hooks/useForks';
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
  RefreshCw,
} from 'lucide-react';

export default function ForksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'volume' | 'holders' | 'recent'>('recent');

  const { forks, stats, loading, error, refetch } = useForks({
    search: searchQuery,
    sortBy,
    limit: 50,
  });

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/10 mb-6">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-accent font-mono text-sm">SAFE TOKENS</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Safe <span className="text-accent">Forks</span>
            </h1>
            
            <p className="text-text-secondary max-w-2xl mx-auto">
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
              icon={<Shield className="w-5 h-5 text-accent" />}
              label="Total Forks"
              value={stats?.totalForks.toString() || '0'}
            />
            <StatCard
              icon={<Users className="w-5 h-5 text-orange-400" />}
              label="Total Holders"
              value={formatNumber(stats?.totalHolders || 0)}
            />
            <StatCard
              icon={<DollarSign className="w-5 h-5 text-green-500" />}
              label="24h Volume"
              value={`$${formatNumber(stats?.totalVolume24h || 0)}`}
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-yellow-500" />}
              label="Treasury Fees"
              value="$0"
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
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search safe forks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent/50"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-zinc-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-accent/50"
              >
                <option value="recent">Most Recent</option>
                <option value="volume">Highest Volume</option>
                <option value="holders">Most Holders</option>
              </select>
            </div>

            <button
              onClick={() => refetch()}
              disabled={loading}
              className="btn-outline flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </motion.div>

          {/* Safety Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 p-4 rounded-xl border border-accent/30 bg-accent/5"
          >
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <span className="flex items-center gap-2 text-accent">
                <CheckCircle className="w-4 h-4" />
                Mint Authority Revoked
              </span>
              <span className="flex items-center gap-2 text-accent">
                <CheckCircle className="w-4 h-4" />
                Freeze Authority Revoked
              </span>
              <span className="flex items-center gap-2 text-accent">
                <Lock className="w-4 h-4" />
                Metadata Immutable
              </span>
              <span className="flex items-center gap-2 text-orange-400">
                <DollarSign className="w-4 h-4" />
                0.5% Fee → Treasury
              </span>
            </div>
          </motion.div>

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400"
            >
              {error}
            </motion.div>
          )}

          {/* Loading State */}
          {loading && forks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <RefreshCw className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
              <p className="text-zinc-500">Loading safe forks...</p>
            </motion.div>
          )}

          {/* Forks Grid */}
          <div className="space-y-4">
            {forks.length > 0 ? (
              forks.map((fork, index) => (
                <motion.div
                  key={fork.mint}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  <ForkCard fork={fork} />
                </motion.div>
              ))
            ) : !loading && (
              <div className="text-center py-16">
                <Shield className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500 mb-2">No safe forks deployed yet</p>
                <p className="text-zinc-600 text-sm">
                  Forks will appear here once high-risk tokens are identified and fixed.
                </p>
              </div>
            )}
          </div>
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
    <div className="glass-card p-4">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-zinc-500 text-sm">{label}</span>
      </div>
      <div className="font-serif text-2xl font-bold text-white">
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

  const getTimeAgo = (timestamp: string) => {
    const days = Math.floor((Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <div className="glass-card p-6 hover:border-accent/30 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Token Info */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-orange-500/20 border border-accent/30 flex items-center justify-center">
            <Shield className="w-7 h-7 text-accent" />
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-serif text-xl font-bold text-white">
                {fork.name}
              </h3>
              <span className="px-2 py-0.5 bg-accent/10 border border-accent/30 rounded text-accent text-xs font-mono">
                ${fork.symbol}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="text-zinc-500">Forked from</span>
              <span className="text-zinc-400 font-mono">{fork.originalToken.name}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-500">{getTimeAgo(fork.deployedAt)}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="text-center">
            <div className="text-xs text-zinc-500 mb-1">Price</div>
            <div className="font-mono text-white">${fork.price.toFixed(5)}</div>
            <div className={`text-xs font-mono ${fork.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {fork.priceChange24h >= 0 ? '+' : ''}{fork.priceChange24h.toFixed(1)}%
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-zinc-500 mb-1">24h Volume</div>
            <div className="font-mono text-white">${formatNumber(fork.volume24h)}</div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-zinc-500 mb-1">Holders</div>
            <div className="font-mono text-white">{fork.holders.toLocaleString()}</div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={copyMint}
              className="p-2 text-zinc-500 hover:text-accent transition-colors"
              title="Copy mint address"
            >
              {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            </button>
            
            <a
              href={`https://solscan.io/token/${fork.mint}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-zinc-500 hover:text-accent transition-colors"
              title="View on Solscan"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            
            <a
              href={`https://jup.ag/swap/SOL-${fork.mint}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent text-sm"
            >
              Trade
            </a>
          </div>
        </div>
      </div>

      {/* Safety Features */}
      <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-wrap gap-3">
        <FeatureBadge active={fork.mintRevoked} label="Mint Revoked" />
        <FeatureBadge active={fork.freezeRevoked} label="Freeze Revoked" />
        <FeatureBadge active={fork.metadataLocked} label="Metadata Locked" />
        <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-full text-orange-400 text-xs font-mono">
          {fork.transferFeeBps / 100}% Fee → Treasury
        </span>
      </div>
    </div>
  );
}

function FeatureBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono ${
      active 
        ? 'bg-green-500/10 border border-green-500/30 text-green-500'
        : 'bg-red-500/10 border border-red-500/30 text-red-500'
    }`}>
      {active ? <CheckCircle className="w-3 h-3" /> : <span className="w-3 h-3">✗</span>}
      {label}
    </span>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
