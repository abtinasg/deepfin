'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface SectorData {
  sector: string;
  avgChange: number;
  totalMarketCap: number;
  stockCount: number;
}

export function CompactHeatmap() {
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/markets/heatmap');
        const result = await response.json();
        
        // Aggregate by sector
        const sectorMap = new Map<string, { total: number; count: number; marketCap: number }>();
        
        result.data.forEach((item: any) => {
          const existing = sectorMap.get(item.sector) || { total: 0, count: 0, marketCap: 0 };
          sectorMap.set(item.sector, {
            total: existing.total + item.changePercent,
            count: existing.count + 1,
            marketCap: existing.marketCap + item.marketCap
          });
        });
        
        const sectorData: SectorData[] = Array.from(sectorMap.entries()).map(([sector, data]) => ({
          sector,
          avgChange: data.total / data.count,
          totalMarketCap: data.marketCap,
          stockCount: data.count
        }));
        
        // Sort by market cap (largest first)
        sectorData.sort((a, b) => b.totalMarketCap - a.totalMarketCap);
        
        setSectors(sectorData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching heatmap data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getColor = (change: number) => {
    if (change > 0) {
      const intensity = Math.min(Math.abs(change) / 2, 1);
      return {
        bg: `rgba(16, 185, 129, ${0.1 + intensity * 0.2})`,
        border: `rgba(16, 185, 129, ${0.2 + intensity * 0.3})`,
        text: 'text-emerald-300'
      };
    } else {
      const intensity = Math.min(Math.abs(change) / 2, 1);
      return {
        bg: `rgba(244, 63, 94, ${0.1 + intensity * 0.2})`,
        border: `rgba(244, 63, 94, ${0.2 + intensity * 0.3})`,
        text: 'text-rose-300'
      };
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/5 bg-[#0B1121] p-5">
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-indigo-500/60 border-t-transparent"></div>
            <p className="text-xs text-slate-400">Loading sectors...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0B1121] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-white">Sector Performance</h3>
        <Link 
          href="/dashboard/markets/heatmap"
          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          View Full →
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {sectors.slice(0, 6).map((sector, index) => {
          const colors = getColor(sector.avgChange);
          
          return (
            <motion.div
              key={sector.sector}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-lg p-3 cursor-pointer transition-all group"
              style={{
                backgroundColor: colors.bg,
                borderColor: colors.border,
                borderWidth: '1px'
              }}
            >
              <div className="text-xs font-medium text-slate-200 group-hover:text-white transition-colors mb-1">
                {sector.sector}
              </div>
              <div className={`text-sm font-bold ${colors.text}`}>
                {sector.avgChange >= 0 ? '+' : ''}{sector.avgChange.toFixed(2)}%
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {sector.stockCount} stocks
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
