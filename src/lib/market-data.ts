import { getCachedData } from './redis';

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: string;
}

export interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
}

// Fetch quote for a symbol
export async function getQuote(symbol: string): Promise<Quote> {
  const cacheKey = `quote:${symbol.toUpperCase()}`;

  return getCachedData(
    cacheKey,
    async () => {
      // In production, integrate with Alpha Vantage, Finnhub, or Polygon
      // For now, return mock data
      return {
        symbol: symbol.toUpperCase(),
        price: Math.random() * 500 + 50,
        change: Math.random() * 10 - 5,
        changePercent: Math.random() * 5 - 2.5,
        volume: Math.floor(Math.random() * 100000000),
        high: Math.random() * 500 + 55,
        low: Math.random() * 500 + 45,
        open: Math.random() * 500 + 50,
        previousClose: Math.random() * 500 + 50,
        timestamp: new Date().toISOString(),
      };
    },
    60
  );
}

// Fetch multiple quotes
export async function getQuotes(symbols: string[]): Promise<Quote[]> {
  return Promise.all(symbols.map(getQuote));
}

// Fetch market indices
export async function getMarketIndices(): Promise<MarketIndex[]> {
  const cacheKey = 'market:indices';

  return getCachedData(
    cacheKey,
    async () => {
      // In production, fetch from market data API
      return [
        { name: 'S&P 500', symbol: 'SPX', value: 4567.89, change: 56.12, changePercent: 1.23 },
        { name: 'NASDAQ', symbol: 'NDX', value: 14234.56, change: 126.45, changePercent: 0.89 },
        { name: 'DOW', symbol: 'DJI', value: 35678.9, change: -160.23, changePercent: -0.45 },
        { name: 'VIX', symbol: 'VIX', value: 18.45, change: 0.43, changePercent: 2.34 },
      ];
    },
    30
  );
}

// Search for stocks
export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  if (!query || query.length < 1) {
    return [];
  }

  // In production, integrate with a search API
  const mockStocks: StockSearchResult[] = [
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'Common Stock' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Common Stock' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Common Stock' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'Common Stock' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'Common Stock' },
    { symbol: 'META', name: 'Meta Platforms Inc.', type: 'Common Stock' },
    { symbol: 'TSLA', name: 'Tesla Inc.', type: 'Common Stock' },
  ];

  return mockStocks
    .filter(
      stock =>
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 10);
}

// Fetch historical data
export async function getHistoricalData(
  symbol: string,
  interval: '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y' = '1M'
) {
  const cacheKey = `historical:${symbol}:${interval}`;

  return getCachedData(
    cacheKey,
    async () => {
      // Generate mock historical data
      const points =
        interval === '1D'
          ? 78
          : interval === '1W'
            ? 5
            : interval === '1M'
              ? 22
              : interval === '3M'
                ? 66
                : interval === '1Y'
                  ? 252
                  : 1260;
      const basePrice = Math.random() * 200 + 100;

      return Array.from({ length: points }, (_, i) => ({
        time: new Date(Date.now() - (points - i) * 86400000).toISOString().split('T')[0],
        open: basePrice + Math.random() * 10 - 5,
        high: basePrice + Math.random() * 15,
        low: basePrice - Math.random() * 10,
        close: basePrice + Math.random() * 10 - 5,
        volume: Math.floor(Math.random() * 100000000),
      }));
    },
    300
  );
}
