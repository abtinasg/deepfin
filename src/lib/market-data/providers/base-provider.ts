import { MarketData } from '@/types/market-data';

export interface MarketDataProvider {
  name: string;
  connect(): Promise<void>;
  disconnect(): void;
  subscribe(symbols: string[], callback: (data: MarketData) => void): void;
  unsubscribe(symbols: string[]): void;
  getQuote(symbol: string): Promise<MarketData>;
  isConnected(): boolean;
}

export abstract class BaseMarketDataProvider implements MarketDataProvider {
  abstract name: string;
  protected connected = false;

  abstract connect(): Promise<void>;
  abstract disconnect(): void;
  abstract subscribe(symbols: string[], callback: (data: MarketData) => void): void;
  abstract unsubscribe(symbols: string[]): void;
  abstract getQuote(symbol: string): Promise<MarketData>;

  isConnected(): boolean {
    return this.connected;
  }
}
