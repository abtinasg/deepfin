import { MarketDataProvider } from './base-provider';
import { FinnhubProvider } from './finnhub-provider';
import { AlphaVantageProvider } from './alphavantage-provider';
import { YahooFinanceProvider } from './yahoo-provider';
import { MarketData } from '@/types/market-data';

export class MarketDataProviderManager {
  private primaryProvider: MarketDataProvider;
  private fallbackProviders: MarketDataProvider[];
  private currentProvider: MarketDataProvider;
  private currentFallbackIndex = 0;
  private failoverInProgress = false;

  constructor(
    finnhubApiKey?: string,
    alphaVantageApiKey?: string
  ) {
    // Yahoo Finance as primary (no API key needed, more reliable)
    this.primaryProvider = new YahooFinanceProvider();
    
    // Setup fallback chain
    this.fallbackProviders = [];
    
    if (finnhubApiKey) {
      this.fallbackProviders.push(new FinnhubProvider(finnhubApiKey));
    }
    
    if (alphaVantageApiKey) {
      this.fallbackProviders.push(new AlphaVantageProvider(alphaVantageApiKey));
    }
    
    this.currentProvider = this.primaryProvider;
  }

  async connect(): Promise<void> {
    try {
      await this.currentProvider.connect();
      console.log(`[ProviderManager] Connected to ${this.currentProvider.name}`);
    } catch (error) {
      console.error(`[ProviderManager] Failed to connect to ${this.currentProvider.name}:`, error);
      await this.failover();
    }
  }

  disconnect(): void {
    this.primaryProvider.disconnect();
    this.fallbackProviders.forEach(provider => provider.disconnect());
  }

  subscribe(symbols: string[], callback: (data: MarketData) => void): void {
    this.currentProvider.subscribe(symbols, callback);
  }

  unsubscribe(symbols: string[]): void {
    this.currentProvider.unsubscribe(symbols);
  }

  async getQuote(symbol: string): Promise<MarketData> {
    try {
      return await this.currentProvider.getQuote(symbol);
    } catch (error) {
      console.error(`[ProviderManager] Failed to get quote from ${this.currentProvider.name}:`, error);
      
      // Try fallback providers in order
      for (const fallbackProvider of this.fallbackProviders) {
        if (fallbackProvider !== this.currentProvider) {
          try {
            console.log(`[ProviderManager] Trying fallback: ${fallbackProvider.name}`);
            return await fallbackProvider.getQuote(symbol);
          } catch (fallbackError) {
            console.error(`[ProviderManager] ${fallbackProvider.name} also failed:`, fallbackError);
            continue;
          }
        }
      }
      
      throw error;
    }
  }

  private async failover(): Promise<void> {
    if (this.failoverInProgress) {
      return;
    }

    this.failoverInProgress = true;

    try {
      console.log('[ProviderManager] Attempting failover to next provider...');
      
      // Disconnect current provider
      this.currentProvider.disconnect();

      // Try next fallback provider
      if (this.currentFallbackIndex < this.fallbackProviders.length) {
        this.currentProvider = this.fallbackProviders[this.currentFallbackIndex];
        this.currentFallbackIndex++;
      } else {
        // Reset to primary
        this.currentProvider = this.primaryProvider;
        this.currentFallbackIndex = 0;
      }

      // Connect to new provider
      await this.currentProvider.connect();
      
      console.log(`[ProviderManager] Successfully failed over to ${this.currentProvider.name}`);
    } catch (error) {
      console.error('[ProviderManager] Failover failed:', error);
      throw error;
    } finally {
      this.failoverInProgress = false;
    }
  }

  getCurrentProviderName(): string {
    return this.currentProvider.name;
  }

  isConnected(): boolean {
    return this.currentProvider.isConnected();
  }
}

// Singleton instance
let providerManager: MarketDataProviderManager | null = null;

export function getProviderManager(): MarketDataProviderManager {
  if (!providerManager) {
    const finnhubKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY || process.env.FINNHUB_API_KEY || '';
    const alphaVantageKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || process.env.ALPHA_VANTAGE_API_KEY || '';

    if (!finnhubKey && !alphaVantageKey) {
      throw new Error('No market data API keys configured');
    }

    providerManager = new MarketDataProviderManager(finnhubKey, alphaVantageKey);
  }

  return providerManager;
}

export function resetProviderManager(): void {
  if (providerManager) {
    providerManager.disconnect();
    providerManager = null;
  }
}
