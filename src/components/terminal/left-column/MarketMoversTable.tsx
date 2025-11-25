'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TerminalModule } from '../TerminalModule';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface MarketMover {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  type: 'gainer' | 'loser' | 'active';
  icon?: string;
}

type MoverType = 'gainers' | 'losers' | 'active';

const TABS: { id: MoverType; label: string; icon: React.ElementType }[] = [
  { id: 'gainers', label: 'Gainers', icon: TrendingUp },
  { id: 'losers', label: 'Losers', icon: TrendingDown },
  { id: 'active', label: 'Active', icon: Activity },
];

/**
 * MarketMoversTable - Display top gainers, losers, and most active stocks
 */
export function MarketMoversTable() {
  const [selectedTab, setSelectedTab] = useState<MoverType>('gainers');

  const { data, isLoading } = useQuery<{ movers: MarketMover[] }>({
    queryKey: ['market-movers', selectedTab],
    queryFn: async () => {
      const response = await fetch(`/api/markets/movers?type=${selectedTab}`);
      if (!response.ok) {
        throw new Error('Failed to fetch market movers');
      }
      return response.json();
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000,
  });

  const movers = data?.movers || [];

  return (
    <TerminalModule
      title="Market Movers"
      height="320px"
      isLive={!isLoading}
      actions={
        <div className="flex items-center gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-terminal-xs font-medium transition ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-400 shadow-indigo-glow'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Icon className="h-3 w-3" />
                {tab.label}
              </button>
            );
          })}
        </div>
      }
    >
      <div className="h-full overflow-y-auto terminal-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-terminal-sm text-slate-400">Loading...</div>
          </div>
        ) : movers.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-terminal-base text-slate-400">No data available</div>
              <div className="text-terminal-sm text-slate-600 mt-1">
                Try again in a moment
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {movers.map((mover) => {
              const isPositive = mover.changePercent >= 0;
              const changeClass = isPositive
                ? 'text-emerald-400'
                : 'text-rose-400';

              return (
                <div
                  key={mover.ticker}
                  className="group flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] hover:border-white/[0.08] transition cursor-pointer"
                >
                  {/* Icon */}
                  {mover.icon && (
                    <div className="text-xl flex-shrink-0">{mover.icon}</div>
                  )}

                  {/* Ticker & Name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-terminal-sm font-mono font-semibold text-white">
                        {mover.ticker}
                      </span>
                      <span className="text-terminal-xs text-slate-500 truncate">
                        {mover.name !== mover.ticker ? mover.name : ''}
                      </span>
                    </div>
                    <div className="text-terminal-xs font-mono text-slate-400 mt-0.5">
                      ${mover.price.toFixed(2)}
                    </div>
                  </div>

                  {/* Change */}
                  <div className="flex flex-col items-end flex-shrink-0">
                    <div
                      className={`text-terminal-sm font-mono font-semibold ${changeClass}`}
                    >
                      {isPositive ? '+' : ''}
                      {mover.changePercent.toFixed(2)}%
                    </div>
                    <div
                      className={`text-terminal-xs font-mono ${changeClass} opacity-70`}
                    >
                      {isPositive ? '+' : ''}
                      {mover.change.toFixed(2)}
                    </div>
                  </div>

                  {/* Trend indicator */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
                    {isPositive ? (
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-rose-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </TerminalModule>
  );
}
