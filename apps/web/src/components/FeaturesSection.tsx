'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Copy, 
  Shield, 
  Wallet,
  RefreshCw,
  Lock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const features = [
  {
    icon: <Search className="w-8 h-8" />,
    title: 'Rug-Scanner (Sentinel)',
    description: 'Uses RugCheck API and on-chain monitoring to flag "High Risk" tokens within 30 seconds of launch.',
    color: 'surgical',
    details: [
      'Real-time pump.fun monitoring',
      'Mint authority detection',
      'Freeze authority scanning',
      'Holder concentration analysis',
    ],
  },
  {
    icon: <Copy className="w-8 h-8" />,
    title: 'Metadata Cloner',
    description: 'Programmatically scrapes the name, symbol, and IPFS image of target tokens for safe replication.',
    color: 'plasma',
    details: [
      'Automatic metadata extraction',
      'IPFS image preservation',
      'Symbol/name sanitization',
      'Attribute inheritance',
    ],
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Safe Fork Deployment',
    description: 'Token-2022 Standard deployment with immutable configuration. Authorities revoked in same transaction.',
    color: 'surgical',
    details: [
      'Token-2022 with Transfer Fee',
      'Atomic authority revocation',
      'Immutable metadata lock',
      '0.5% fee to treasury',
    ],
  },
  {
    icon: <Wallet className="w-8 h-8" />,
    title: 'Migration Hub',
    description: 'UI for victims. Connect wallet, verify loss, receive Loyalty Allocation in the safe fork.',
    color: 'plasma',
    details: [
      'Wallet-based verification',
      'Loss amount calculation',
      'Fair allocation formula',
      'One-click claiming',
    ],
  },
  {
    icon: <RefreshCw className="w-8 h-8" />,
    title: 'The Ralph Loop',
    description: 'Automated feedback system. Fees → Treasury → Buybacks → Growth → More Forks.',
    color: 'surgical',
    details: [
      'Automatic fee collection',
      '$1,000 buyback threshold',
      'Market buy execution',
      'Expanding coverage',
    ],
  },
  {
    icon: <Lock className="w-8 h-8" />,
    title: 'FORK-Vault Treasury',
    description: 'Token-2022 Transfer Fee extension. 0.5% of every trade funds the $FORK ecosystem.',
    color: 'plasma',
    details: [
      'Transparent fee tracking',
      'Automatic accumulation',
      'Community-owned value',
      'On-chain verifiable',
    ],
  },
];

export function FeaturesSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-surgical-500/30 bg-surgical-500/10 mb-6"
          >
            <span className="text-surgical-500 font-mono text-sm">THE SURGEON&apos;S TOOLS</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-bold mb-4"
          >
            Precision <span className="text-surgical-500">Instruments</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-2xl mx-auto"
          >
            Every tool designed to detect, diagnose, and deploy safe alternatives to rugged tokens.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>

        {/* Process Flow */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-24"
        >
          <h3 className="text-2xl font-display font-bold text-center mb-12">
            The <span className="text-surgical-500">Surgical Process</span>
          </h3>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <ProcessStep number={1} title="Detect" icon={<AlertCircle />} />
            <Arrow />
            <ProcessStep number={2} title="Analyze" icon={<Search />} />
            <Arrow />
            <ProcessStep number={3} title="Clone" icon={<Copy />} />
            <Arrow />
            <ProcessStep number={4} title="Deploy" icon={<Shield />} />
            <Arrow />
            <ProcessStep number={5} title="Protect" icon={<CheckCircle2 />} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeatureCard({ 
  feature, 
  index 
}: { 
  feature: typeof features[0]; 
  index: number;
}) {
  const colorClasses = {
    surgical: {
      icon: 'text-surgical-500',
      border: 'border-surgical-500/20 hover:border-surgical-500/40',
      glow: 'group-hover:shadow-surgical-500/20',
    },
    plasma: {
      icon: 'text-plasma-500',
      border: 'border-plasma-500/20 hover:border-plasma-500/40',
      glow: 'group-hover:shadow-plasma-500/20',
    },
  };

  const colors = colorClasses[feature.color as keyof typeof colorClasses];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={`group surgical-card p-6 ${colors.border} hover:shadow-lg ${colors.glow} transition-all duration-300`}
    >
      <div className={`${colors.icon} mb-4`}>
        {feature.icon}
      </div>
      
      <h3 className="font-display text-xl font-bold mb-2 text-white">
        {feature.title}
      </h3>
      
      <p className="text-slate-400 text-sm mb-4">
        {feature.description}
      </p>
      
      <ul className="space-y-2">
        {feature.details.map((detail) => (
          <li key={detail} className="flex items-center gap-2 text-sm text-slate-500">
            <span className={`w-1 h-1 rounded-full ${feature.color === 'surgical' ? 'bg-surgical-500' : 'bg-plasma-500'}`} />
            {detail}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function ProcessStep({ 
  number, 
  title, 
  icon 
}: { 
  number: number; 
  title: string; 
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-surgical-500/20 to-plasma-500/20 border border-surgical-500/30 flex items-center justify-center text-surgical-500">
        {icon}
      </div>
      <span className="font-display text-sm uppercase tracking-wider text-white">
        {title}
      </span>
      <span className="text-xs text-slate-600 font-mono">Step {number}</span>
    </div>
  );
}

function Arrow() {
  return (
    <div className="hidden md:block text-surgical-500/50">
      <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
        <path
          d="M0 10H35M35 10L25 2M35 10L25 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
