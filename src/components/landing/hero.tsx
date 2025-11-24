'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const metrics = [
  { label: 'Global Symbols', value: '120K+' },
  { label: 'Latency', value: '< 200ms' },
  { label: 'Avg. Savings', value: '$23,972' },
];

interface HighlightItem {
  label: string;
  value: string;
  color: string;
}

const initialHighlights: HighlightItem[] = [
  { label: 'S&P 500', value: '...', color: 'text-emerald-400' },
  { label: 'NVDA', value: '...', color: 'text-emerald-400' },
  { label: 'WTI Crude', value: '...', color: 'text-rose-400' },
];

export function Hero() {
  const [highlights, setHighlights] = useState<HighlightItem[]>(initialHighlights);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/public/ticker');
        if (response.ok) {
          const data = await response.json();
          if (data.items) {
            const newHighlights = [
              { symbol: 'SPX', label: 'S&P 500' },
              { symbol: 'NVDA', label: 'NVDA' },
              { symbol: 'WTI', label: 'WTI Crude' }
            ].map(target => {
              const item = data.items.find((i: any) => i.symbol === target.symbol);
              if (item) {
                return {
                  label: target.label,
                  value: item.change,
                  color: item.isPositive ? 'text-emerald-400' : 'text-rose-400'
                };
              }
              return null;
            }).filter(Boolean) as HighlightItem[];

            if (newHighlights.length > 0) {
              setHighlights(newHighlights);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch hero data', error);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-32">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/70 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            Live Institutional Feed
          </motion.div>
          
          <h1 className="mt-8 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-7xl">
            Your entire market desk,
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400">
              rebuilt with AI.
            </span>
          </h1>
          
          <p className="mt-6 max-w-xl text-lg text-white/60 leading-relaxed">
            Deep Terminal combines multi-provider market data, AI copilots, and portfolio OS tools into one modern workspace. Cut Bloomberg costs by 92% while shipping research twice as fast.
          </p>
          
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/sign-up"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-blue-500/50 w-full sm:w-auto"
            >
              <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
              Book Live Demo
            </Link>
            <Link
              href="/dashboard"
              className="group inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20 w-full sm:w-auto"
            >
              Explore Product
              <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {metrics.map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm"
              >
                <p className="text-2xl font-bold text-white">{metric.value}</p>
                <p className="text-xs uppercase tracking-[0.25em] text-white/40">{metric.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-blue-500 to-purple-600 opacity-30 blur-2xl" />
          <div className="relative rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="h-3 w-3 rounded-full bg-green-500/20 border border-green-500/50" />
              </div>
              <div className="flex items-center gap-2 text-xs text-white/40">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Connected
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-5">
                <p className="text-sm text-white/60">Total Portfolio Value</p>
                <div className="mt-2 flex flex-wrap items-baseline gap-3">
                  <p className="text-3xl font-bold text-white sm:text-4xl">$812,450.23</p>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                    +2.4%
                  </span>
                </div>
                <div className="mt-4 h-32 w-full overflow-hidden rounded-xl bg-slate-950/50 relative">
                   <svg className="absolute bottom-0 left-0 right-0 h-full w-full" preserveAspectRatio="none">
                     <path d="M0 100 C 100 80, 200 120, 300 60 S 400 40, 500 20 L 500 128 L 0 128 Z" fill="url(#gradient)" opacity="0.2" />
                     <path d="M0 100 C 100 80, 200 120, 300 60 S 400 40, 500 20" stroke="url(#lineGradient)" strokeWidth="2" fill="none" />
                     <defs>
                       <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="#3B82F6" />
                         <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                       </linearGradient>
                       <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                         <stop offset="0%" stopColor="#3B82F6" />
                         <stop offset="100%" stopColor="#8B5CF6" />
                       </linearGradient>
                     </defs>
                   </svg>
                </div>
              </div>

              <div className="grid gap-3">
                {highlights.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 transition-colors hover:bg-white/10">
                    <span className="font-medium text-white/80">{item.label}</span>
                    <span className={`font-mono font-medium ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
