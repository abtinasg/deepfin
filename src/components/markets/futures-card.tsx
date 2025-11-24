'use client';

import { motion } from 'framer-motion';
import { FutureAsset } from '@/types/market';

interface FuturesCardProps {
  futures: FutureAsset[];
  onAssetClick?: (asset: FutureAsset) => void;
}

export function FuturesCard({ futures, onAssetClick }: FuturesCardProps) {
  return (
    <div className="
      rounded-3xl
      border border-white/10
      bg-white/5
      p-6
      text-white
      shadow-[0_20px_60px_rgba(2,6,23,0.45)]
    ">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-200">
        🪙 Futures & Crypto
      </h3>
      
      <div className="space-y-3">
        {futures.map((asset, index) => {
          const isPositive = asset.change >= 0;
          
          return (
            <motion.div
              key={asset.symbol}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="
                flex items-center justify-between
                rounded-2xl
                border border-white/5
                bg-white/5
                p-3
                transition
                hover:border-white/20
                cursor-pointer
              "
              onClick={() => onAssetClick?.(asset)}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{asset.icon}</div>
                <div>
                  <div className="font-semibold text-white">{asset.name}</div>
                  <div className="text-xs text-slate-400">{asset.symbol}</div>
                </div>
              </div>
              <div className="text-right">
                <motion.div
                  key={asset.price}
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="font-bold text-white"
                >
                  ${asset.price.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </motion.div>
                <div className={`text-sm font-semibold ${
                  isPositive ? 'text-emerald-300' : 'text-rose-300'
                }`}>
                  {isPositive ? '▲' : '▼'} {Math.abs(asset.changePercent).toFixed(1)}%
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
