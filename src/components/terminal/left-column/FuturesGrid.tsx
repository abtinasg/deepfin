'use client';

import { TerminalModule } from '../TerminalModule';
import { useYahooRealtime } from '@/hooks/use-yahoo-realtime';
import { TrendingUp, TrendingDown } from 'lucide-react';

const FUTURES_SYMBOLS = [
  { symbol: 'GC=F', name: 'Gold', icon: '🪙' },
  { symbol: 'CL=F', name: 'Crude Oil', icon: '🛢️' },
  { symbol: 'BTC-USD', name: 'Bitcoin', icon: '₿' },
  { symbol: 'ETH-USD', name: 'Ethereum', icon: '⟠' },
];

/**
 * FuturesGrid - Display futures and commodities prices
 */
export function FuturesGrid() {
  const { data: quotes, isLoading } = useYahooRealtime(
    FUTURES_SYMBOLS.map((f) => f.symbol),
    15000 // Update every 15 seconds
  );

  return (
    <TerminalModule
      title="Futures & Commodities"
      height="240px"
      isLive={!isLoading}
    >
      <div className="grid grid-cols-2 gap-3">
        {FUTURES_SYMBOLS.map((future) => {
          const quote = quotes?.find((q) => q.symbol === future.symbol);
          const isPositive = (quote?.changePercent || 0) >= 0;
          const changeClass = isPositive ? 'text-emerald-400' : 'text-rose-400';

          return (
            <div
              key={future.symbol}
              className="p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] hover:border-white/[0.08] transition cursor-pointer group"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{future.icon}</span>
                  <span className="text-terminal-xs font-medium text-slate-300">
                    {future.name}
                  </span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition">
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-rose-400" />
                  )}
                </div>
              </div>

              {/* Price */}
              {quote ? (
                <>
                  <div className="text-terminal-base font-mono font-semibold text-white mb-1">
                    ${quote.regularMarketPrice?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>

                  {/* Change */}
                  <div className="flex items-center gap-2">
                    <span className={`text-terminal-xs font-mono font-medium ${changeClass}`}>
                      {isPositive ? '+' : ''}
                      {quote.change?.toFixed(2)}
                    </span>
                    <span className={`text-terminal-xs font-mono font-medium ${changeClass}`}>
                      {isPositive ? '+' : ''}
                      {quote.changePercent?.toFixed(2)}%
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-12">
                  <div className="text-terminal-xs text-slate-600">
                    {isLoading ? 'Loading...' : 'N/A'}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </TerminalModule>
  );
}
