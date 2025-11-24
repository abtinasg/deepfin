'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TickerItem {
  symbol: string;
  price: string;
  change: string;
  isPositive: boolean;
}

const initialItems: TickerItem[] = [
  { symbol: 'BTC', price: '...', change: '...', isPositive: true },
  { symbol: 'ETH', price: '...', change: '...', isPositive: true },
  { symbol: 'SPX', price: '...', change: '...', isPositive: true },
  { symbol: 'NDX', price: '...', change: '...', isPositive: true },
  { symbol: 'VIX', price: '...', change: '...', isPositive: false },
  { symbol: 'AAPL', price: '...', change: '...', isPositive: false },
  { symbol: 'MSFT', price: '...', change: '...', isPositive: true },
  { symbol: 'NVDA', price: '...', change: '...', isPositive: true },
  { symbol: 'TSLA', price: '...', change: '...', isPositive: false },
  { symbol: 'AMD', price: '...', change: '...', isPositive: true },
];

export function Ticker() {
  const [items, setItems] = useState<TickerItem[]>(initialItems);

  useEffect(() => {
    const fetchTickerData = async () => {
      try {
        const response = await fetch('/api/public/ticker');
        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            setItems(data.items);
          }
        }
      } catch (error) {
        console.error('Failed to fetch ticker data', error);
      }
    };

    fetchTickerData();
    // Refresh every 60 seconds
    const interval = setInterval(fetchTickerData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full overflow-hidden border-b border-white/5 bg-slate-950/50 backdrop-blur-sm">
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: '-50%' }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="flex whitespace-nowrap py-2"
      >
        {[...items, ...items].map((item, i) => (
          <div key={i} className="mx-6 flex items-center gap-2 text-xs font-medium">
            <span className="text-white/70">{item.symbol}</span>
            <span className="text-white">{item.price}</span>
            <span className={item.isPositive ? 'text-emerald-400' : 'text-rose-400'}>
              {item.change}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
