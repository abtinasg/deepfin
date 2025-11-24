'use client';

import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MarketMover } from '@/types/market';

interface MarketMoversTableProps {
  gainers: MarketMover[];
  losers: MarketMover[];
  active: MarketMover[];
  onStockClick?: (stock: MarketMover) => void;
}

type TabType = 'gainers' | 'losers' | 'active';

export const MarketMoversTable = memo(function MarketMoversTable({ gainers, losers, active, onStockClick }: MarketMoversTableProps) {
  const [activeTab, setActiveTab] = useState<TabType>('gainers');

  const currentStocks = activeTab === 'gainers' ? gainers : activeTab === 'losers' ? losers : active;

  return (
    <div className="
      rounded-3xl
      border border-white/10
      bg-white/5
      p-6
      text-white
      shadow-[0_20px_60px_rgba(2,6,23,0.5)]
    ">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-200 flex items-center gap-2">
          📈 Market Movers
        </h3>
        <div className="flex gap-2 rounded-2xl border border-white/10 p-1">
          {(['gainers', 'losers', 'active'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-2xl px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] transition-all ${
                activeTab === tab
                  ? 'bg-white/20 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <AnimatePresence mode="wait">
          {currentStocks.map((stock, index) => {
            const isPositive = stock.change >= 0;
            
            return (
              <motion.div
                key={`${activeTab}-${stock.ticker}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="
                  flex items-center justify-between
                  rounded-2xl
                  border border-white/5
                  bg-white/5
                  p-3
                  text-white
                  transition
                  hover:border-white/20
                  cursor-pointer
                "
                onClick={() => onStockClick?.(stock)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg">
                    {stock.icon || '📊'}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{stock.ticker}</div>
                    <div className="text-sm text-slate-300">{stock.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">
                    ${stock.price.toFixed(2)}
                  </div>
                  <div className={`text-sm font-semibold ${
                    isPositive ? 'text-emerald-300' : 'text-rose-300'
                  }`}>
                    {isPositive ? '▲' : '▼'} {Math.abs(stock.changePercent).toFixed(1)}%
                  </div>
                  {stock.volume && (
                    <div className="text-xs text-slate-400">
                      Vol: {(stock.volume / 1000000).toFixed(1)}M
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
});
