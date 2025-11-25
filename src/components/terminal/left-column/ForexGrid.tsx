'use client';

import { TerminalModule } from '../TerminalModule';
import { useYahooRealtime } from '@/hooks/use-yahoo-realtime';
import { TrendingUp, TrendingDown } from 'lucide-react';

const FOREX_PAIRS = [
  { symbol: 'EURUSD=X', name: 'EUR/USD', flag: '🇪🇺' },
  { symbol: 'GBPUSD=X', name: 'GBP/USD', flag: '🇬🇧' },
  { symbol: 'USDJPY=X', name: 'USD/JPY', flag: '🇯🇵' },
  { symbol: 'DX-Y.NYB', name: 'Dollar Index', flag: '💵' },
];

/**
 * ForexGrid - Display major currency pairs
 */
export function ForexGrid() {
  const { data: quotes, isLoading } = useYahooRealtime(
    FOREX_PAIRS.map((f) => f.symbol),
    15000 // Update every 15 seconds
  );

  return (
    <TerminalModule
      title="Forex"
      subtitle="Major Pairs"
      height="180px"
      isLive={!isLoading}
    >
      <div className="space-y-2">
        {FOREX_PAIRS.map((pair) => {
          const quote = quotes?.find((q) => q.symbol === pair.symbol);
          const isPositive = (quote?.changePercent || 0) >= 0;
          const changeClass = isPositive ? 'text-emerald-400' : 'text-rose-400';

          return (
            <div
              key={pair.symbol}
              className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] hover:border-white/[0.08] transition cursor-pointer group"
            >
              {/* Flag */}
              <div className="text-lg flex-shrink-0">{pair.flag}</div>

              {/* Pair name */}
              <div className="flex-1 min-w-0">
                <div className="text-terminal-xs font-mono font-medium text-slate-300">
                  {pair.name}
                </div>
              </div>

              {/* Price & Change */}
              {quote ? (
                <>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <div className="text-terminal-sm font-mono font-semibold text-white">
                      {quote.regularMarketPrice?.toFixed(4)}
                    </div>
                    <div className={`text-terminal-xs font-mono font-medium ${changeClass}`}>
                      {isPositive ? '+' : ''}
                      {quote.changePercent?.toFixed(2)}%
                    </div>
                  </div>

                  {/* Trend indicator */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-rose-400" />
                    )}
                  </div>
                </>
              ) : (
                <div className="text-terminal-xs text-slate-600 flex-shrink-0">
                  {isLoading ? 'Loading...' : 'N/A'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </TerminalModule>
  );
}
