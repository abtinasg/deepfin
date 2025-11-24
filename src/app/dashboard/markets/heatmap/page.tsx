'use client';

import { useEffect, useState } from 'react';
import { MarketTreemap, MarketData } from '@/components/markets/market-treemap';

export default function HeatmapPage() {
  const [data, setData] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/markets/heatmap');
        
        if (!response.ok) {
          throw new Error('Failed to fetch heatmap data');
        }
        
        const result = await response.json();
        setData(result.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching heatmap:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeatmapData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchHeatmapData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Market Heatmap</h1>
            <p className="text-slate-400">
              Live sector-based visualization. Size = market cap, color = % change.
            </p>
          </div>
          <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            LIVE DATA
          </span>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-[600px] rounded-3xl border border-white/10 bg-slate-950">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-500/60 border-t-transparent"></div>
            <p className="text-slate-400">Loading market data...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-200">
          <p className="text-sm">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {!isLoading && !error && data.length > 0 && (
        <MarketTreemap data={data} />
      )}
      
      {!isLoading && !error && data.length === 0 && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-yellow-200">
          <p className="text-sm">No data available at the moment.</p>
        </div>
      )}
    </div>
  );
}
