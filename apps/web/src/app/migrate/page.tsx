'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCheckEligibility, useClaimTokens, EligibleToken } from '@/hooks/useMigration';
import { 
  Shield, 
  Search, 
  CheckCircle, 
  Wallet,
  ArrowRight,
  Gift,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export default function MigratePage() {
  const { connected, publicKey } = useWallet();
  const { eligibility, checkEligibility, loading: checkingEligibility, error: checkError } = useCheckEligibility();
  const { claim, claiming, error: claimError } = useClaimTokens();
  const [hasChecked, setHasChecked] = useState(false);

  const handleCheckEligibility = async () => {
    if (!publicKey) return;
    
    await checkEligibility(publicKey.toBase58());
    setHasChecked(true);
  };

  const handleClaim = async (token: EligibleToken) => {
    if (!publicKey) return;
    
    // In a real implementation, this would:
    // 1. Build a Solana transaction
    // 2. Request wallet signature
    // 3. Submit the signed transaction
    // 4. Update the claim status
    
    const result = await claim(publicKey.toBase58(), token.safeForkMint);
    
    if (result?.success) {
      // Refresh eligibility data
      await checkEligibility(publicKey.toBase58());
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/10 mb-6">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-accent font-mono text-sm">VICTIM RELIEF PROGRAM</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Migration <span className="text-accent">Hub</span>
            </h1>
            
            <p className="text-text-secondary max-w-2xl mx-auto">
              Got rugged? Connect your wallet to check if you&apos;re eligible for victim relief tokens. 
              Claude scans your transaction history and allocates safe fork tokens based on your losses.
            </p>
          </motion.div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 mb-8"
          >
            {!connected ? (
              // Not Connected State
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center">
                  <Wallet className="w-10 h-10 text-accent" />
                </div>
                
                <h2 className="font-serif text-2xl font-bold mb-4">
                  Connect Your Wallet
                </h2>
                
                <p className="text-text-secondary mb-6 max-w-md mx-auto">
                  Connect your Solana wallet to check if you held any rugged tokens that have safe forks available.
                </p>
                
                <WalletMultiButton />
              </div>
            ) : !hasChecked ? (
              // Connected but not checked
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center">
                  <Search className="w-10 h-10 text-accent" />
                </div>
                
                <h2 className="font-serif text-2xl font-bold mb-2">
                  Wallet Connected
                </h2>
                
                <p className="text-zinc-500 font-mono text-sm mb-6">
                  {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}
                </p>
                
                <p className="text-text-secondary mb-6 max-w-md mx-auto">
                  Ready to scan your wallet for rugged tokens. This will check your transaction history against our database of known rugs.
                </p>
                
                <button
                  onClick={handleCheckEligibility}
                  disabled={checkingEligibility}
                  className="btn-accent"
                >
                  {checkingEligibility ? (
                    <>
                      <RefreshCw className="w-5 h-5 inline mr-2 animate-spin" />
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
                  <h2 className="font-serif text-xl font-bold">
                    Your Eligible Claims
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-accent/10 border border-accent/30 rounded-full text-accent font-mono text-sm">
                      {eligibility?.pendingClaims || 0} Available
                    </span>
                    <button
                      onClick={handleCheckEligibility}
                      disabled={checkingEligibility}
                      className="p-2 text-zinc-500 hover:text-accent transition-colors"
                    >
                      <RefreshCw className={`w-5 h-5 ${checkingEligibility ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Error State */}
                {(checkError || claimError) && (
                  <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <p className="text-red-400">{checkError || claimError}</p>
                  </div>
                )}

                {eligibility && eligibility.eligibleTokens.length > 0 ? (
                  <div className="space-y-4">
                    {eligibility.eligibleTokens.map((token) => (
                      <ClaimCard 
                        key={`${token.originalMint}-${token.safeForkMint}`} 
                        token={token} 
                        onClaim={handleClaim}
                        claiming={claiming}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-text-secondary mb-2">
                      No rugged tokens found in your wallet.
                    </p>
                    <p className="text-zinc-600 text-sm">
                      You&apos;re in the clear! Check back later if you suspect a token you hold has been rugged.
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
            <h3 className="font-serif text-xl font-bold mb-6 text-center">
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
  onClaim,
  claiming,
}: { 
  token: EligibleToken; 
  onClaim: (token: EligibleToken) => void;
  claiming: boolean;
}) {
  const isClaimed = token.status === 'CLAIMED';
  const isExpired = token.status === 'EXPIRED';
  const canClaim = token.status === 'VERIFIED';
  
  return (
    <div className={`p-4 rounded-xl border ${
      isClaimed 
        ? 'border-zinc-700 bg-zinc-900/30 opacity-60' 
        : isExpired
        ? 'border-red-500/30 bg-red-500/5'
        : 'border-accent/30 bg-accent/5'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Token Info */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-serif font-bold text-white">
                {token.originalName}
              </span>
              <ArrowRight className="w-4 h-4 text-zinc-500" />
              <span className="font-serif font-bold text-accent">
                ${token.safeForkSymbol}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-zinc-500">
                Held: {parseInt(token.originalBalance).toLocaleString()} ${token.originalSymbol}
              </span>
              <span className="text-zinc-600">→</span>
              <span className="text-accent font-mono">
                +{parseInt(token.allocation).toLocaleString()} ${token.safeForkSymbol}
              </span>
            </div>
          </div>
        </div>

        {/* Claim Button / Status */}
        <div className="flex items-center gap-3">
          {isClaimed ? (
            <span className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 font-mono text-sm">
              <CheckCircle className="w-4 h-4" />
              Claimed
            </span>
          ) : isExpired ? (
            <span className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 font-mono text-sm">
              Expired
            </span>
          ) : canClaim ? (
            <button
              onClick={() => onClaim(token)}
              disabled={claiming}
              className="btn-accent text-sm"
            >
              {claiming ? (
                <>
                  <RefreshCw className="w-4 h-4 inline mr-2 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4 inline mr-2" />
                  Claim
                </>
              )}
            </button>
          ) : (
            <span className="px-4 py-2 bg-zinc-800 rounded-lg text-zinc-500 text-sm">
              Pending Verification
            </span>
          )}
          
          <a
            href={`https://solscan.io/token/${token.safeForkMint}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-zinc-500 hover:text-accent transition-colors"
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
    <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/30">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
          {icon}
        </div>
        <span className="text-xs font-mono text-zinc-600">Step {number}</span>
      </div>
      <h4 className="font-serif font-bold text-white mb-1">{title}</h4>
      <p className="text-zinc-500 text-sm">{description}</p>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-900/50 transition-colors"
      >
        <span className="font-serif font-bold text-white">{question}</span>
        <span className={`text-accent transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ↓
        </span>
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          <p className="text-text-secondary text-sm">{answer}</p>
        </div>
      )}
    </div>
  );
}
