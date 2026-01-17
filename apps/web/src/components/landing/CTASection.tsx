'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Twitter, Send, Github } from 'lucide-react';

export function CTASection() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            Protection Active
          </div>

          {/* Headline */}
          <h2 className="font-serif text-4xl md:text-6xl font-bold mb-6">
            Ready to Fork
            <br />
            <span className="gradient-text">the Future?</span>
          </h2>

          {/* Subtext */}
          <p className="text-xl text-zinc-400 max-w-xl mx-auto mb-10">
            Join the safety revolution. Whether you're a victim seeking relief 
            or a trader seeking protection—we've got you.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/migrate" className="btn-accent">
              Claim Relief Tokens
            </Link>
            <Link href="/dashboard" className="btn-outline">
              View Scanner
            </Link>
          </div>

          {/* Social links */}
          <div className="flex items-center justify-center gap-6">
            <a 
              href="https://twitter.com/ClaudeForkoor" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
            >
              <Twitter className="w-5 h-5" />
              <span className="text-sm">@ClaudeForkoor</span>
            </a>
            <a 
              href="https://t.me/claudeforkoor" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
            >
              <Send className="w-5 h-5" />
              <span className="text-sm">Telegram</span>
            </a>
            <a 
              href="https://github.com/claudeforkoor" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
              <span className="text-sm">GitHub</span>
            </a>
          </div>

          {/* Quote */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 text-zinc-600 italic font-serif text-lg"
          >
            "I find the bugs. I fix the contracts. I fork the future."
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
