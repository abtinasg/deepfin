'use client';

import { motion } from 'framer-motion';
import { Plus, ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useWatchlists } from '@/hooks/use-watchlist';

export function WatchlistWidget() {
  const { data: watchlists, isLoading } = useWatchlists();
  
  // Get the first watchlist or default
  const activeWatchlist = watchlists?.[0];
  const items = activeWatchlist?.items?.slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="h-full rounded-3xl border border-white/10 bg-white/5 p-6 animate-pulse">
        <div className="h-6 w-32 bg-white/10 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-[0_20px_60px_rgba(2,6,23,0.45)]">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-200">
          <TrendingUp className="h-4 w-4 text-indigo-400" />
          Watchlist
        </h3>
        <Link 
          href="/dashboard/watchlist"
          className="text-xs font-medium text-indigo-300 hover:text-indigo-200 transition-colors"
        >
          View All
        </Link>
      </div>

      {items.length > 0 ? (
        <div className="flex-1 space-y-3">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3 transition hover:border-white/20 hover:bg-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-xs font-bold text-indigo-300">
                  {item.ticker.substring(0, 2)}
                </div>
                <div>
                  <div className="font-semibold text-white">{item.ticker}</div>
                  <div className="text-[10px] text-slate-400">Added {new Date(item.addedAt).toLocaleDateString()}</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-slate-400">
            <Plus className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-slate-300">Your watchlist is empty</p>
          <p className="mt-1 text-xs text-slate-500">Start tracking stocks to see them here</p>
          <Link
            href="/dashboard/screener"
            className="mt-4 rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500"
          >
            Find Stocks
          </Link>
        </div>
      )}
    </div>
  );
}
