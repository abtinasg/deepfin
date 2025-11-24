import { MarketIndex, GlobalMarket, Sector, MarketMover, FutureAsset, EconomicEvent, MarketSummary } from '@/types/market';

// Mock data for demonstration - In production, replace with real API calls
// You can use Alpha Vantage, Finnhub, or Yahoo Finance API

export class MarketsService {
  private static CACHE_DURATION = 5000; // 5 seconds
  private static cache: Map<string, { data: any; timestamp: number }> = new Map();

  private static getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T;
    }
    return null;
  }

  private static setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private static async fetchFromYahoo(symbol: string): Promise<any> {
    try {
      // Check if running on client or server
      const isClient = typeof window !== 'undefined';
      
      let response: Response;
      
      if (isClient) {
        // Use proxy on client-side to avoid CORS
        response = await fetch(`/api/yahoo-proxy?symbol=${symbol}`);
      } else {
        // Direct call on server-side
        response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; DeepFin/1.0)',
            },
          }
        );
      }
      
      if (!response.ok) {
        throw new Error(`Yahoo API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.chart?.result?.[0];
    } catch (error) {
      console.error('Yahoo Finance fetch error:', error);
      return null;
    }
  }

  private static async fetchFromFinnhub(endpoint: string): Promise<any> {
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY || process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      return null;
    }

    try {
      const response = await fetch(`https://finnhub.io/api/v1${endpoint}&token=${apiKey}`);
      if (!response.ok) {
        throw new Error(`Finnhub API error: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Finnhub fetch error:', error);
      return null;
    }
  }

  static async getUSIndices(): Promise<MarketIndex[]> {
    const cached = this.getCached<MarketIndex[]>('us-indices');
    if (cached) return cached;

    const data: MarketIndex[] = [];

    // Try Yahoo Finance first (no API key needed!)
    const symbols = [
      { symbol: '^GSPC', name: 'S&P 500', icon: '📊' },
      { symbol: '^IXIC', name: 'NASDAQ', icon: '💻' },
      { symbol: '^DJI', name: 'DOW JONES', icon: '🏛️' },
      { symbol: '^RUT', name: 'RUSSELL 2000', icon: '📈' }
    ];

    for (const idx of symbols) {
      try {
        // Try Yahoo Finance first
        const result = await this.fetchFromYahoo(idx.symbol);
        
        if (result?.meta) {
          const meta = result.meta;
          const currentPrice = meta.regularMarketPrice || meta.previousClose || 0;
          const previousClose = meta.previousClose || meta.chartPreviousClose || 0;
          const change = currentPrice - previousClose;
          const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

          data.push({
            symbol: idx.symbol,
            name: idx.name,
            price: currentPrice,
            change,
            changePercent,
            isLive: true,
            sparklineData: this.generateSparkline(20),
            icon: idx.icon
          });
          continue;
        }

        // Fallback to Finnhub
        const quote = await this.fetchFromFinnhub(`/quote?symbol=${idx.symbol}`);
        
        if (quote && quote.c) {
          data.push({
            symbol: idx.symbol,
            name: idx.name,
            price: quote.c,
            change: quote.d || 0,
            changePercent: quote.dp || 0,
            isLive: true,
            sparklineData: this.generateSparkline(20),
            icon: idx.icon
          });
        }
      } catch (error) {
        console.error(`Error fetching ${idx.symbol}:`, error);
      }
    }

    this.setCache('us-indices', data);
    return data;
  }

  static async getGlobalMarkets(): Promise<GlobalMarket[]> {
    const cached = this.getCached<GlobalMarket[]>('global-markets');
    if (cached) return cached;

    await new Promise(resolve => setTimeout(resolve, 300));

    const data: GlobalMarket[] = [
      {
        symbol: 'FTSE',
        name: 'FTSE 100',
        price: 8246.45,
        change: 32.15,
        changePercent: 0.39,
        country: 'UK',
        flag: '🇬🇧'
      },
      {
        symbol: 'DAX',
        name: 'DAX',
        price: 19456.89,
        change: -45.23,
        changePercent: -0.23,
        country: 'Germany',
        flag: '🇩🇪'
      },
      {
        symbol: 'CAC',
        name: 'CAC 40',
        price: 7342.56,
        change: 18.90,
        changePercent: 0.26,
        country: 'France',
        flag: '🇫🇷'
      },
      {
        symbol: 'NIKKEI',
        name: 'NIKKEI 225',
        price: 38456.78,
        change: 234.56,
        changePercent: 0.61,
        country: 'Japan',
        flag: '🇯🇵'
      },
      {
        symbol: 'HSI',
        name: 'HANG SENG',
        price: 19234.67,
        change: -156.34,
        changePercent: -0.81,
        country: 'Hong Kong',
        flag: '🇭🇰'
      },
      {
        symbol: 'ASX',
        name: 'ASX 200',
        price: 8123.45,
        change: 45.12,
        changePercent: 0.56,
        country: 'Australia',
        flag: '🇦🇺'
      }
    ];

    this.setCache('global-markets', data);
    return data;
  }

  static async getSectors(): Promise<Sector[]> {
    const cached = this.getCached<Sector[]>('sectors');
    if (cached) return cached;

    const sectorETFs = [
      { symbol: 'XLK', name: 'Technology', icon: '💻' },
      { symbol: 'XLV', name: 'Healthcare', icon: '🏥' },
      { symbol: 'XLF', name: 'Financials', icon: '🏦' },
      { symbol: 'XLY', name: 'Consumer Discretionary', icon: '🛒' },
      { symbol: 'XLP', name: 'Consumer Staples', icon: '🥫' },
      { symbol: 'XLE', name: 'Energy', icon: '⚡' },
      { symbol: 'XLI', name: 'Industrials', icon: '🏭' },
      { symbol: 'XLB', name: 'Materials', icon: '⚒️' },
      { symbol: 'XLRE', name: 'Real Estate', icon: '🏠' },
      { symbol: 'XLU', name: 'Utilities', icon: '💡' },
      { symbol: 'XLC', name: 'Communication Services', icon: '📡' }
    ];

    const data: Sector[] = [];

    for (const etf of sectorETFs) {
      try {
        const result = await this.fetchFromYahoo(etf.symbol);
        
        if (result?.meta) {
          const meta = result.meta;
          const currentPrice = meta.regularMarketPrice || meta.previousClose || 0;
          const previousClose = meta.previousClose || meta.chartPreviousClose || 0;
          const change = currentPrice - previousClose;
          const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

          data.push({
            name: etf.name,
            icon: etf.icon,
            change,
            changePercent
          });
        }
      } catch (error) {
        console.error(`Error fetching sector ${etf.symbol}:`, error);
      }
    }

    if (data.length === 0) {
      // Fallback to mock data if API fails
      const mockData: Sector[] = [
        { name: 'Technology', icon: '💻', change: 1.8, changePercent: 1.8 },
        { name: 'Healthcare', icon: '🏥', change: 0.5, changePercent: 0.5 },
        { name: 'Financials', icon: '🏦', change: -0.3, changePercent: -0.3 },
        { name: 'Consumer', icon: '🛒', change: 0.9, changePercent: 0.9 },
        { name: 'Energy', icon: '⚡', change: -1.2, changePercent: -1.2 },
        { name: 'Industrials', icon: '🏭', change: 0.4, changePercent: 0.4 },
        { name: 'Materials', icon: '⚒️', change: -0.6, changePercent: -0.6 },
        { name: 'Real Estate', icon: '🏠', change: 0.2, changePercent: 0.2 },
        { name: 'Utilities', icon: '💡', change: 0.1, changePercent: 0.1 },
        { name: 'Telecom', icon: '📡', change: -0.4, changePercent: -0.4 },
        { name: 'Consumer Staples', icon: '🥫', change: 0.3, changePercent: 0.3 }
      ];
      this.setCache('sectors', mockData);
      return mockData;
    }

    this.setCache('sectors', data);
    return data;
  }

  static async getMarketMovers(type: 'gainers' | 'losers' | 'active'): Promise<MarketMover[]> {
    const cacheKey = `movers-${type}`;
    const cached = this.getCached<MarketMover[]>(cacheKey);
    if (cached) return cached;

    const data: MarketMover[] = [];
    
    // Popular stocks to fetch
    const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'AMD', 'INTC', 'NFLX'];
    const stockIcons: Record<string, string> = {
      'AAPL': '🍎', 'MSFT': '🪟', 'GOOGL': '🔍', 'AMZN': '📦',
      'NVDA': '🎮', 'TSLA': '⚡', 'META': '📱', 'AMD': '💻',
      'INTC': '💾', 'NFLX': '🎥'
    };

    for (const symbol of symbols) {
      try {
        // Try Yahoo Finance first
        const result = await this.fetchFromYahoo(symbol);
        
        if (result?.meta) {
          const meta = result.meta;
          const currentPrice = meta.regularMarketPrice || 0;
          const previousClose = meta.previousClose || 0;
          const change = currentPrice - previousClose;
          const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
          
          const moverType = type === 'gainers' ? 'gainer' : type === 'losers' ? 'loser' : 'active';
          data.push({
            ticker: symbol,
            name: meta.symbol || symbol,
            price: currentPrice,
            change,
            changePercent,
            type: moverType,
            icon: stockIcons[symbol] || '📊'
          });
          continue;
        }

        // Fallback to Finnhub
        const quote = await this.fetchFromFinnhub(`/quote?symbol=${symbol}`);
        
        if (quote && quote.c) {
          const moverType = type === 'gainers' ? 'gainer' : type === 'losers' ? 'loser' : 'active';
          data.push({
            ticker: symbol,
            name: symbol,
            price: quote.c,
            change: quote.d || 0,
            changePercent: quote.dp || 0,
            type: moverType,
            icon: stockIcons[symbol] || '📊'
          });
        }
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
      }
    }

    // Sort based on type
    if (type === 'gainers') {
      data.sort((a, b) => b.changePercent - a.changePercent);
    } else if (type === 'losers') {
      data.sort((a, b) => a.changePercent - b.changePercent);
    }

    // Return top 5
    const result = data.slice(0, 5);
    this.setCache(cacheKey, result);
    return result;
  }

  static async getFutures(): Promise<FutureAsset[]> {
    const cached = this.getCached<FutureAsset[]>('futures');
    if (cached) return cached;

    await new Promise(resolve => setTimeout(resolve, 200));

    const data: FutureAsset[] = [
      { symbol: 'CL', name: 'Crude Oil', price: 78.45, change: 1.23, changePercent: 1.6, icon: '🛢️' },
      { symbol: 'GC', name: 'Gold', price: 2034.56, change: -8.90, changePercent: -0.4, icon: '🪙' },
      { symbol: 'BTC', name: 'Bitcoin', price: 43567.89, change: 1234.56, changePercent: 2.9, icon: '₿' },
      { symbol: 'ZN', name: '10Y Treasury', price: 110.45, change: -0.23, changePercent: -0.2, icon: '📄' }
    ];

    this.setCache('futures', data);
    return data;
  }

  static async getEconomicEvents(): Promise<EconomicEvent[]> {
    const cached = this.getCached<EconomicEvent[]>('economic-events');
    if (cached) return cached;

    await new Promise(resolve => setTimeout(resolve, 150));

    const data: EconomicEvent[] = [
      {
        time: '08:30',
        event: 'Initial Jobless Claims',
        country: 'US',
        importance: 'high',
        forecast: '220K',
        previous: '218K'
      },
      {
        time: '10:00',
        event: 'Existing Home Sales',
        country: 'US',
        importance: 'medium',
        forecast: '3.95M',
        previous: '3.96M'
      },
      {
        time: '14:00',
        event: 'Fed Speech - Powell',
        country: 'US',
        importance: 'high'
      },
      {
        time: '15:30',
        event: 'Treasury Auction',
        country: 'US',
        importance: 'low'
      }
    ];

    this.setCache('economic-events', data);
    return data;
  }

  static async getMarketSummary(): Promise<MarketSummary> {
    const cached = this.getCached<MarketSummary>('market-summary');
    if (cached) return cached;

    await new Promise(resolve => setTimeout(resolve, 300));

    const summaries = [
      {
        headline: 'Tech Rally Continues',
        summary: 'Markets are up on strong tech earnings. NVIDIA\'s guidance beat expectations, lifting the entire semiconductor sector. Fed comments suggest rates will hold steady, providing support for growth stocks.',
        sentiment: 'bullish' as const
      },
      {
        headline: 'Mixed Trading Day',
        summary: 'Markets traded in a narrow range today as investors await key economic data. Tech stocks outperformed while energy lagged on lower oil prices. Fed officials maintain cautious stance on rate cuts.',
        sentiment: 'neutral' as const
      }
    ];

    const data = {
      ...summaries[Math.floor(Math.random() * summaries.length)],
      generatedAt: new Date()
    };

    this.setCache('market-summary', data);
    return data;
  }

  private static generateSparkline(points: number): number[] {
    const data: number[] = [];
    let current = 100;
    for (let i = 0; i < points; i++) {
      current += (Math.random() - 0.48) * 3;
      data.push(current);
    }
    return data;
  }

  // Helper to simulate real-time updates
  static subscribeToUpdates(callback: () => void): () => void {
    const interval = setInterval(() => {
      this.cache.clear(); // Clear cache to force fresh data
      callback();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }
}
