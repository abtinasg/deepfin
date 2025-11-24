'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { MarketIndex } from '@/types/market';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { getIndexIcon } from '@/components/markets/icon-utils';

interface IndexCardProps {
  index: MarketIndex;
  onClick?: () => void;
}

export const IndexCard = memo(function IndexCard({ index, onClick }: IndexCardProps) {
  const isPositive = index.change >= 0;
  
  const sparklineData = index.sparklineData?.map((value, i) => ({
    value,
    index: i
  })) || [];
  const IndexIcon = getIndexIcon(index.symbol);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="
        group
        relative
        overflow-hidden
        rounded-xl
        border border-white/5
        bg-[#0B1121]
        p-4
        transition-all
        duration-300
        hover:border-white/10
        hover:shadow-2xl
        hover:shadow-indigo-500/10
        cursor-pointer
      "
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            <IndexIcon className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">{index.name}</div>
            <div className="text-sm font-bold text-white tracking-tight">{index.symbol}</div>
          </div>
        </div>
        {index.isLive && (
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        )}
      </div>
      
      <div className="relative flex items-end justify-between">
        <div>
          <div className="text-xl font-bold text-white tracking-tight">
            {index.price.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-medium mt-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            <span>{isPositive ? '+' : ''}{index.change.toFixed(2)}</span>
            <span className="opacity-60">({isPositive ? '+' : ''}{index.changePercent.toFixed(2)}%)</span>
          </div>
        </div>
        
        {sparklineData.length > 0 && (
          <div className="h-10 w-20 opacity-50 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={isPositive ? '#34d399' : '#fb7185'}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
});
