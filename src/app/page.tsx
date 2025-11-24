import { Navbar } from '@/components/landing/navbar';
import { Ticker } from '@/components/landing/ticker';
import { Hero } from '@/components/landing/hero';
import { TrustedBy } from '@/components/landing/trusted-by';
import { Workflow } from '@/components/landing/workflow';
import { Features } from '@/components/landing/features';
import { Testimonials } from '@/components/landing/testimonials';
import { CTA } from '@/components/landing/cta';
import { Footer } from '@/components/landing/footer';
import { ChartShowcase } from '@/components/landing/chart-showcase';
import { MultiAIShowcase } from '@/components/landing/multi-ai';
import { SectorShowcase } from '@/components/landing/sector-showcase';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      <Navbar />
      <main className="pt-20 space-y-2">
        <Ticker />
        <Hero />
        <TrustedBy />
        <ChartShowcase />
        <MultiAIShowcase />
        <SectorShowcase />
        <Workflow />
        <Features />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
