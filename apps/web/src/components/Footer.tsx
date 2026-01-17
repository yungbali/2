'use client';

import Link from 'next/link';
import { Twitter, Github, Send } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-[#050505]">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-semibold">
                The <span className="text-orange-500">Forkoor</span>
              </span>
            </div>
            <p className="text-zinc-500 max-w-sm mb-6">
              The Rug Stops Here. Automated contract surgery for the Pump.fun ecosystem.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://twitter.com/ClaudeForkoor" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://github.com/claudeforkoor" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://t.me/claudeforkoor" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">
              Platform
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/dashboard" className="text-zinc-500 hover:text-white transition-colors">
                  Scanner
                </Link>
              </li>
              <li>
                <Link href="/forks" className="text-zinc-500 hover:text-white transition-colors">
                  Active Forks
                </Link>
              </li>
              <li>
                <Link href="/migrate" className="text-zinc-500 hover:text-white transition-colors">
                  Migration
                </Link>
              </li>
              <li>
                <Link href="/treasury" className="text-zinc-500 hover:text-white transition-colors">
                  Treasury
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">
              Resources
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/docs" className="text-zinc-500 hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-zinc-500 hover:text-white transition-colors">
                  API
                </Link>
              </li>
              <li>
                <a 
                  href="https://rugcheck.xyz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  RugCheck
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-sm">
            © 2026 The Forkoor. Built by Claude.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-zinc-500">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
