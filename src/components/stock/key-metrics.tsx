'use client';

import { StockMetrics } from '@/types/stock';

interface KeyMetricsProps {
  ticker: string;
  metrics?: StockMetrics;
}

export function KeyMetrics({ ticker, metrics }: KeyMetricsProps) {
  if (!metrics) {
    return (
      <div className="bg-white rounded-2xl border p-8">
        <h2 className="text-2xl font-semibold mb-6">Key Metrics</h2>
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-6 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatNumber = (num: number | null, prefix = '', suffix = '') => {
    if (num === null || num === undefined) return 'N/A';
    if (num >= 1e12) return `${prefix}${(num / 1e12).toFixed(2)}T${suffix}`;
    if (num >= 1e9) return `${prefix}${(num / 1e9).toFixed(2)}B${suffix}`;
    if (num >= 1e6) return `${prefix}${(num / 1e6).toFixed(2)}M${suffix}`;
    if (num >= 1e3) return `${prefix}${(num / 1e3).toFixed(2)}K${suffix}`;
    return `${prefix}${num.toFixed(2)}${suffix}`;
  };

  const metricsData = [
    { label: 'Market Cap', value: formatNumber(metrics.marketCap, '$') },
    { label: 'P/E Ratio', value: metrics.peRatio?.toFixed(2) || 'N/A' },
    { label: 'EPS', value: formatNumber(metrics.eps, '$') },
    {
      label: 'Dividend Yield',
      value: metrics.dividendYield
        ? `${(metrics.dividendYield * 100).toFixed(2)}%`
        : 'N/A',
    },
    {
      label: '52W Range',
      value: `$${metrics.week52Low.toFixed(2)} - $${metrics.week52High.toFixed(2)}`,
    },
    { label: 'Volume', value: formatNumber(metrics.volume) },
    {
      label: 'Avg Volume',
      value: formatNumber(metrics.avgVolume),
    },
    { label: 'Beta', value: metrics.beta?.toFixed(2) || 'N/A' },
  ];

  return (
    <div className="bg-white rounded-2xl border p-8">
      <h2 className="text-2xl font-semibold mb-6">Key Metrics</h2>
      <div className="space-y-6">
        {metricsData.map((metric, index) => (
          <div key={index} className="flex justify-between items-baseline">
            <span className="text-sm text-gray-600">{metric.label}</span>
            <span className="text-lg font-semibold font-mono">
              {metric.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
