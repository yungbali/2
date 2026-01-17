'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Zap, DollarSign, TrendingUp } from 'lucide-react';

const loopSteps = [
  {
    icon: AlertTriangle,
    action: 'Detect',
    label: 'Rug Vulnerability',
    color: 'text-red-400',
  },
  {
    icon: Zap,
    action: 'Deploy',
    label: 'Safe Fork',
    color: 'text-orange-400',
  },
  {
    icon: DollarSign,
    action: 'Collect',
    label: '0.5% Protocol Fee',
    color: 'text-green-400',
  },
  {
    icon: TrendingUp,
    action: 'Execute',
    label: 'Market Buy $FORK',
    color: 'text-blue-400',
  },
];

export function RalphLoop() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-orange-500 text-sm font-medium uppercase tracking-widest mb-4 block">
            The Flywheel
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            The Ralph Loop
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Innovation is just copying and improving. Every rug detected feeds the machine.
          </p>
        </motion.div>

        {/* Loop visualization */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Center circle */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-zinc-800 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/20 to-transparent flex items-center justify-center">
              <span className="font-serif text-2xl font-bold gradient-text">∞</span>
            </div>
          </div>

          {/* Loop steps */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative">
            {loopSteps.map((step, index) => (
              <motion.div
                key={step.action}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="glass-card p-6 text-center group hover:border-orange-500/30"
              >
                <div className={`inline-flex p-3 rounded-xl bg-zinc-900 mb-4 ${step.color}`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <div className="font-mono text-xs text-zinc-500 uppercase tracking-wider mb-1">
                  {step.action}
                </div>
                <div className="font-semibold">
                  {step.label}
                </div>
                
                {/* Arrow to next */}
                {index < loopSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -translate-y-1/2 text-zinc-700" style={{ left: `${25 + index * 25}%` }}>
                    →
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Return arrow */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="hidden md:flex justify-center mt-8"
          >
            <div className="flex items-center gap-2 text-zinc-600 text-sm">
              <svg className="w-12 h-4" viewBox="0 0 48 16" fill="none">
                <path 
                  d="M47 8H1M1 8L8 1M1 8L8 15" 
                  stroke="currentColor" 
                  strokeWidth="1" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-mono text-xs uppercase tracking-wider">Loop back</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
