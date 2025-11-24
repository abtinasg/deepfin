'use client';

import { useState } from 'react';
import { StockHeader } from '@/components/stock/stock-header';
import { TabNavigation } from '@/components/stock/tab-navigation';
import { OverviewTab } from '@/components/stock/overview-tab';
import { StockQuote, StockMetrics, StockTab } from '@/types/stock';

interface StockPageClientProps {
  ticker: string;
  initialQuote?: StockQuote;
  initialMetrics?: StockMetrics;
}

export function StockPageClient({
  ticker,
  initialQuote,
  initialMetrics,
}: StockPageClientProps) {
  const [activeTab, setActiveTab] = useState<StockTab>('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      <StockHeader ticker={ticker} initialData={initialQuote} />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'overview' && (
        <OverviewTab ticker={ticker} metrics={initialMetrics} />
      )}
      {activeTab === 'fra' && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl border p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">FRA Analysis</h2>
            <p className="text-gray-600">
              Fundamental Risk Analysis coming soon...
            </p>
          </div>
        </div>
      )}
      {activeTab === 'sentiment' && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl border p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Market Sentiment</h2>
            <p className="text-gray-600">
              Sentiment analysis coming soon...
            </p>
          </div>
        </div>
      )}
      {activeTab === 'news' && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl border p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Latest News</h2>
            <p className="text-gray-600">News feed coming soon...</p>
          </div>
        </div>
      )}
      {activeTab === 'learn' && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl border p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Learn About {ticker}</h2>
            <p className="text-gray-600">
              Educational content coming soon...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
