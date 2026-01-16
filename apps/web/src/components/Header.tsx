'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Activity, Shield, Zap, Menu, X } from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-surgical-500/20 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Animated logo */}
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-surgical-500 to-plasma-500 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-6 h-6 text-slate-950"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  {/* Scalpel/Fork hybrid icon */}
                  <path d="M12 2L12 8M12 8L7 13M12 8L17 13" strokeLinecap="round" />
                  <path d="M4 14C4 14 6 16 12 22C18 16 20 14 20 14" strokeLinecap="round" />
                  <circle cx="12" cy="5" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <div className="absolute inset-0 rounded-lg bg-surgical-500/50 blur-lg opacity-0 group-hover:opacity-50 transition-opacity" />
            </motion.div>
            <div className="hidden sm:block">
              <span className="font-display text-xl font-bold tracking-wider text-white">
                CLAUDE <span className="text-surgical-500">FORKOOR</span>
              </span>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest -mt-1">
                Contract Surgeon
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink href="/dashboard" icon={<Activity className="w-4 h-4" />}>
              Dashboard
            </NavLink>
            <NavLink href="/migrate" icon={<Shield className="w-4 h-4" />}>
              Migration Hub
            </NavLink>
            <NavLink href="/forks" icon={<Zap className="w-4 h-4" />}>
              Safe Forks
            </NavLink>
          </nav>

          {/* Wallet Button */}
          <div className="flex items-center gap-4">
            <WalletMultiButton />
            
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-slate-400 hover:text-surgical-500 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden border-t border-surgical-500/20 bg-slate-950/95 backdrop-blur-xl"
        >
          <nav className="flex flex-col p-4 gap-2">
            <MobileNavLink href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Activity className="w-4 h-4" /> Dashboard
            </MobileNavLink>
            <MobileNavLink href="/migrate" onClick={() => setMobileMenuOpen(false)}>
              <Shield className="w-4 h-4" /> Migration Hub
            </MobileNavLink>
            <MobileNavLink href="/forks" onClick={() => setMobileMenuOpen(false)}>
              <Zap className="w-4 h-4" /> Safe Forks
            </MobileNavLink>
          </nav>
        </motion.div>
      )}
    </header>
  );
}

function NavLink({ 
  href, 
  children, 
  icon 
}: { 
  href: string; 
  children: React.ReactNode; 
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-slate-400 hover:text-surgical-500 font-mono text-sm uppercase tracking-wider transition-colors"
    >
      {icon}
      {children}
    </Link>
  );
}

function MobileNavLink({ 
  href, 
  children,
  onClick,
}: { 
  href: string; 
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-surgical-500 hover:bg-surgical-500/10 rounded-lg font-mono text-sm uppercase tracking-wider transition-all"
    >
      {children}
    </Link>
  );
}
