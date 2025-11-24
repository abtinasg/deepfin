'use client';

import { KeyMetrics } from './key-metrics';
import { StockChart } from './stock-chart';
import { AIQuickTake } from './ai-quick-take';
import { RecentNews } from './recent-news';
import { StockMetrics } from '@/types/stock';

interface OverviewTabProps {
  ticker: string;
  metrics?: StockMetrics;
}

export function OverviewTab({ ticker, metrics }: OverviewTabProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Key Metrics */}
        <div className="lg:col-span-1">
          <KeyMetrics ticker={ticker} metrics={metrics} />
        </div>

        {/* Right: Chart */}
        <div className="lg:col-span-2">
          <StockChart ticker={ticker} />
        </div>
      </div>

      {/* AI Quick Take */}
      <div className="mt-8">
        <AIQuickTake ticker={ticker} />
      </div>

      {/* Recent News */}
      <div className="mt-8">
        <RecentNews ticker={ticker} />
      </div>
    </div>
  );
}
