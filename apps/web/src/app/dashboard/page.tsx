'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { RiskBadge } from '@/components/RiskBadge';
import { useTokens, useScanToken, useStats, ScannedToken } from '@/hooks/useTokens';
import { 
  Activity, 
  Search, 
  Filter, 
  AlertTriangle, 
  Shield, 
  TrendingUp,
  RefreshCw,
  Bell,
  ExternalLink,
  Zap,
} from 'lucide-react';

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'ALL'>('ALL');
  const [manualMint, setManualMint] = useState('');
  
  const { tokens, loading, error, refetch } = useTokens({
    riskLevel: filterRisk,
    search: searchQuery,
    limit: 50,
  });
  
  const { scanToken, scanning } = useScanToken();
  const { stats } = useStats();

  const handleManualScan = async () => {
    if (!manualMint.trim()) return;
    
    const result = await scanToken(manualMint.trim());
    if (result) {
      setManualMint('');
      refetch();
    }
  };

  const handleRescan = () => {
    refetch();
  };

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Dashboard Header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div>
                <h1 className="text-3xl font-serif font-bold mb-2 flex items-center gap-3">
                  <Activity className="w-8 h-8 text-accent" />
                  Rug Scanner Dashboard
                </h1>
                <p className="text-text-secondary">
                  Real-time monitoring of new token launches
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRescan}
                  disabled={loading}
                  className="btn-outline flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
                <button className="relative p-3 rounded-lg border border-zinc-700 text-zinc-400 hover:text-accent hover:border-accent/50 transition-colors">
                  <Bell className="w-5 h-5" />
                  {stats && stats.scanner.criticalTokens > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">
                      {stats.scanner.criticalTokens}
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <StatCard
              icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
              label="Critical Tokens"
              value={stats?.scanner.criticalTokens.toString() || '0'}
              trend="High risk detected"
              trendUp={false}
            />
            <StatCard
              icon={<Shield className="w-5 h-5 text-accent" />}
              label="Forks Available"
              value={stats?.forks.totalForks.toString() || '0'}
              trend="Safe alternatives"
              trendUp={true}
            />
            <StatCard
              icon={<Activity className="w-5 h-5 text-orange-400" />}
              label="Tokens Scanned"
              value={stats?.scanner.tokensScanned.toString() || '0'}
              trend="Total analyzed"
              trendUp={true}
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-green-500" />}
              label="Victims Protected"
              value={stats?.migration.victimsProtected.toString() || '0'}
              trend="Wallets helped"
              trendUp={true}
            />
          </motion.div>

          {/* Manual Scan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50"
          >
            <h3 className="font-serif text-lg font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              Manual Token Scan
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter token mint address..."
                value={manualMint}
                onChange={(e) => setManualMint(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent/50 font-mono text-sm"
              />
              <button
                onClick={handleManualScan}
                disabled={scanning || !manualMint.trim()}
                className="btn-accent flex items-center gap-2"
              >
                {scanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Scan Token
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by name, symbol, or mint address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent/50"
              />
            </div>
            
            {/* Risk Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-zinc-500" />
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value as RiskLevel | 'ALL')}
                className="px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-accent/50"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
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
          {loading && tokens.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 p-4 rounded-xl border border-accent/30 bg-accent/5"
            >
              <div className="flex items-center gap-4">
                <RefreshCw className="w-5 h-5 text-accent animate-spin" />
                <div>
                  <p className="text-accent font-mono">Loading tokens...</p>
                  <p className="text-zinc-500 text-sm">Fetching latest scan data</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Risk Summary */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50"
            >
              <h3 className="font-sans text-sm uppercase tracking-wider text-zinc-500 mb-4">
                Risk Distribution
              </h3>
              <div className="flex flex-wrap gap-4">
                <RiskStat level="CRITICAL" count={stats.scanner.riskDistribution['CRITICAL'] || 0} />
                <RiskStat level="HIGH" count={stats.scanner.riskDistribution['HIGH'] || 0} />
                <RiskStat level="MEDIUM" count={stats.scanner.riskDistribution['MEDIUM'] || 0} />
                <RiskStat level="LOW" count={stats.scanner.riskDistribution['LOW'] || 0} />
              </div>
            </motion.div>
          )}

          {/* Token Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tokens.length > 0 ? (
              tokens.map((token, index) => (
                <motion.div
                  key={token.mint}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  <TokenCard token={token} />
                </motion.div>
              ))
            ) : !loading && (
              <div className="col-span-2 text-center py-16">
                <Search className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500">No tokens found. Try scanning a token manually above.</p>
              </div>
            )}
          </div>

          {/* Load More */}
          {tokens.length > 0 && (
            <div className="mt-8 text-center">
              <button className="btn-outline">
                Load More Tokens
              </button>
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
  trend,
  trendUp,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
}) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-zinc-500 text-sm">{label}</span>
      </div>
      <div className="font-serif text-2xl font-bold text-white mb-1">
        {value}
      </div>
      <div className={`text-xs font-mono ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
        {trend}
      </div>
    </div>
  );
}

function RiskStat({ level, count }: { level: RiskLevel; count: number }) {
  return (
    <div className="flex items-center gap-3">
      <RiskBadge level={level} size="sm" />
      <span className="text-white font-mono">{count}</span>
    </div>
  );
}

function TokenCard({ token }: { token: ScannedToken }) {
  return (
    <div className="glass-card p-6 hover:border-accent/30 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {token.imageUrl ? (
            <img 
              src={token.imageUrl} 
              alt={token.name}
              className="w-12 h-12 rounded-xl object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
              <span className="text-lg font-bold text-zinc-600">
                {token.symbol.slice(0, 2)}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-serif font-bold text-white">{token.name}</h3>
            <p className="text-zinc-500 text-sm font-mono">${token.symbol}</p>
          </div>
        </div>
        <RiskBadge level={token.riskLevel} />
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-zinc-500 text-sm">Risk Score</span>
          <span className="font-mono text-white">{token.riskScore}/100</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all ${
              token.riskLevel === 'CRITICAL' ? 'bg-red-500' :
              token.riskLevel === 'HIGH' ? 'bg-orange-500' :
              token.riskLevel === 'MEDIUM' ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${token.riskScore}%` }}
          />
        </div>
      </div>

      {token.riskFactors.length > 0 && (
        <div className="mb-4">
          <p className="text-zinc-500 text-sm mb-2">Risk Factors:</p>
          <div className="flex flex-wrap gap-2">
            {token.riskFactors.slice(0, 3).map((factor, i) => (
              <span 
                key={i}
                className="px-2 py-1 text-xs rounded-lg bg-zinc-800 text-zinc-400"
              >
                {factor.name}
              </span>
            ))}
            {token.riskFactors.length > 3 && (
              <span className="px-2 py-1 text-xs rounded-lg bg-zinc-800 text-zinc-500">
                +{token.riskFactors.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
        <div className="text-xs text-zinc-600 font-mono">
          {token.mint.slice(0, 8)}...{token.mint.slice(-8)}
        </div>
        <div className="flex items-center gap-2">
          {token.forkable && !token.safeFork && (
            <span className="px-2 py-1 text-xs rounded bg-accent/20 text-accent">
              Forkable
            </span>
          )}
          {token.safeFork && (
            <span className="px-2 py-1 text-xs rounded bg-green-500/20 text-green-400">
              Fork: ${token.safeFork.symbol}
            </span>
          )}
          <a
            href={`https://solscan.io/token/${token.mint}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-zinc-500 hover:text-accent transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
