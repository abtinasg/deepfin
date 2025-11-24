export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
  high?: number;
  low?: number;
  open?: number;
  previousClose?: number;
}

export interface IndexData {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
  timestamp: number;
  isLive: boolean;
  sparklineData?: number[];
}

export interface StockData extends MarketData {
  name: string;
  marketCap?: number;
  avgVolume?: number;
  high52Week?: number;
  low52Week?: number;
}

export interface WebSocketMessage {
  type: 'trade' | 'quote' | 'news' | 'error' | 'ping' | 'pong' | 'subscribe' | 'unsubscribe';
  data?: unknown;
  symbol?: string;
  timestamp?: number;
}

export interface FinnhubTradeMessage {
  type: 'trade';
  data: Array<{
    s: string; // symbol
    p: number; // price
    t: number; // timestamp
    v: number; // volume
    c: string[]; // conditions
  }>;
}

export interface FinnhubQuoteMessage {
  type: 'quote';
  data: {
    s: string; // symbol
    a: number; // ask price
    b: number; // bid price
    t: number; // timestamp
  };
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  triggered: boolean;
  createdAt: number;
}

export interface NewsNotification {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  symbols: string[];
  timestamp: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface ConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  error?: string;
  lastConnected?: number;
  reconnectAttempts: number;
}

export interface MarketDataSubscription {
  symbols: Set<string>;
  callbacks: Map<string, (data: MarketData) => void>;
}

export interface CachedMarketData {
  data: MarketData;
  timestamp: number;
  ttl: number;
}

export interface HistoricalDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketDataError {
  code: string;
  message: string;
  symbol?: string;
  timestamp: number;
  retry?: boolean;
}

export interface QueuedMessage {
  id: string;
  type: string;
  payload: unknown;
  timestamp: number;
  retries: number;
}
