// Stock types for Deep Terminal
export interface StockQuote {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  isLive: boolean;
  lastUpdate: number;
}

export interface StockMetrics {
  ticker: string;
  marketCap: number;
  peRatio: number | null;
  eps: number | null;
  dividendYield: number | null;
  week52High: number;
  week52Low: number;
  volume: number;
  avgVolume: number;
  beta: number | null;
  revenue: number | null;
}

export interface StockChartData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface AIQuickTake {
  ticker: string;
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  lastUpdate: number;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: number;
  url: string;
  summary?: string;
  thumbnail?: string;
}

export interface StockDeepDive {
  quote: StockQuote;
  metrics: StockMetrics;
  news: NewsItem[];
}

export type TimeFrame = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';

export type StockTab = 'overview' | 'fra' | 'sentiment' | 'news' | 'learn';
