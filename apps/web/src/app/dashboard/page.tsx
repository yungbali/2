'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TokenCard, mockTokens } from '@/components/TokenCard';
import { RiskBadge } from '@/components/RiskBadge';
import { 
  Activity, 
  Search, 
  Filter, 
  AlertTriangle, 
  Shield, 
  TrendingUp,
  RefreshCw,
  Bell,
} from 'lucide-react';

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'ALL'>('ALL');
  const [isScanning, setIsScanning] = useState(false);

  const filteredTokens = mockTokens.filter(token => {
    const matchesSearch = token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         token.mint.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = filterRisk === 'ALL' || token.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  return (
    <main className="min-h-screen bg-slate-950">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Dashboard Header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div>
                <h1 className="text-3xl font-display font-bold mb-2">
                  <Activity className="w-8 h-8 inline mr-3 text-surgical-500" />
                  Rug Scanner Dashboard
                </h1>
                <p className="text-slate-400">
                  Real-time monitoring of new token launches
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleScan}
                  disabled={isScanning}
                  className="btn-surgical-outline flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                  {isScanning ? 'Scanning...' : 'Manual Scan'}
                </button>
                <button className="relative p-3 rounded-lg border border-slate-700 text-slate-400 hover:text-surgical-500 hover:border-surgical-500/50 transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-vital-red rounded-full text-[10px] flex items-center justify-center">
                    3
                  </span>
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
              icon={<AlertTriangle className="w-5 h-5 text-vital-red" />}
              label="Critical Tokens"
              value="23"
              trend="+5 today"
              trendUp={false}
            />
            <StatCard
              icon={<Shield className="w-5 h-5 text-surgical-500" />}
              label="Forks Available"
              value="89"
              trend="+12 this week"
              trendUp={true}
            />
            <StatCard
              icon={<Activity className="w-5 h-5 text-plasma-500" />}
              label="Tokens Scanned"
              value="1,247"
              trend="Last 24h"
              trendUp={true}
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-vital-green" />}
              label="Victims Protected"
              value="$2.4M"
              trend="All time"
              trendUp={true}
            />
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
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, symbol, or mint address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-surgical pl-12"
              />
            </div>
            
            {/* Risk Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-500" />
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value as RiskLevel | 'ALL')}
                className="input-surgical w-auto"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </motion.div>

          {/* Scanning Animation */}
          {isScanning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 p-4 rounded-xl border border-surgical-500/30 bg-surgical-500/5"
            >
              <div className="flex items-center gap-4">
                <div className="spinner" />
                <div>
                  <p className="text-surgical-500 font-mono">Scanning pump.fun for new launches...</p>
                  <p className="text-slate-500 text-sm">Analyzing smart contracts for rug vectors</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Risk Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 p-4 rounded-xl border border-slate-800 bg-slate-900/50"
          >
            <h3 className="font-display text-sm uppercase tracking-wider text-slate-500 mb-4">
              Risk Distribution (Last 24h)
            </h3>
            <div className="flex flex-wrap gap-4">
              <RiskStat level="CRITICAL" count={23} total={mockTokens.length} />
              <RiskStat level="HIGH" count={45} total={mockTokens.length} />
              <RiskStat level="MEDIUM" count={89} total={mockTokens.length} />
              <RiskStat level="LOW" count={12} total={mockTokens.length} />
            </div>
          </motion.div>

          {/* Token Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTokens.length > 0 ? (
              filteredTokens.map((token, index) => (
                <motion.div
                  key={token.mint}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <TokenCard token={token} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-2 text-center py-16">
                <Search className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500">No tokens found matching your criteria</p>
              </div>
            )}
          </div>

          {/* Load More */}
          {filteredTokens.length > 0 && (
            <div className="mt-8 text-center">
              <button className="btn-surgical-outline">
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
    <div className="surgical-card p-4">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-slate-500 text-sm">{label}</span>
      </div>
      <div className="font-display text-2xl font-bold text-white mb-1">
        {value}
      </div>
      <div className={`text-xs font-mono ${trendUp ? 'text-vital-green' : 'text-vital-red'}`}>
        {trend}
      </div>
    </div>
  );
}

function RiskStat({ level, count, total }: { level: RiskLevel; count: number; total: number }) {
  const percentage = Math.round((count / total) * 100);
  
  return (
    <div className="flex items-center gap-3">
      <RiskBadge level={level} size="sm" />
      <span className="text-white font-mono">{count}</span>
      <span className="text-slate-600 text-sm">({percentage}%)</span>
    </div>
  );
}
