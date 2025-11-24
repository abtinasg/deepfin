'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { IndexCard } from '@/components/markets/index-card';
import { GlobalMarketCard } from '@/components/markets/global-market-card';
import { SectorHeatmap } from '@/components/markets/sector-heatmap';
import { CompactHeatmap } from '@/components/markets/compact-heatmap';
import { MarketMoversTable } from '@/components/markets/market-movers-table';
import { AiMarketSummary } from '@/components/markets/ai-market-summary';
import { FuturesCard } from '@/components/markets/futures-card';
import { EconomicCalendar } from '@/components/markets/economic-calendar';
import { MarketsService } from '@/lib/markets-service';
import {
  MarketIndex,
  GlobalMarket,
  Sector,
  MarketMover,
  FutureAsset,
  EconomicEvent,
  MarketSummary
} from '@/types/market';

export default function MarketsClient() {
  const { user } = useUser();
  const [usIndices, setUsIndices] = useState<MarketIndex[]>([]);
  const [globalMarkets, setGlobalMarkets] = useState<GlobalMarket[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [gainers, setGainers] = useState<MarketMover[]>([]);
  const [losers, setLosers] = useState<MarketMover[]>([]);
  const [active, setActive] = useState<MarketMover[]>([]);
  const [futures, setFutures] = useState<FutureAsset[]>([]);
  const [economicEvents, setEconomicEvents] = useState<EconomicEvent[]>([]);
  const [marketSummary, setMarketSummary] = useState<MarketSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const firstName = user?.firstName || 'there';

  const fetchAllData = async () => {
    try {
      // Use API routes instead of direct service calls to avoid CORS
      const [
        indicesRes,
        gainersRes,
        losersRes,
        activeRes
      ] = await Promise.all([
        fetch('/api/markets/indices'),
        fetch('/api/markets/movers?type=gainers'),
        fetch('/api/markets/movers?type=losers'),
        fetch('/api/markets/movers?type=active')
      ]);

      const [indicesData, gainersData, losersData, activeData] = await Promise.all([
        indicesRes.json(),
        gainersRes.json(),
        losersRes.json(),
        activeRes.json()
      ]);

      setUsIndices(indicesData.indices || []);
      setGainers(gainersData.movers || []);
      setLosers(losersData.movers || []);
      setActive(activeData.movers || []);

      // For now, use service methods that don't call Yahoo from client
      // These will be replaced with API routes later
      const [
        globalData,
        sectorsData,
        futuresData,
        eventsData,
        summaryData
      ] = await Promise.all([
        MarketsService.getGlobalMarkets(),
        MarketsService.getSectors(),
        MarketsService.getFutures(),
        MarketsService.getEconomicEvents(),
        MarketsService.getMarketSummary()
      ]);

      setGlobalMarkets(globalData);
      setSectors(sectorsData);
      setFutures(futuresData);
      setEconomicEvents(eventsData);
      setMarketSummary(summaryData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching market data:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    // Subscribe to real-time updates
    const unsubscribe = MarketsService.subscribeToUpdates(() => {
      fetchAllData();
    });

    return unsubscribe;
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const avgChangePercent = useMemo(() => {
    if (!usIndices.length) return 0;
    return usIndices.reduce((sum, idx) => sum + idx.changePercent, 0) / usIndices.length;
  }, [usIndices]);

  const getMarketStatus = () => {
    if (!usIndices.length) return 'Tracking latest movements across the globe.';
    if (avgChangePercent > 0.5) return 'Broad strength across major indices today.';
    if (avgChangePercent < -0.5) return 'Risk-off tone with indices under pressure.';
    return 'Mixed tape—stay nimble and watch key levels.';
  };

  const leadingSector = useMemo(() => {
    if (!sectors.length) return null;
    return sectors.reduce((best, sector) => (sector.changePercent > best.changePercent ? sector : best));
  }, [sectors]);

  const topGainer = gainers.length ? gainers[0] : null;
  const mostActive = active.length ? active[0] : null;

  type HeroStat = {
    label: string;
    value: string;
    detail?: string;
    accent?: string;
  };

  const heroStats: HeroStat[] = [];

  if (usIndices.length) {
    heroStats.push({
      label: 'Avg Index Move',
      value: `${avgChangePercent > 0 ? '+' : ''}${avgChangePercent.toFixed(2)}%`,
      detail: getMarketStatus(),
      accent: avgChangePercent >= 0 ? 'text-emerald-300' : 'text-rose-300'
    });
  }

  if (topGainer) {
    heroStats.push({
      label: 'Top Gainer',
      value: `${topGainer.ticker} · ${topGainer.changePercent.toFixed(1)}%`,
      detail: topGainer.name,
      accent: 'text-emerald-300'
    });
  }

  if (leadingSector) {
    heroStats.push({
      label: 'Leading Sector',
      value: `${leadingSector.name}`,
      detail: `${leadingSector.changePercent.toFixed(1)}% intraday`,
      accent: 'text-indigo-200'
    });
  }

  if (mostActive) {
    heroStats.push({
      label: 'Most Active',
      value: mostActive.ticker,
      detail: `${mostActive.volume ? `${(mostActive.volume / 1_000_000).toFixed(1)}M vol · ` : ''}${mostActive.changePercent.toFixed(1)}%`,
      accent: 'text-sky-200'
    });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617]">
        <div className="text-center text-slate-300">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-indigo-500/60 border-t-transparent"></div>
          <p>Calibrating market sensors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#020617] text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -left-[10%] top-0 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[100px]" />
        <div className="absolute right-0 top-[20%] h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 space-y-6 pb-10">
        {/* Header Section */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {getGreeting()}, {firstName}
            </h1>
            <p className="mt-2 text-slate-400 max-w-2xl">
              {getMarketStatus()}
            </p>
          </div>
          
          <div className="flex gap-3">
            {heroStats.map((stat) => (
              <div key={stat.label} className="hidden lg:block rounded-xl border border-white/5 bg-white/5 px-4 py-2 backdrop-blur-sm">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">{stat.label}</div>
                <div className={`text-sm font-semibold ${stat.accent}`}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* US Indices */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                  US Markets
                </h2>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                  LIVE
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {usIndices.map((index, i) => (
                  <motion.div
                    key={index.symbol}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                  >
                    <IndexCard
                      index={index}
                      onClick={() => console.log('Index clicked:', index.symbol)}
                    />
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Sector Heatmap - Live Data */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500"></span>
                  Sector Performance
                </h2>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                  LIVE
                </span>
              </div>
              <CompactHeatmap />
            </section>

            {/* Futures & Economic Calendar */}
            <div className="grid gap-6 md:grid-cols-2">
              <FuturesCard
                futures={futures}
                onAssetClick={(asset) => console.log('Asset clicked:', asset.symbol)}
              />
              <EconomicCalendar
                events={economicEvents}
                onEventClick={(event) => console.log('Event clicked:', event.event)}
              />
            </div>

          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* AI Summary */}
            {marketSummary && (
              <AiMarketSummary
                summary={marketSummary}
                onAskAI={() => console.log('Ask AI clicked')}
                className="border-indigo-500/20 bg-gradient-to-b from-indigo-500/10 to-transparent"
              />
            )}

            {/* Market Movers */}
            <MarketMoversTable
              gainers={gainers}
              losers={losers}
              active={active}
              onStockClick={(stock) => console.log('Stock clicked:', stock.ticker)}
            />

            {/* Global Markets Compact */}
            <div className="rounded-2xl border border-white/10 bg-[#0B1121] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-white">Global Markets</h3>
                <span className="text-xs text-slate-500">24h Change</span>
              </div>
              <div className="space-y-3">
                {globalMarkets.slice(0, 5).map((market) => (
                  <div key={market.symbol} className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{market.flag}</span>
                      <div>
                        <div className="text-sm font-medium text-slate-200 group-hover:text-white">{market.name}</div>
                        <div className="text-xs text-slate-500">{market.symbol}</div>
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${market.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {market.change >= 0 ? '+' : ''}{market.changePercent.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
