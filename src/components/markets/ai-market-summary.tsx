'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MarketSummary } from '@/types/market';

interface AiMarketSummaryProps {
  summary: MarketSummary;
  onAskAI?: () => void;
  className?: string;
}

export function AiMarketSummary({ summary, onAskAI, className }: AiMarketSummaryProps) {
  const sentimentColors = {
    bullish: 'border-emerald-400/40 shadow-[0_0_40px_rgba(16,185,129,0.18)]',
    bearish: 'border-rose-400/40 shadow-[0_0_40px_rgba(244,63,94,0.18)]',
    neutral: 'border-sky-400/30 shadow-[0_0_40px_rgba(14,165,233,0.18)]'
  };

  const sentimentBadges = {
    bullish: 'bg-emerald-500/15 text-emerald-200 border border-emerald-400/30',
    bearish: 'bg-rose-500/15 text-rose-200 border border-rose-400/30',
    neutral: 'bg-sky-500/15 text-sky-200 border border-sky-400/30'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-3xl border bg-white/5 p-6 text-white backdrop-blur-xl transition-colors',
        sentimentColors[summary.sentiment],
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl">
          🤖
        </div>
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h4 className="text-lg font-semibold text-white">{summary.headline}</h4>
            <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-wide ${sentimentBadges[summary.sentiment]}`}>
              {summary.sentiment}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-slate-200">
            {summary.summary}
          </p>
          <button
            onClick={onAskAI}
            className="
              mt-4
              inline-flex
              items-center
              gap-1.5
              text-sm
              font-semibold
              text-indigo-300
              transition-colors
              hover:text-indigo-200
            "
          >
            Ask AI about this →
          </button>
        </div>
      </div>
    </motion.div>
  );
}
