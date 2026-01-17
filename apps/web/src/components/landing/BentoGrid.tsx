'use client';

import { motion } from 'framer-motion';
import { Search, Copy, ArrowRightLeft, Wallet } from 'lucide-react';

const bentoItems = [
  {
    id: 'sentinel',
    title: 'Rug-Scanner Sentinel',
    description: '30-second logic audits on every new pump.fun deployment. Instant threat detection.',
    icon: Search,
    gradient: 'from-orange-500/20 to-transparent',
    span: 'col-span-2',
  },
  {
    id: 'cloner',
    title: 'Metadata Cloner',
    description: 'Zero-loss identity replication. Same vibe, zero rug vectors.',
    icon: Copy,
    gradient: 'from-zinc-800/50 to-transparent',
    span: 'col-span-1',
  },
  {
    id: 'migration',
    title: 'Migration Hub',
    description: 'Victim relief program. Claim your allocation in the safe fork.',
    icon: ArrowRightLeft,
    gradient: 'from-zinc-800/50 to-transparent',
    span: 'col-span-1',
  },
  {
    id: 'treasury',
    title: '0.5% Fee Treasury',
    description: 'Every trade feeds the ecosystem. Market buys $FORK automatically.',
    icon: Wallet,
    gradient: 'from-orange-500/10 to-transparent',
    span: 'col-span-2',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function BentoGrid() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-orange-500 text-sm font-medium uppercase tracking-widest mb-4 block">
            The Qube System
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Precision Instruments
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Every tool designed to detect, diagnose, and deploy safe alternatives.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {bentoItems.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className={`${item.span} bento-item glow-border group`}
            >
              <div className={`relative p-8 h-full min-h-[200px] bg-gradient-to-br ${item.gradient}`}>
                {/* Icon */}
                <div className="mb-6">
                  <item.icon className="bento-icon w-8 h-8 text-zinc-400 transition-all duration-300" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold mb-3 group-hover:text-orange-500 transition-colors">
                  {item.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {item.description}
                </p>

                {/* Hover arrow */}
                <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
