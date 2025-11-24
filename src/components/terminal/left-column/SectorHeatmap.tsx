'use client';

import { TerminalModule } from '../TerminalModule';
import { useYahooRealtime } from '@/hooks/use-yahoo-realtime';
import { cn } from '@/lib/utils';

const SECTORS = [
  { symbol: 'XLK', name: 'Technology', icon: '💻' },
  { symbol: 'XLF', name: 'Financials', icon: '🏦' },
  { symbol: 'XLE', name: 'Energy', icon: '⚡' },
  { symbol: 'XLV', name: 'Healthcare', icon: '🏥' },
  { symbol: 'XLY', name: 'Consumer Disc.', icon: '🛒' },
  { symbol: 'XLP', name: 'Consumer Staples', icon: '🥫' },
  { symbol: 'XLI', name: 'Industrials', icon: '🏭' },
  { symbol: 'XLB', name: 'Materials', icon: '⚒️' },
  { symbol: 'XLRE', name: 'Real Estate', icon: '🏠' },
  { symbol: 'XLU', name: 'Utilities', icon: '💡' },
  { symbol: 'XLC', name: 'Communication', icon: '📡' },
];

/**
 * SectorHeatmap - Sector Performance via ETFs
 * Compact Bloomberg-style grid showing sector rotation
 */
export function SectorHeatmap() {
  const symbols = SECTORS.map(s => s.symbol);
  const { data: quotes, isLoading } = useYahooRealtime(symbols, 30000);

  // Get color based on change percentage
  const getColor = (change: number) => {
    if (change >= 1.5) return 'bg-emerald-500/30 border-emerald-500/50 text-emerald-300';
    if (change >= 0.5) return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';
    if (change >= 0) return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
    if (change >= -0.5) return 'bg-rose-500/10 border-rose-500/20 text-rose-500';
    if (change >= -1.5) return 'bg-rose-500/20 border-rose-500/30 text-rose-400';
    return 'bg-rose-500/30 border-rose-500/50 text-rose-300';
  };

  return (
    <TerminalModule
      title="Sector Performance"
      subtitle="via ETFs"
      isLive={!isLoading}
      height="auto"
    >
      <div className="grid grid-cols-2 gap-terminal-3">
        {SECTORS.map((sector) => {
          const quote = quotes?.find(q => q.symbol === sector.symbol);
          const changePercent = quote?.regularMarketChangePercent || 0;

          return (
            <div
              key={sector.symbol}
              className={cn(
                'rounded-md border p-terminal-3 transition cursor-pointer group',
                'hover:scale-105',
                isLoading
                  ? 'bg-white/[0.03] border-white/[0.06]'
                  : getColor(changePercent)
              )}
            >
              <div className="flex items-start justify-between gap-1">
                <div className="flex-1 min-w-0">
                  <div className="text-base mb-0.5">{sector.icon}</div>
                  <div className="text-terminal-xs font-medium leading-tight truncate">
                    {sector.name}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {isLoading ? (
                    <div className="h-4 w-10 bg-white/10 animate-pulse rounded" />
                  ) : (
                    <div className="text-terminal-md font-bold tabular-nums">
                      {changePercent >= 0 && '+'}
                      {changePercent.toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </TerminalModule>
  );
}
