'use client';

import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion } from 'framer-motion';

export function Header() {
  const { connected } = useWallet();

  const navLinks = [
    { name: 'Scanner', href: '/dashboard' },
    { name: 'Active Forks', href: '/forks' },
    { name: 'Migration', href: '/migrate' },
    { name: 'Docs', href: '/docs' },
  ];

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-6 py-5">
        <div className="glass-card flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-semibold tracking-tight">
              The <span className="text-orange-500">Forkoor</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href} 
                className="nav-link text-sm font-medium"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Wallet Button */}
          <div className="flex items-center gap-4">
            <WalletMultiButton className="!px-6 !py-2.5 !text-sm" />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
