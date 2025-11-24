import { MarketsService } from '@/lib/markets-service';
import { SectorHeatmap } from '@/components/markets/sector-heatmap';

export async function SectorShowcase() {
  const sectors = await MarketsService.getSectors();

  return (
    <section id="sectors" className="py-24 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-[100px]" />
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-[100px]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Market Sectors
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            Real-time performance tracking across all major market sectors.
            Identify trends and opportunities instantly.
          </p>
        </div>
        
        <div className="mx-auto max-w-5xl">
            <SectorHeatmap sectors={sectors} />
        </div>
      </div>
    </section>
  );
}
