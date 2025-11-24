'use client';

import { useQuery } from '@tanstack/react-query';

export interface YahooChartData {
  meta: {
    symbol: string;
    currency: string;
    exchangeName: string;
    regularMarketPrice: number;
    regularMarketTime: number;
    previousClose: number;
    dataGranularity: string;
    range: string;
  };
  timestamps: number[];
  quotes: {
    open: number[];
    high: number[];
    low: number[];
    close: number[];
    volume: number[];
  };
}

export type ChartInterval = '1m' | '5m' | '15m' | '1h' | '1d' | '1wk' | '1mo';
export type ChartRange = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '5y' | 'max';

/**
 * Fetch historical chart data from Yahoo Finance
 */
export function useYahooChart(
  symbol: string,
  interval: ChartInterval = '5m',
  range: ChartRange = '5d',
  enabled = true
) {
  return useQuery({
    queryKey: ['yahoo-chart', symbol, interval, range],
    queryFn: async (): Promise<YahooChartData> => {
      const res = await fetch(
        `/api/yahoo-proxy/chart?symbol=${symbol}&interval=${interval}&range=${range}`
      );
      if (!res.ok) throw new Error('Failed to fetch chart data');
      return res.json();
    },
    staleTime: 60000, // 1 minute
    enabled: enabled && !!symbol,
  });
}

/**
 * Fetch chart data for multiple symbols (for normalized comparison)
 */
export function useYahooMultiChart(
  symbols: string[],
  interval: ChartInterval = '1d',
  range: ChartRange = '5d'
) {
  return useQuery({
    queryKey: ['yahoo-multi-chart', symbols.join(','), interval, range],
    queryFn: async () => {
      const promises = symbols.map(async (symbol) => {
        const res = await fetch(
          `/api/yahoo-proxy/chart?symbol=${symbol}&interval=${interval}&range=${range}`
        );
        if (!res.ok) throw new Error(`Failed to fetch chart data for ${symbol}`);
        return res.json() as Promise<YahooChartData>;
      });

      return Promise.all(promises);
    },
    staleTime: 60000,
    enabled: symbols.length > 0,
  });
}

/**
 * Normalize chart data to 100 at start (for performance comparison)
 */
export function normalizeChartData(data: YahooChartData): { timestamps: number[]; values: number[] } {
  const { timestamps, quotes } = data;
  const closes = quotes.close;

  if (!closes.length) {
    return { timestamps: [], values: [] };
  }

  // Find first non-null close price
  const firstPrice = closes.find(price => price !== null && price !== undefined && price > 0);
  if (!firstPrice) {
    return { timestamps: [], values: [] };
  }

  // Normalize to 100
  const values = closes.map(close => {
    if (close === null || close === undefined || close === 0) return null;
    return (close / firstPrice) * 100;
  });

  return { timestamps, values: values as number[] };
}
