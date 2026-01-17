import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { BentoGrid } from '@/components/landing/BentoGrid';
import { StatsSection } from '@/components/landing/StatsSection';
import { RalphLoop } from '@/components/landing/RalphLoop';
import { CTASection } from '@/components/landing/CTASection';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050505] overflow-hidden">
      {/* Ambient glow spheres */}
      <div className="glow-sphere top-[-200px] right-[-200px] animate-glow-pulse" />
      <div className="glow-sphere bottom-[20%] left-[-300px] animate-glow-pulse" style={{ animationDelay: '2s' }} />
      
      <Header />
      <HeroSection />
      <BentoGrid />
      <StatsSection />
      <RalphLoop />
      <CTASection />
      <Footer />
    </main>
  );
}
