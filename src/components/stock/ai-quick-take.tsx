'use client';

import { useQuery } from '@tanstack/react-query';
import { AIQuickTake as AIQuickTakeType } from '@/types/stock';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface AIQuickTakeProps {
  ticker: string;
}

export function AIQuickTake({ ticker }: AIQuickTakeProps) {
  const { data: aiData, isLoading } = useQuery<AIQuickTakeType>({
    queryKey: ['aiQuickTake', ticker],
    queryFn: () =>
      fetch(`/api/stock/${ticker}/ai-quick-take`).then((r) => r.json()),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-blue-200 rounded w-1/3" />
          <div className="h-4 bg-blue-200 rounded w-full" />
          <div className="h-4 bg-blue-200 rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (!aiData) return null;

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'bearish':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return '📈';
      case 'bearish':
        return '📉';
      default:
        return '➡️';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-8"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-blue-600 rounded-xl">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-semibold">AI Quick Take</h3>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${getSentimentColor(aiData.sentiment)}`}
            >
              {getSentimentEmoji(aiData.sentiment)} {aiData.sentiment.toUpperCase()}
            </span>
          </div>
          <p className="text-gray-700 text-lg leading-relaxed">
            {aiData.summary}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-6 border-t border-blue-200">
        <div className="text-sm text-gray-600">
          Confidence: {aiData.confidence}%
        </div>
        <Link
          href={`/stock/${ticker}?tab=fra`}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          Deep Dive into FRA
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
