import { BaseMarketDataProvider } from './base-provider';
import { MarketData, FinnhubTradeMessage } from '@/types/market-data';

export class FinnhubProvider extends BaseMarketDataProvider {
  name = 'Finnhub';
  private ws: WebSocket | null = null;
  private apiKey: string;
  private subscriptions = new Map<string, Set<(data: MarketData) => void>>();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      try {
        this.ws = new WebSocket(`wss://ws.finnhub.io?token=${this.apiKey}`);

        this.ws.onopen = () => {
          console.log('[Finnhub] Connected');
          this.connected = true;
          this.reconnectAttempts = 0;
          this.resubscribeAll();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onerror = (error) => {
          console.error('[Finnhub] WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[Finnhub] Disconnected');
          this.connected = false;
          this.scheduleReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.subscriptions.clear();
  }

  subscribe(symbols: string[], callback: (data: MarketData) => void): void {
    symbols.forEach((symbol) => {
      const upperSymbol = symbol.toUpperCase();
      
      if (!this.subscriptions.has(upperSymbol)) {
        this.subscriptions.set(upperSymbol, new Set());
      }
      this.subscriptions.get(upperSymbol)!.add(callback);

      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'subscribe', symbol: upperSymbol }));
        console.log(`[Finnhub] Subscribed to ${upperSymbol}`);
      }
    });
  }

  unsubscribe(symbols: string[]): void {
    symbols.forEach((symbol) => {
      const upperSymbol = symbol.toUpperCase();
      this.subscriptions.delete(upperSymbol);

      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'unsubscribe', symbol: upperSymbol }));
        console.log(`[Finnhub] Unsubscribed from ${upperSymbol}`);
      }
    });
  }

  async getQuote(symbol: string): Promise<MarketData> {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${this.apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch quote for ${symbol}`);
    }

    const data = await response.json();

    return {
      symbol,
      price: data.c || 0, // current price
      change: data.d || 0, // change
      changePercent: data.dp || 0, // percent change
      volume: 0,
      high: data.h || 0,
      low: data.l || 0,
      open: data.o || 0,
      previousClose: data.pc || 0,
      timestamp: data.t || Date.now(),
    };
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as FinnhubTradeMessage;

      if (message.type === 'trade' && message.data) {
        message.data.forEach((trade) => {
          const callbacks = this.subscriptions.get(trade.s);
          if (callbacks) {
            const marketData: MarketData = {
              symbol: trade.s,
              price: trade.p,
              change: 0,
              changePercent: 0,
              volume: trade.v,
              timestamp: trade.t,
            };

            callbacks.forEach((callback) => callback(marketData));
          }
        });
      }
    } catch (error) {
      console.error('[Finnhub] Failed to parse message:', error);
    }
  }

  private resubscribeAll(): void {
    this.subscriptions.forEach((_, symbol) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'subscribe', symbol }));
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[Finnhub] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(5000 * Math.pow(2, this.reconnectAttempts - 1), 60000);

    console.log(`[Finnhub] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        console.error('[Finnhub] Reconnect failed:', error);
      });
    }, delay);
  }
}
