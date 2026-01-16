'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { 
  Shield, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  Wallet,
  ArrowRight,
  Gift,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface EligibleToken {
  originalMint: string;
  originalName: string;
  originalSymbol: string;
  safeForkMint: string;
  safeForkSymbol: string;
  balanceHeld: number;
  allocation: number;
  status: 'PENDING' | 'VERIFIED' | 'CLAIMED';
}

// Mock data for demonstration
const mockEligibleTokens: EligibleToken[] = [
  {
    originalMint: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
    originalName: 'SHIBA MOON',
    originalSymbol: 'SHIBMOON',
    safeForkMint: 'SAFE_SHIB_MINT',
    safeForkSymbol: 'SAFE_SHIB',
    balanceHeld: 1500000,
    allocation: 15000,
    status: 'VERIFIED',
  },
  {
    originalMint: '8HGiDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW3xa',
    originalName: 'TRUMP COIN',
    originalSymbol: 'TRUMP',
    safeForkMint: 'SAFE_TRUMP_MINT',
    safeForkSymbol: 'SAFE_TRUMP',
    balanceHeld: 500000,
    allocation: 5000,
    status: 'CLAIMED',
  },
];

export default function MigratePage() {
  const { connected, publicKey } = useWallet();
  const [isChecking, setIsChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [eligibleTokens, setEligibleTokens] = useState<EligibleToken[]>([]);

  const handleCheckEligibility = async () => {
    setIsChecking(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setEligibleTokens(mockEligibleTokens);
    setHasChecked(true);
    setIsChecking(false);
  };

  const handleClaim = async (token: EligibleToken) => {
    // Simulate claim transaction
    console.log('Claiming', token.safeForkSymbol);
  };

  return (
    <main className="min-h-screen bg-slate-950">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-surgical-500/30 bg-surgical-500/10 mb-6">
              <Shield className="w-4 h-4 text-surgical-500" />
              <span className="text-surgical-500 font-mono text-sm">VICTIM RELIEF PROGRAM</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Migration <span className="text-surgical-500">Hub</span>
            </h1>
            
            <p className="text-slate-400 max-w-2xl mx-auto">
              Got rugged? Connect your wallet to check if you&apos;re eligible for victim relief tokens. 
              Claude scans your transaction history and allocates safe fork tokens based on your losses.
            </p>
          </motion.div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="surgical-card p-8 mb-8"
          >
            {!connected ? (
              // Not Connected State
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surgical-500/10 border border-surgical-500/30 flex items-center justify-center">
                  <Wallet className="w-10 h-10 text-surgical-500" />
                </div>
                
                <h2 className="font-display text-2xl font-bold mb-4">
                  Connect Your Wallet
                </h2>
                
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  Connect your Solana wallet to check if you held any rugged tokens that have safe forks available.
                </p>
                
                <WalletMultiButton />
              </div>
            ) : !hasChecked ? (
              // Connected but not checked
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surgical-500/10 border border-surgical-500/30 flex items-center justify-center">
                  <Search className="w-10 h-10 text-surgical-500" />
                </div>
                
                <h2 className="font-display text-2xl font-bold mb-2">
                  Wallet Connected
                </h2>
                
                <p className="text-slate-500 font-mono text-sm mb-6">
                  {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}
                </p>
                
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  Ready to scan your wallet for rugged tokens. This will check your transaction history against our database of known rugs.
                </p>
                
                <button
                  onClick={handleCheckEligibility}
                  disabled={isChecking}
                  className="btn-surgical"
                >
                  {isChecking ? (
                    <>
                      <span className="spinner mr-2" />
                      Scanning Wallet...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 inline mr-2" />
                      Check Eligibility
                    </>
                  )}
                </button>
              </div>
            ) : (
              // Results
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-bold">
                    Your Eligible Claims
                  </h2>
                  <span className="px-3 py-1 bg-surgical-500/10 border border-surgical-500/30 rounded-full text-surgical-500 font-mono text-sm">
                    {eligibleTokens.filter(t => t.status !== 'CLAIMED').length} Available
                  </span>
                </div>

                {eligibleTokens.length > 0 ? (
                  <div className="space-y-4">
                    {eligibleTokens.map((token) => (
                      <ClaimCard 
                        key={token.originalMint} 
                        token={token} 
                        onClaim={handleClaim}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-vital-green mx-auto mb-4" />
                    <p className="text-slate-400">
                      No rugged tokens found in your wallet. You&apos;re in the clear!
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <StepCard
              number={1}
              title="Connect"
              description="Link your Solana wallet to begin the verification process"
              icon={<Wallet className="w-6 h-6" />}
            />
            <StepCard
              number={2}
              title="Verify"
              description="Claude scans your history for rugged token holdings"
              icon={<Search className="w-6 h-6" />}
            />
            <StepCard
              number={3}
              title="Claim"
              description="Receive your allocation of safe fork tokens"
              icon={<Gift className="w-6 h-6" />}
            />
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <h3 className="font-display text-xl font-bold mb-6 text-center">
              Frequently Asked Questions
            </h3>
            
            <div className="space-y-4">
              <FAQItem
                question="How is my allocation calculated?"
                answer="Your allocation is based on the amount of rugged tokens you held at the time of the rug pull. We use on-chain data to verify your holdings and apply a fair distribution formula."
              />
              <FAQItem
                question="Is there a fee to claim?"
                answer="You only pay the minimal Solana transaction fee (typically less than $0.01). There are no additional fees from Claude Forkoor."
              />
              <FAQItem
                question="How long do I have to claim?"
                answer="Relief pools remain open for 30 days after the safe fork is deployed. After that, unclaimed tokens are redistributed to the treasury."
              />
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

function ClaimCard({ 
  token, 
  onClaim 
}: { 
  token: EligibleToken; 
  onClaim: (token: EligibleToken) => void;
}) {
  const isClaimed = token.status === 'CLAIMED';
  
  return (
    <div className={`p-4 rounded-xl border ${
      isClaimed 
        ? 'border-slate-700 bg-slate-900/30 opacity-60' 
        : 'border-surgical-500/30 bg-surgical-500/5'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Token Info */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-display font-bold text-white">
                {token.originalName}
              </span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span className="font-display font-bold text-surgical-500">
                ${token.safeForkSymbol}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-500">
                Held: {token.balanceHeld.toLocaleString()} ${token.originalSymbol}
              </span>
              <span className="text-slate-600">→</span>
              <span className="text-surgical-500 font-mono">
                +{token.allocation.toLocaleString()} ${token.safeForkSymbol}
              </span>
            </div>
          </div>
        </div>

        {/* Claim Button / Status */}
        <div className="flex items-center gap-3">
          {isClaimed ? (
            <span className="flex items-center gap-2 px-4 py-2 bg-vital-green/10 border border-vital-green/30 rounded-lg text-vital-green font-mono text-sm">
              <CheckCircle className="w-4 h-4" />
              Claimed
            </span>
          ) : (
            <button
              onClick={() => onClaim(token)}
              className="flex items-center gap-2 px-4 py-2 bg-surgical-500 hover:bg-surgical-600 text-slate-950 rounded-lg font-display font-bold text-sm transition-colors"
            >
              <Gift className="w-4 h-4" />
              Claim
            </button>
          )}
          
          <a
            href={`https://solscan.io/token/${token.safeForkMint}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-500 hover:text-surgical-500 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
  icon,
}: {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/30">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-surgical-500/10 border border-surgical-500/30 flex items-center justify-center text-surgical-500">
          {icon}
        </div>
        <span className="text-xs font-mono text-slate-600">Step {number}</span>
      </div>
      <h4 className="font-display font-bold text-white mb-1">{title}</h4>
      <p className="text-slate-500 text-sm">{description}</p>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-900/50 transition-colors"
      >
        <span className="font-display font-bold text-white">{question}</span>
        <span className={`text-surgical-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ↓
        </span>
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          <p className="text-slate-400 text-sm">{answer}</p>
        </div>
      )}
    </div>
  );
}
