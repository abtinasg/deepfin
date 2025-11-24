import { BaseMarketDataProvider } from './base-provider';
import { MarketData } from '@/types/market-data';

export class YahooFinanceProvider extends BaseMarketDataProvider {
  name = 'Yahoo Finance';
  private pollIntervals = new Map<string, NodeJS.Timeout>();
  private callbacks = new Map<string, Set<(data: MarketData) => void>>();
  private cache = new Map<string, { data: MarketData; timestamp: number }>();
  private cacheTTL = 60000; // 1 minute cache

  constructor() {
    super();
  }

  async connect(): Promise<void> {
    // Yahoo Finance is REST-based, no persistent connection needed
    this.connected = true;
    console.log('[YahooFinance] Provider ready');
  }

  disconnect(): void {
    // Stop all polling intervals
    this.pollIntervals.forEach((interval) => clearInterval(interval));
    this.pollIntervals.clear();
    this.callbacks.clear();
    this.cache.clear();
    this.connected = false;
    console.log('[YahooFinance] Provider disconnected');
  }

  subscribe(symbols: string[], callback: (data: MarketData) => void): void {
    symbols.forEach((symbol) => {
      const upperSymbol = symbol.toUpperCase();

      // Add callback
      if (!this.callbacks.has(upperSymbol)) {
        this.callbacks.set(upperSymbol, new Set());
      }
      this.callbacks.get(upperSymbol)!.add(callback);

      // Start polling if not already polling
      if (!this.pollIntervals.has(upperSymbol)) {
        this.startPolling(upperSymbol);
      }
    });
  }

  unsubscribe(symbols: string[]): void {
    symbols.forEach((symbol) => {
      const upperSymbol = symbol.toUpperCase();
      this.callbacks.delete(upperSymbol);

      // Stop polling if no more callbacks
      const interval = this.pollIntervals.get(upperSymbol);
      if (interval) {
        clearInterval(interval);
        this.pollIntervals.delete(upperSymbol);
      }

      this.cache.delete(upperSymbol);
    });
  }

  async getQuote(symbol: string): Promise<MarketData> {
    const upperSymbol = symbol.toUpperCase();

    // Check cache first
    const cached = this.cache.get(upperSymbol);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    try {
      // Check if we're running on client-side
      const isClient = typeof window !== 'undefined';
      
      let response: Response;
      
      if (isClient) {
        // Use our API proxy to avoid CORS on client-side
        response = await fetch(`/api/yahoo-proxy?symbol=${upperSymbol}`);
      } else {
        // Server-side: call Yahoo directly
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${upperSymbol}?interval=1d&range=1d`;
        response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; DeepFin/1.0)',
          },
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Parse Yahoo Finance response
      const result = data.chart?.result?.[0];
      if (!result) {
        throw new Error('No data available');
      }

      const meta = result.meta;
      const quote = result.indicators?.quote?.[0];

      if (!meta || !quote) {
        throw new Error('Invalid response structure');
      }

      const currentPrice = meta.regularMarketPrice || meta.previousClose || 0;
      const previousClose = meta.previousClose || meta.chartPreviousClose || 0;
      const change = currentPrice - previousClose;
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

      // Get latest values from quote data
      const lastIndex = quote.close?.length - 1 || 0;
      const volume = quote.volume?.[lastIndex] || 0;
      const high = quote.high?.[lastIndex] || meta.regularMarketDayHigh || 0;
      const low = quote.low?.[lastIndex] || meta.regularMarketDayLow || 0;
      const open = quote.open?.[lastIndex] || meta.regularMarketOpen || 0;

      const marketData: MarketData = {
        symbol: upperSymbol,
        price: currentPrice,
        change,
        changePercent,
        volume,
        high,
        low,
        open,
        previousClose,
        timestamp: meta.regularMarketTime * 1000 || Date.now(),
      };

      // Cache the result
      this.cache.set(upperSymbol, { data: marketData, timestamp: Date.now() });

      return marketData;
    } catch (error) {
      console.error(`[YahooFinance] Failed to fetch quote for ${upperSymbol}:`, error);
      throw error;
    }
  }

  private startPolling(symbol: string): void {
    const pollInterval = 15000; // Poll every 15 seconds (Yahoo is generous!)

    // Initial fetch
    this.fetchAndNotify(symbol);

    // Set up polling
    const interval = setInterval(() => {
      this.fetchAndNotify(symbol);
    }, pollInterval);

    this.pollIntervals.set(symbol, interval);
    console.log(`[YahooFinance] Started polling for ${symbol}`);
  }

  private async fetchAndNotify(symbol: string): Promise<void> {
    try {
      const data = await this.getQuote(symbol);
      const callbacks = this.callbacks.get(symbol);
      
      if (callbacks) {
        callbacks.forEach((callback) => callback(data));
      }
    } catch (error) {
      console.error(`[YahooFinance] Error fetching ${symbol}:`, error);
    }
  }
}
