'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, AlertTriangle, Shield, Coins } from 'lucide-react';

const journeys = [
  {
    phase: 'Phase 1',
    title: 'The Victim Experience',
    icon: <AlertTriangle className="w-6 h-6" />,
    color: 'vital-red',
    scenario: 'You buy $SHIBA_MOON on pump.fun. Five minutes later, the developer mints 1 trillion more tokens and dumps.',
    touchpoint: 'You see a tweet from @ClaudeForkoor: "I saw the $SHIBA_MOON rug. It had a live Mint Authority. I have forked it. $SAFE_MOON is now live. Authorities revoked. LP Burned. Claim your victim-relief tokens."',
  },
  {
    phase: 'Phase 2',
    title: 'The Migration',
    icon: <Wallet className="w-6 h-6" />,
    color: 'plasma',
    scenario: 'You visit claudeforkoor.xyz and connect your wallet.',
    touchpoint: 'Claude scans your wallet, confirms you held the rugged $SHIBA_MOON, and allows you to claim 1,000 $SAFE_MOON for a tiny gas fee.',
  },
  {
    phase: 'Phase 3',
    title: 'The Safe Trade',
    icon: <Shield className="w-6 h-6" />,
    color: 'surgical',
    scenario: 'A trader sees a token trending but notices the "Rug Score" is 80/100.',
    touchpoint: 'They check the Claude Forkoor Dashboard. Claude has already prepared a "Safe Fork." The trader chooses the Safe Fork because the Ralph Loop ensures fees help $FORK.',
  },
  {
    phase: 'Phase 4',
    title: 'Protocol Evolution',
    icon: <Coins className="w-6 h-6" />,
    color: 'vital-yellow',
    scenario: 'The $FORK treasury has bought back $50,000 worth of $FORK.',
    touchpoint: 'Claude announces: "Treasury Milestone reached. I am now upgrading my Rug-Sense to scan Raydium pools in addition to Pump.fun. The Safety Machine is growing."',
  },
];

export function HowItWorksSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-slate-950" />
      <div className="absolute inset-0 bg-surgical-grid opacity-20" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-plasma-500/30 bg-plasma-500/10 mb-6"
          >
            <span className="text-plasma-500 font-mono text-sm">USER JOURNEY</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-bold mb-4"
          >
            The <span className="text-plasma-500">Forkoor</span> Path
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-2xl mx-auto"
          >
            From victim to victor. See how Claude Forkoor transforms rug pull disasters into opportunities.
          </motion.p>
        </div>

        {/* Journey Steps */}
        <div className="space-y-8">
          {journeys.map((journey, index) => (
            <JourneyCard key={journey.phase} journey={journey} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function JourneyCard({ 
  journey, 
  index 
}: { 
  journey: typeof journeys[0]; 
  index: number;
}) {
  const colorClasses: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    'vital-red': {
      bg: 'bg-vital-red/5',
      border: 'border-vital-red/20',
      text: 'text-vital-red',
      icon: 'bg-vital-red/20',
    },
    'plasma': {
      bg: 'bg-plasma-500/5',
      border: 'border-plasma-500/20',
      text: 'text-plasma-500',
      icon: 'bg-plasma-500/20',
    },
    'surgical': {
      bg: 'bg-surgical-500/5',
      border: 'border-surgical-500/20',
      text: 'text-surgical-500',
      icon: 'bg-surgical-500/20',
    },
    'vital-yellow': {
      bg: 'bg-vital-yellow/5',
      border: 'border-vital-yellow/20',
      text: 'text-vital-yellow',
      icon: 'bg-vital-yellow/20',
    },
  };

  const colors = colorClasses[journey.color];
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={`relative ${colors.bg} ${colors.border} border rounded-2xl p-6 md:p-8`}
    >
      {/* Phase indicator */}
      <div className="absolute -top-3 left-6 md:left-8">
        <span className={`px-3 py-1 ${colors.bg} ${colors.border} border rounded-full font-mono text-xs ${colors.text}`}>
          {journey.phase}
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mt-2">
        {/* Icon */}
        <div className={`flex-shrink-0 w-12 h-12 ${colors.icon} rounded-xl flex items-center justify-center ${colors.text}`}>
          {journey.icon}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className={`font-display text-xl font-bold mb-4 ${colors.text}`}>
            {journey.title}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Scenario */}
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-2 block">
                Scenario
              </span>
              <p className="text-slate-300 text-sm leading-relaxed">
                {journey.scenario}
              </p>
            </div>
            
            {/* Touchpoint */}
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-2 block">
                Touchpoint
              </span>
              <p className="text-slate-300 text-sm leading-relaxed">
                {journey.touchpoint}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
