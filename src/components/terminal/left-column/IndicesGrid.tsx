'use client';

import { TerminalModule, TerminalModuleStat } from '../TerminalModule';
import { useYahooRealtime } from '@/hooks/use-yahoo-realtime';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const INDICES = [
  { symbol: '^GSPC', name: 'S&P 500', icon: '📊' },
  { symbol: '^IXIC', name: 'NASDAQ', icon: '💻' },
  { symbol: '^DJI', name: 'DOW JONES', icon: '🏛️' },
  { symbol: '^RUT', name: 'RUSSELL 2000', icon: '📈' },
  { symbol: '^VIX', name: 'VIX', icon: '📉' },
];

/**
 * IndicesGrid - Major US Market Indices
 * Bloomberg-style compact grid showing real-time index data from Yahoo Finance
 */
export function IndicesGrid() {
  const symbols = INDICES.map(idx => idx.symbol);
  const { data: quotes, isLoading } = useYahooRealtime(symbols, 15000);

  return (
    <TerminalModule
      title="US Markets"
      isLive={!isLoading}
      height="auto"
    >
      <div className="space-y-terminal-2">
        {INDICES.map((index) => {
          const quote = quotes?.find(q => q.symbol === index.symbol);
          const isPositive = (quote?.regularMarketChangePercent || 0) >= 0;

          return (
            <div
              key={index.symbol}
              className="group flex items-center justify-between py-terminal-3 px-terminal-2 rounded-md transition hover:bg-white/[0.03] cursor-pointer"
            >
              {/* Left: Icon + Name */}
              <div className="flex items-center gap-2 flex-1">
                <span className="text-lg">{index.icon}</span>
                <div className="flex-1">
                  <div className="text-terminal-sm font-medium text-white">
                    {index.name}
                  </div>
                  <div className="text-terminal-xs text-slate-500">
                    {index.symbol.replace('^', '')}
                  </div>
                </div>
              </div>

              {/* Right: Price + Change */}
              <div className="flex items-center gap-3">
                {isLoading ? (
                  <div className="h-4 w-16 bg-white/5 animate-pulse rounded" />
                ) : quote ? (
                  <>
                    <div className="text-right">
                      <div className="terminal-metric text-white">
                        {quote.regularMarketPrice.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <div
                        className={cn(
                          'text-terminal-xs font-medium flex items-center justify-end gap-0.5',
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        )}
                      >
                        {isPositive ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {isPositive && '+'}
                        {quote.regularMarketChangePercent.toFixed(2)}%
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-terminal-xs text-slate-500">—</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </TerminalModule>
  );
}
