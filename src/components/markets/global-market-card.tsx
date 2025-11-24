'use client';

import { motion } from 'framer-motion';
import { GlobalMarket } from '@/types/market';

interface GlobalMarketCardProps {
  market: GlobalMarket;
  onClick?: () => void;
}

export function GlobalMarketCard({ market, onClick }: GlobalMarketCardProps) {
  const isPositive = market.change >= 0;

  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="
        min-w-[160px]
        flex-shrink-0
        rounded-2xl
        border border-white/10
        bg-white/5
        px-4
        py-3
        text-white
        shadow-[0_10px_35px_rgba(2,6,23,0.45)]
        transition-all
        duration-200
        hover:border-white/30
        cursor-pointer
      "
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-1">
        {market.flag && <span className="text-sm">{market.flag}</span>}
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-300">{market.name}</div>
      </div>
      <motion.div
        key={market.price}
        initial={{ opacity: 0.4 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-xl font-semibold text-white"
      >
        {market.price.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}
      </motion.div>
      <div className={`text-sm font-semibold ${isPositive ? 'text-emerald-300' : 'text-rose-300'}`}>
        {isPositive ? '▲' : '▼'} {Math.abs(market.changePercent).toFixed(2)}%
      </div>
    </motion.div>
  );
}
