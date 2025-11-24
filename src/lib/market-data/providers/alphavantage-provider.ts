import { BaseMarketDataProvider } from './base-provider';
import { MarketData } from '@/types/market-data';

export class AlphaVantageProvider extends BaseMarketDataProvider {
  name = 'Alpha Vantage';
  private apiKey: string;
  private pollIntervals = new Map<string, NodeJS.Timeout>();
  private callbacks = new Map<string, Set<(data: MarketData)=> void>>();
  private cache = new Map<string, { data: MarketData; timestamp: number }>();
  private cacheTTL = 60000; // 1 minute cache

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async connect(): Promise<void> {
    // Alpha Vantage is REST-based, no persistent connection needed
    this.connected = true;
    console.log('[AlphaVantage] Provider ready');
  }

  disconnect(): void {
    // Stop all polling intervals
    this.pollIntervals.forEach((interval) => clearInterval(interval));
    this.pollIntervals.clear();
    this.callbacks.clear();
    this.cache.clear();
    this.connected = false;
    console.log('[AlphaVantage] Provider disconnected');
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
      const url = new URL('https://www.alphavantage.co/query');
      url.searchParams.set('function', 'GLOBAL_QUOTE');
      url.searchParams.set('symbol', upperSymbol);
      url.searchParams.set('apikey', this.apiKey);

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Check for API errors
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }

      if (data['Note']) {
        // API limit reached
        console.warn('[AlphaVantage] API limit reached:', data['Note']);
        throw new Error('API limit reached');
      }

      const quote = data['Global Quote'];
      if (!quote) {
        throw new Error('No quote data available');
      }

      const marketData: MarketData = {
        symbol: upperSymbol,
        price: parseFloat(quote['05. price']) || 0,
        change: parseFloat(quote['09. change']) || 0,
        changePercent: parseFloat(quote['10. change percent']?.replace('%', '')) || 0,
        volume: parseInt(quote['06. volume']) || 0,
        high: parseFloat(quote['03. high']) || 0,
        low: parseFloat(quote['04. low']) || 0,
        open: parseFloat(quote['02. open']) || 0,
        previousClose: parseFloat(quote['08. previous close']) || 0,
        timestamp: Date.now(),
      };

      // Cache the result
      this.cache.set(upperSymbol, { data: marketData, timestamp: Date.now() });

      return marketData;
    } catch (error) {
      console.error(`[AlphaVantage] Failed to fetch quote for ${upperSymbol}:`, error);
      throw error;
    }
  }

  private startPolling(symbol: string): void {
    const pollInterval = 60000; // Poll every 60 seconds (Alpha Vantage limit)

    // Initial fetch
    this.fetchAndNotify(symbol);

    // Set up polling
    const interval = setInterval(() => {
      this.fetchAndNotify(symbol);
    }, pollInterval);

    this.pollIntervals.set(symbol, interval);
    console.log(`[AlphaVantage] Started polling for ${symbol}`);
  }

  private async fetchAndNotify(symbol: string): Promise<void> {
    try {
      const data = await this.getQuote(symbol);
      const callbacks = this.callbacks.get(symbol);
      
      if (callbacks) {
        callbacks.forEach((callback) => callback(data));
      }
    } catch (error) {
      console.error(`[AlphaVantage] Error fetching ${symbol}:`, error);
    }
  }
}
