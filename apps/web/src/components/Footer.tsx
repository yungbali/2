'use client';

import React from 'react';
import Link from 'next/link';
import { Twitter, Github, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-surgical-500/20 bg-slate-950/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-surgical-500 to-plasma-500 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-950" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L12 8M12 8L7 13M12 8L17 13" strokeLinecap="round" />
                  <path d="M4 14C4 14 6 16 12 22C18 16 20 14 20 14" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-display text-lg font-bold tracking-wider">
                CLAUDE <span className="text-surgical-500">FORKOOR</span>
              </span>
            </div>
            <p className="text-slate-500 text-sm max-w-md mb-6">
              The Rug Stops Here. Forked, Fixed, and Fired Up.
              <br />
              Automated Contract Surgeon for Solana.
            </p>
            <div className="flex gap-4">
              <SocialLink href="https://twitter.com/ClaudeForkoor" icon={<Twitter className="w-5 h-5" />} />
              <SocialLink href="https://github.com/claudeforkoor" icon={<Github className="w-5 h-5" />} />
              <SocialLink href="https://t.me/claudeforkoor" icon={<MessageCircle className="w-5 h-5" />} />
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-sm uppercase tracking-wider text-surgical-500 mb-4">
              Platform
            </h4>
            <ul className="space-y-2">
              <FooterLink href="/dashboard">Dashboard</FooterLink>
              <FooterLink href="/migrate">Migration Hub</FooterLink>
              <FooterLink href="/forks">Safe Forks</FooterLink>
              <FooterLink href="/treasury">Treasury Stats</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm uppercase tracking-wider text-surgical-500 mb-4">
              Resources
            </h4>
            <ul className="space-y-2">
              <FooterLink href="/docs">Documentation</FooterLink>
              <FooterLink href="/api">API</FooterLink>
              <FooterLink href="/faq">FAQ</FooterLink>
              <FooterLink href="https://rugcheck.xyz" external>RugCheck</FooterLink>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-sm font-mono">
            © {new Date().getFullYear()} Claude Forkoor. Built for degens, by Claude.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-surgical-500 animate-pulse" />
            <span className="text-slate-500 font-mono">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-10 h-10 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:text-surgical-500 hover:border-surgical-500/50 transition-colors"
    >
      {icon}
    </a>
  );
}

function FooterLink({ 
  href, 
  children, 
  external = false 
}: { 
  href: string; 
  children: React.ReactNode; 
  external?: boolean;
}) {
  const Component = external ? 'a' : Link;
  const props = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  
  return (
    <li>
      <Component
        href={href}
        {...props}
        className="text-slate-400 hover:text-surgical-500 text-sm transition-colors"
      >
        {children}
      </Component>
    </li>
  );
}
