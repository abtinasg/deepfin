'use client';

import { motion } from 'framer-motion';
import { Sector } from '@/types/market';
import { getSectorIcon } from '@/components/markets/icon-utils';

interface SectorHeatmapProps {
  sectors: Sector[];
  onSectorClick?: (sector: Sector) => void;
}

export function SectorHeatmap({ sectors, onSectorClick }: SectorHeatmapProps) {
  return (
    <div className="
      rounded-2xl
      border border-white/5
      bg-[#0B1121]
      p-5
    ">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {sectors.map((sector, index) => {
          const isPositive = sector.change >= 0;
          const intensity = Math.min(Math.abs(sector.changePercent) / 2, 1);
          const SectorIcon = getSectorIcon(sector.name);
          
          return (
            <motion.div
              key={sector.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative
                overflow-hidden
                rounded-xl
                p-4
                cursor-pointer
                transition-all
                duration-200
                group
              `}
              onClick={() => onSectorClick?.(sector)}
              style={{
                backgroundColor: isPositive 
                  ? `rgba(16, 185, 129, ${0.1 + intensity * 0.2})` 
                  : `rgba(244, 63, 94, ${0.1 + intensity * 0.2})`,
                borderColor: isPositive
                  ? `rgba(16, 185, 129, ${0.2 + intensity * 0.3})`
                  : `rgba(244, 63, 94, ${0.2 + intensity * 0.3})`,
                borderWidth: '1px'
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/10 text-white/80 group-hover:text-white transition-colors">
                  <SectorIcon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className={`text-sm font-bold ${
                  isPositive ? 'text-emerald-300' : 'text-rose-300'
                }`}>
                  {isPositive ? '+' : ''}{Math.abs(sector.changePercent).toFixed(1)}%
                </div>
              </div>
              <div className="text-xs font-medium text-slate-200 group-hover:text-white transition-colors">
                {sector.name}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
