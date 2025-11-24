'use client';

import { useQuery } from '@tanstack/react-query';
import { StockQuote } from '@/types/stock';
import { ArrowLeft, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface StockHeaderProps {
  ticker: string;
  initialData?: StockQuote;
}

export function StockHeader({ ticker, initialData }: StockHeaderProps) {
  const router = useRouter();

  const { data: stockData } = useQuery<StockQuote>({
    queryKey: ['stock', ticker],
    queryFn: () => fetch(`/api/stock/${ticker}`).then((r) => r.json()),
    refetchInterval: 5000, // 5 seconds for live updates
    initialData,
  });

  const data = stockData || initialData;
  if (!data) return null;

  const isPositive = data.changePercent >= 0;

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Watchlist ▼
          </Button>
        </div>

        {/* Stock Info */}
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold font-mono tracking-tight">
              {ticker}
            </h1>
            <p className="text-xl text-gray-600">{data.name}</p>
          </div>

          <div className="text-right space-y-1">
            <motion.div
              key={data.price}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              className="text-5xl font-bold font-mono tracking-tight"
            >
              ${data.price.toFixed(2)}
            </motion.div>
            <div
              className={`flex items-center justify-end gap-2 text-xl ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <span>{isPositive ? '▲' : '▼'}</span>
              <span>
                {isPositive ? '+' : ''}
                {data.change.toFixed(2)} ({isPositive ? '+' : ''}
                {data.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Live Indicator */}
        {data.isLive && (
          <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>LIVE</span>
            <span className="text-gray-400">·</span>
            <span>Updates every 5 seconds</span>
          </div>
        )}
      </div>
    </div>
  );
}
