'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-surgical-grid opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-surgical-500/5 via-transparent to-plasma-500/5" />
      
      {/* Animated background circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-surgical-500/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-plasma-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-surgical-500/30 bg-surgical-500/10 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-surgical-500 animate-pulse" />
            <span className="text-surgical-500 font-mono text-sm">OPERATIONAL • 247 TOKENS ANALYZED</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tight mb-6"
          >
            <span className="text-white">THE RUG</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-surgical-500 via-surgical-400 to-plasma-500 glow-text">
              STOPS HERE
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-slate-400 font-mono mb-8 max-w-2xl mx-auto"
          >
            Forked, Fixed, and Fired Up.
            <br />
            <span className="text-surgical-500">Automated Contract Surgeon for Solana.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link href="/dashboard" className="btn-surgical">
              <Zap className="w-5 h-5 inline mr-2" />
              View Dashboard
            </Link>
            <Link href="/migrate" className="btn-surgical-outline">
              <Shield className="w-5 h-5 inline mr-2" />
              Claim Relief Tokens
            </Link>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            <StatCard
              icon={<AlertTriangle className="w-5 h-5 text-vital-red" />}
              value="1,247"
              label="Rugs Detected"
              color="red"
            />
            <StatCard
              icon={<Shield className="w-5 h-5 text-surgical-500" />}
              value="89"
              label="Safe Forks"
              color="green"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-plasma-500" />}
              value="$2.4M"
              label="Value Protected"
              color="blue"
            />
            <StatCard
              icon={<Zap className="w-5 h-5 text-vital-yellow" />}
              value="12,893"
              label="Victims Saved"
              color="yellow"
            />
          </motion.div>
        </div>
      </div>

      {/* Heartbeat Monitor Line */}
      <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden opacity-30">
        <svg
          viewBox="0 0 1200 100"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0,50 L200,50 L220,20 L240,80 L260,30 L280,70 L300,50 L500,50 L520,20 L540,80 L560,30 L580,70 L600,50 L800,50 L820,20 L840,80 L860,30 L880,70 L900,50 L1200,50"
            fill="none"
            stroke="url(#heartbeatGradient)"
            strokeWidth="2"
            className="heartbeat-line"
          />
          <defs>
            <linearGradient id="heartbeatGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00e6ac" stopOpacity="0" />
              <stop offset="50%" stopColor="#00e6ac" stopOpacity="1" />
              <stop offset="100%" stopColor="#00e6ac" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
}

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: 'red' | 'green' | 'blue' | 'yellow';
}) {
  const colorClasses = {
    red: 'border-vital-red/30 bg-vital-red/5',
    green: 'border-surgical-500/30 bg-surgical-500/5',
    blue: 'border-plasma-500/30 bg-plasma-500/5',
    yellow: 'border-vital-yellow/30 bg-vital-yellow/5',
  };

  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]} backdrop-blur-sm`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
      </div>
      <div className="font-display text-2xl md:text-3xl font-bold text-white">
        {value}
      </div>
      <div className="text-slate-500 text-sm font-mono">{label}</div>
    </div>
  );
}
