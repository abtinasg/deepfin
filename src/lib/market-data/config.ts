/**
 * Market Data System Configuration
 * 
 * Centralized configuration for the real-time market data system.
 * Adjust these values based on your needs and API tier limits.
 */

export const MARKET_DATA_CONFIG = {
  /**
   * WebSocket Configuration
   */
  websocket: {
    // Maximum reconnection attempts before switching to fallback
    maxReconnectAttempts: 10,
    
    // Initial reconnect delay in milliseconds
    reconnectDelay: 5000,
    
    // Heartbeat interval for ping/pong in milliseconds
    heartbeatInterval: 30000,
    
    // Maximum message queue size for offline mode
    messageQueueSize: 100,
  },

  /**
   * Cache Configuration
   */
  cache: {
    // Default TTL for cached market data in seconds
    defaultTTL: 60,
    
    // Memory cache cleanup interval in milliseconds
    cleanupInterval: 5 * 60 * 1000, // 5 minutes
    
    // Maximum items in memory cache (0 = unlimited)
    maxMemoryItems: 0,
  },

  /**
   * Update Throttling
   */
  throttle: {
    // Throttle interval for UI updates in milliseconds
    uiUpdateInterval: 1000, // 1 second
    
    // Use RAF (Request Animation Frame) for smoother updates
    useRAF: true,
    
    // Batch size for bulk updates
    batchSize: 50,
    
    // Batch delay in milliseconds
    batchDelay: 100,
  },

  /**
   * Provider Configuration
   */
  providers: {
    // Finnhub WebSocket URL
    finnhubWsUrl: 'wss://ws.finnhub.io',
    
    // Alpha Vantage API base URL
    alphaVantageBaseUrl: 'https://www.alphavantage.co/query',
    
    // Alpha Vantage polling interval in milliseconds
    alphaVantagePollingInterval: 60000, // 1 minute
    
    // Enable automatic failover
    enableFailover: true,
  },

  /**
   * Store Configuration
   */
  store: {
    // Enable Redux DevTools integration
    enableDevTools: process.env.NODE_ENV === 'development',
    
    // Maximum historical data points per symbol
    maxHistoricalPoints: 100,
    
    // Store name for debugging
    storeName: 'MarketStore',
  },

  /**
   * Price Alerts Configuration
   */
  alerts: {
    // Enable browser notifications
    enableNotifications: true,
    
    // Enable alert sounds
    enableSounds: true,
    
    // Alert check interval in milliseconds
    checkInterval: 1000, // 1 second
    
    // Maximum active alerts per user
    maxAlerts: 50,
    
    // Alert sound URL
    soundUrl: '/sounds/alert.mp3',
  },

  /**
   * News & Notifications Configuration
   */
  notifications: {
    // Maximum notifications to store
    maxNotifications: 50,
    
    // News polling interval in milliseconds
    newsPollingInterval: 5 * 60 * 1000, // 5 minutes
    
    // Enable browser notifications for news
    enableBrowserNotifications: true,
  },

  /**
   * Volume Tracking Configuration
   */
  volume: {
    // Default volume spike threshold (multiplier)
    spikeThreshold: 1.5, // 1.5x average volume
    
    // Enable volume spike notifications
    enableNotifications: true,
  },

  /**
   * Performance Monitoring
   */
  performance: {
    // Log performance metrics to console
    enableLogging: process.env.NODE_ENV === 'development',
    
    // Track update latency
    trackLatency: true,
    
    // Maximum latency warning threshold in milliseconds
    latencyWarningThreshold: 1000,
  },

  /**
   * Feature Flags
   */
  features: {
    // Enable real-time WebSocket updates
    enableWebSocket: true,
    
    // Enable price alerts
    enablePriceAlerts: true,
    
    // Enable news notifications
    enableNewsNotifications: true,
    
    // Enable volume tracking
    enableVolumeTracking: true,
    
    // Enable historical data caching
    enableHistoricalData: true,
    
    // Enable optimistic updates
    enableOptimisticUpdates: true,
  },

  /**
   * API Rate Limits (per minute)
   * Adjust based on your API tier
   */
  rateLimits: {
    finnhub: {
      free: 60,
      basic: 300,
      professional: 600,
    },
    alphaVantage: {
      free: 5,
      premium: 75,
    },
  },
} as const;

/**
 * Environment-specific overrides
 */
export const getMarketDataConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    return {
      ...MARKET_DATA_CONFIG,
      performance: {
        ...MARKET_DATA_CONFIG.performance,
        enableLogging: false,
      },
      store: {
        ...MARKET_DATA_CONFIG.store,
        enableDevTools: false,
      },
    };
  }

  return MARKET_DATA_CONFIG;
};

/**
 * Type exports for configuration
 */
export type MarketDataConfig = typeof MARKET_DATA_CONFIG;
export type WebSocketConfig = typeof MARKET_DATA_CONFIG.websocket;
export type CacheConfig = typeof MARKET_DATA_CONFIG.cache;
export type ThrottleConfig = typeof MARKET_DATA_CONFIG.throttle;
export type ProviderConfig = typeof MARKET_DATA_CONFIG.providers;
