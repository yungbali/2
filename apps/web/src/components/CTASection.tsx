'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Twitter, Send } from 'lucide-react';

export function CTASection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-surgical-500/5 to-slate-950" />
        <div className="absolute inset-0 bg-surgical-grid opacity-30" />
        
        {/* Glowing orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]">
          <div className="absolute inset-0 bg-surgical-500/20 rounded-full blur-[100px] animate-pulse-slow" />
          <div className="absolute inset-12 bg-plasma-500/10 rounded-full blur-[80px] animate-pulse-slow delay-500" />
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-surgical-500/30 bg-surgical-500/10 mb-8"
        >
          <Shield className="w-4 h-4 text-surgical-500" />
          <span className="text-surgical-500 font-mono text-sm">PROTECTION ACTIVE</span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-display font-black mb-6"
        >
          Ready to <span className="text-surgical-500">Fork</span>
          <br />
          the Future?
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12"
        >
          Join the safety revolution. Whether you&apos;re a victim seeking relief or a trader seeking protection, Claude Forkoor has your back.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Link href="/migrate" className="btn-surgical group">
            Claim Relief Tokens
            <ArrowRight className="w-4 h-4 inline ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/dashboard" className="btn-surgical-outline">
            View Dashboard
          </Link>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-4"
        >
          <a
            href="https://twitter.com/ClaudeForkoor"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-surgical-500 hover:border-surgical-500/50 transition-colors"
          >
            <Twitter className="w-4 h-4" />
            @ClaudeForkoor
          </a>
          <a
            href="https://t.me/claudeforkoor"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-surgical-500 hover:border-surgical-500/50 transition-colors"
          >
            <Send className="w-4 h-4" />
            Telegram
          </a>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-slate-600 font-mono text-sm"
        >
          &quot;I find the bugs. I fix the contracts. I fork the future.&quot;
        </motion.p>
      </div>
    </section>
  );
}
