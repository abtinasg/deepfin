'use client';

import { useYahooRealtime } from '@/hooks/use-yahoo-realtime';
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * QuickStatsBar - Bloomberg-style stats ticker
 * Compact horizontal bar with key market metrics
 */
export function QuickStatsBar() {
  const { data: quotes } = useYahooRealtime(['^GSPC', '^IXIC', '^VIX'], 15000);

  const spx = quotes?.find(q => q.symbol === '^GSPC');
  const nasdaq = quotes?.find(q => q.symbol === '^IXIC');
  const vix = quotes?.find(q => q.symbol === '^VIX');

  const stats = [
    {
      label: 'S&P 500',
      value: spx?.regularMarketPrice.toFixed(2) || '—',
      change: spx?.regularMarketChangePercent || 0,
      icon: Activity,
    },
    {
      label: 'NASDAQ',
      value: nasdaq?.regularMarketPrice.toFixed(2) || '—',
      change: nasdaq?.regularMarketChangePercent || 0,
      icon: TrendingUp,
    },
    {
      label: 'VIX',
      value: vix?.regularMarketPrice.toFixed(2) || '—',
      change: vix?.regularMarketChangePercent || 0,
      icon: Zap,
    },
  ];

  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#0B1121]/80 backdrop-blur-sm shadow-soft overflow-hidden">
      <div className="flex divide-x divide-white/[0.06]">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;

          return (
            <div
              key={idx}
              className="flex-1 px-terminal-6 py-terminal-4 group cursor-pointer hover:bg-white/[0.03] transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-slate-400 group-hover:text-indigo-400 transition" />
                  <div>
                    <div className="text-terminal-xs text-slate-500 uppercase tracking-wide">
                      {stat.label}
                    </div>
                    <div className="terminal-metric text-white mt-0.5">
                      {stat.value}
                    </div>
                  </div>
                </div>
                <div
                  className={cn(
                    'text-terminal-md font-bold tabular-nums',
                    isPositive ? 'text-emerald-400' : 'text-rose-400'
                  )}
                >
                  {isPositive && '+'}{stat.change.toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
