'use client';

import { useQuery } from '@tanstack/react-query';

export interface YahooQuote {
  symbol: string;
  shortName: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  regularMarketTime: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketOpen: number;
  regularMarketPreviousClose: number;
  marketState: string;
}

/**
 * Fetch real-time quotes for multiple symbols
 * Updates every 15 seconds during market hours
 */
export function useYahooRealtime(symbols: string[], interval = 15000) {
  return useQuery({
    queryKey: ['yahoo-realtime', symbols.join(',')],
    queryFn: async (): Promise<YahooQuote[]> => {
      if (!symbols.length) return [];

      const res = await fetch(`/api/yahoo-proxy/quotes?symbols=${symbols.join(',')}`);
      if (!res.ok) throw new Error('Failed to fetch quotes');
      return res.json();
    },
    refetchInterval: interval,
    staleTime: interval - 1000,
    enabled: symbols.length > 0,
  });
}

/**
 * Fetch quote for a single symbol
 */
export function useYahooQuote(symbol: string, interval = 15000) {
  const { data, ...rest } = useYahooRealtime([symbol], interval);
  return {
    data: data?.[0],
    ...rest,
  };
}
