'use client';

import { TerminalModule } from '../TerminalModule';
import { useYahooRealtime } from '@/hooks/use-yahoo-realtime';
import { TrendingUp, TrendingDown } from 'lucide-react';

const TREASURY_BONDS = [
  { symbol: '^IRX', name: '3 Month', maturity: '3M' },
  { symbol: '^FVX', name: '5 Year', maturity: '5Y' },
  { symbol: '^TNX', name: '10 Year', maturity: '10Y' },
  { symbol: '^TYX', name: '30 Year', maturity: '30Y' },
];

/**
 * BondYields - Display US Treasury yields
 */
export function BondYields() {
  const { data: quotes, isLoading } = useYahooRealtime(
    TREASURY_BONDS.map((b) => b.symbol),
    30000 // Update every 30 seconds
  );

  return (
    <TerminalModule
      title="Treasury Yields"
      subtitle="US Bonds"
      height="200px"
      isLive={!isLoading}
    >
      <div className="space-y-2">
        {TREASURY_BONDS.map((bond) => {
          const quote = quotes?.find((q) => q.symbol === bond.symbol);
          const isPositive = (quote?.changePercent || 0) >= 0;
          const changeClass = isPositive ? 'text-emerald-400' : 'text-rose-400';

          return (
            <div
              key={bond.symbol}
              className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] hover:border-white/[0.08] transition cursor-pointer group"
            >
              {/* Maturity badge */}
              <div className="flex-shrink-0 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-terminal-xs font-mono font-medium">
                {bond.maturity}
              </div>

              {/* Bond name */}
              <div className="flex-1 min-w-0">
                <div className="text-terminal-xs font-medium text-slate-300">
                  {bond.name}
                </div>
              </div>

              {/* Yield & Change */}
              {quote ? (
                <>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <div className="text-terminal-sm font-mono font-semibold text-white">
                      {quote.regularMarketPrice?.toFixed(2)}%
                    </div>
                    <div className={`text-terminal-xs font-mono font-medium ${changeClass}`}>
                      {isPositive ? '+' : ''}
                      {quote.change?.toFixed(3)}
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
