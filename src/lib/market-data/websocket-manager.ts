import {
  MarketData,
  WebSocketMessage,
  ConnectionStatus,
  QueuedMessage,
  FinnhubTradeMessage,
} from '@/types/market-data';

export interface MarketDataManagerConfig {
  apiKey: string;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  messageQueueSize?: number;
}

export class MarketDataManager {
  private ws: WebSocket | null = null;
  private subscriptions: Set<string> = new Set();
  private messageCallbacks: Map<string, Set<(data: MarketData) => void>> = new Map();
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageQueue: QueuedMessage[] = [];
  private connectionStatus: ConnectionStatus = {
    connected: false,
    reconnecting: false,
    reconnectAttempts: 0,
  };
  private statusCallbacks: Set<(status: ConnectionStatus) => void> = new Set();

  private readonly config: Required<MarketDataManagerConfig>;
  private readonly wsUrl = 'wss://ws.finnhub.io';

  constructor(config: MarketDataManagerConfig) {
    this.config = {
      reconnectDelay: config.reconnectDelay ?? 5000,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 10,
      heartbeatInterval: config.heartbeatInterval ?? 30000,
      messageQueueSize: config.messageQueueSize ?? 100,
      apiKey: config.apiKey,
    };
  }

  /**
   * Establish WebSocket connection
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[MarketData] Already connected');
      return;
    }

    if (this.ws?.readyState === WebSocket.CONNECTING) {
      console.log('[MarketData] Connection already in progress');
      return;
    }

    try {
      console.log('[MarketData] Connecting to WebSocket...');
      this.ws = new WebSocket(`${this.wsUrl}?token=${this.config.apiKey}`);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
    } catch (error) {
      console.error('[MarketData] Connection error:', error);
      this.handleConnectionError(error as Error);
    }
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    console.log('[MarketData] Connected to WebSocket');
    this.reconnectAttempts = 0;
    this.connectionStatus = {
      connected: true,
      reconnecting: false,
      reconnectAttempts: 0,
      lastConnected: Date.now(),
    };
    this.notifyStatusChange();
    this.startHeartbeat();
    this.resubscribeAll();
    this.processMessageQueue();
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);

      // Handle pong response
      if (message.type === 'pong') {
        return;
      }

      // Handle trade messages
      if (message.type === 'trade') {
        const tradeMessage = message as unknown as FinnhubTradeMessage;
        this.processTradeData(tradeMessage);
      }

      // Handle error messages
      if (message.type === 'error') {
        console.error('[MarketData] Server error:', message.data);
      }
    } catch (error) {
      console.error('[MarketData] Failed to parse message:', error);
    }
  }

  /**
   * Process trade data from Finnhub
   */
  private processTradeData(message: FinnhubTradeMessage): void {
    if (!message.data || !Array.isArray(message.data)) return;

    message.data.forEach((trade) => {
      const marketData: MarketData = {
        symbol: trade.s,
        price: trade.p,
        change: 0, // Calculate from previous price
        changePercent: 0, // Calculate from previous price
        volume: trade.v,
        timestamp: trade.t,
      };

      // Notify all callbacks for this symbol
      const callbacks = this.messageCallbacks.get(trade.s);
      if (callbacks) {
        callbacks.forEach((callback) => callback(marketData));
      }
    });
  }

  /**
   * Handle WebSocket errors
   */
  private handleError(event: Event): void {
    console.error('[MarketData] WebSocket error:', event);
    this.connectionStatus = {
      ...this.connectionStatus,
      error: 'Connection error occurred',
    };
    this.notifyStatusChange();
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    console.log('[MarketData] WebSocket closed:', event.code, event.reason);
    this.stopHeartbeat();
    this.connectionStatus = {
      connected: false,
      reconnecting: false,
      reconnectAttempts: this.reconnectAttempts,
    };
    this.notifyStatusChange();

    // Attempt to reconnect
    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.scheduleReconnect();
    } else {
      console.error('[MarketData] Max reconnect attempts reached');
      this.connectionStatus.error = 'Failed to reconnect after maximum attempts';
      this.notifyStatusChange();
    }
  }

  /**
   * Handle connection errors
   */
  private handleConnectionError(error: Error): void {
    console.error('[MarketData] Connection error:', error);
    this.connectionStatus = {
      connected: false,
      reconnecting: false,
      error: error.message,
      reconnectAttempts: this.reconnectAttempts,
    };
    this.notifyStatusChange();
    this.scheduleReconnect();
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    this.connectionStatus = {
      ...this.connectionStatus,
      reconnecting: true,
      reconnectAttempts: this.reconnectAttempts,
    };
    this.notifyStatusChange();

    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      60000 // Max 60 seconds
    );

    console.log(`[MarketData] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Start heartbeat ping/pong
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Subscribe to symbol updates
   */
  subscribe(symbols: string[], callback?: (data: MarketData) => void): void {
    symbols.forEach((symbol) => {
      const upperSymbol = symbol.toUpperCase();
      this.subscriptions.add(upperSymbol);

      if (callback) {
        if (!this.messageCallbacks.has(upperSymbol)) {
          this.messageCallbacks.set(upperSymbol, new Set());
        }
        this.messageCallbacks.get(upperSymbol)!.add(callback);
      }

      if (this.ws?.readyState === WebSocket.OPEN) {
        this.sendSubscribe(upperSymbol);
      } else {
        this.queueMessage({
          id: `sub-${upperSymbol}-${Date.now()}`,
          type: 'subscribe',
          payload: { symbol: upperSymbol },
          timestamp: Date.now(),
          retries: 0,
        });
      }
    });
  }

  /**
   * Unsubscribe from symbol updates
   */
  unsubscribe(symbols: string[], callback?: (data: MarketData) => void): void {
    symbols.forEach((symbol) => {
      const upperSymbol = symbol.toUpperCase();

      if (callback) {
        const callbacks = this.messageCallbacks.get(upperSymbol);
        if (callbacks) {
          callbacks.delete(callback);
          if (callbacks.size === 0) {
            this.messageCallbacks.delete(upperSymbol);
            this.subscriptions.delete(upperSymbol);
            if (this.ws?.readyState === WebSocket.OPEN) {
              this.sendUnsubscribe(upperSymbol);
            }
          }
        }
      } else {
        this.subscriptions.delete(upperSymbol);
        this.messageCallbacks.delete(upperSymbol);
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.sendUnsubscribe(upperSymbol);
        }
      }
    });
  }

  /**
   * Send subscribe message to WebSocket
   */
  private sendSubscribe(symbol: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', symbol }));
      console.log(`[MarketData] Subscribed to ${symbol}`);
    }
  }

  /**
   * Send unsubscribe message to WebSocket
   */
  private sendUnsubscribe(symbol: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'unsubscribe', symbol }));
      console.log(`[MarketData] Unsubscribed from ${symbol}`);
    }
  }

  /**
   * Resubscribe to all symbols after reconnection
   */
  private resubscribeAll(): void {
    this.subscriptions.forEach((symbol) => {
      this.sendSubscribe(symbol);
    });
  }

  /**
   * Queue message for sending when connection is restored
   */
  private queueMessage(message: QueuedMessage): void {
    if (this.messageQueue.length >= this.config.messageQueueSize) {
      this.messageQueue.shift(); // Remove oldest message
    }
    this.messageQueue.push(message);
  }

  /**
   * Process queued messages after connection is restored
   */
  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      if (message) {
        try {
          if (message.type === 'subscribe' && typeof message.payload === 'object' && message.payload !== null) {
            const payload = message.payload as { symbol: string };
            this.sendSubscribe(payload.symbol);
          }
        } catch (error) {
          console.error('[MarketData] Failed to process queued message:', error);
        }
      }
    }
  }

  /**
   * Register callback for connection status changes
   */
  onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.statusCallbacks.add(callback);
    // Return unsubscribe function
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  /**
   * Notify all status callbacks
   */
  private notifyStatusChange(): void {
    this.statusCallbacks.forEach((callback) => {
      callback({ ...this.connectionStatus });
    });
  }

  /**
   * Get current connection status
   */
  getStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  /**
   * Get list of active subscriptions
   */
  getSubscriptions(): string[] {
    return Array.from(this.subscriptions);
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    console.log('[MarketData] Disconnecting...');
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
    this.messageCallbacks.clear();
    this.messageQueue = [];
    this.connectionStatus = {
      connected: false,
      reconnecting: false,
      reconnectAttempts: 0,
    };
    this.notifyStatusChange();
  }
}

// Singleton instance
let marketDataManager: MarketDataManager | null = null;

export function getMarketDataManager(): MarketDataManager {
  if (!marketDataManager) {
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY || '';
    if (!apiKey) {
      throw new Error('NEXT_PUBLIC_FINNHUB_API_KEY is not configured');
    }
    marketDataManager = new MarketDataManager({ apiKey });
  }
  return marketDataManager;
}

export function resetMarketDataManager(): void {
  if (marketDataManager) {
    marketDataManager.disconnect();
    marketDataManager = null;
  }
}
