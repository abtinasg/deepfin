'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMarketStore, selectStock, selectIsLoading, selectError } from '@/stores/market-store';
import { MarketData, StockData, ConnectionStatus } from '@/types/market-data';
import { getProviderManager } from '@/lib/market-data/providers';
import { getMarketDataCache } from '@/lib/market-data/cache-service';

const THROTTLE_INTERVAL = 1000; // 1 second throttle for UI updates

/**
 * Hook for real-time market data with WebSocket subscription
 */
export function useMarketData(symbols: string[]) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    reconnecting: false,
    reconnectAttempts: 0,
  });

  const updateStock = useMarketStore((state) => state.updateStock);
  const setLoading = useMarketStore((state) => state.setLoading);
  const setError = useMarketStore((state) => state.setError);

  // Throttle updates to prevent excessive re-renders
  const throttleTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const pendingUpdates = useRef<Map<string, MarketData>>(new Map());

  const throttledUpdate = useCallback(
    (symbol: string, data: MarketData) => {
      pendingUpdates.current.set(symbol, data);

      if (!throttleTimers.current.has(symbol)) {
        const timer = setTimeout(() => {
          const update = pendingUpdates.current.get(symbol);
          if (update) {
            updateStock(symbol, update);
            pendingUpdates.current.delete(symbol);
          }
          throttleTimers.current.delete(symbol);
        }, THROTTLE_INTERVAL);

        throttleTimers.current.set(symbol, timer);
      }
    },
    [updateStock]
  );

  useEffect(() => {
    if (symbols.length === 0) return;

    let manager: ReturnType<typeof getProviderManager> | null = null;
    let mounted = true;

    const initializeConnection = async () => {
      try {
        manager = getProviderManager();
        
        // Set loading state
        symbols.forEach((symbol) => setLoading(symbol, true));

        // Connect to provider
        await manager.connect();

        if (!mounted) return;

        setConnectionStatus({
          connected: true,
          reconnecting: false,
          reconnectAttempts: 0,
          lastConnected: Date.now(),
        });

        // Subscribe to real-time updates
        manager.subscribe(symbols, (data: MarketData) => {
          if (mounted) {
            throttledUpdate(data.symbol, data);
          }
        });

        // Load initial data from cache or API
        const cache = getMarketDataCache();
        const cachedData = await cache.getMany(symbols);

        await Promise.all(
          symbols.map(async (symbol) => {
            try {
              const cached = cachedData.get(symbol);
              if (cached) {
                updateStock(symbol, cached);
              } else {
                const quote = await manager!.getQuote(symbol);
                updateStock(symbol, quote);
                await cache.set(symbol, quote);
              }
              setLoading(symbol, false);
            } catch (error) {
              console.error(`Failed to load data for ${symbol}:`, error);
              setError(symbol, error instanceof Error ? error.message : 'Failed to load data');
              setLoading(symbol, false);
            }
          })
        );
      } catch (error) {
        console.error('Failed to initialize market data connection:', error);
        setConnectionStatus({
          connected: false,
          reconnecting: false,
          reconnectAttempts: 0,
          error: error instanceof Error ? error.message : 'Connection failed',
        });
        symbols.forEach((symbol) => {
          setLoading(symbol, false);
          setError(symbol, 'Failed to connect to market data provider');
        });
      }
    };

    initializeConnection();

    return () => {
      mounted = false;
      
      // Clear throttle timers
      throttleTimers.current.forEach((timer) => clearTimeout(timer));
      throttleTimers.current.clear();
      pendingUpdates.current.clear();

      // Unsubscribe from updates
      if (manager) {
        manager.unsubscribe(symbols);
      }
    };
  }, [symbols.join(','), updateStock, setLoading, setError, throttledUpdate]);

  // Get stock data from store
  const stocks = symbols.map((symbol) => 
    useMarketStore(selectStock(symbol))
  );

  const isLoading = symbols.some((symbol) => 
    useMarketStore(selectIsLoading(symbol))
  );

  const errors = symbols
    .map((symbol) => useMarketStore(selectError(symbol)))
    .filter(Boolean);

  return {
    data: stocks.filter(Boolean) as StockData[],
    isLoading,
    errors,
    connectionStatus,
  };
}

/**
 * Hook for single stock quote
 */
export function useQuote(symbol: string) {
  const { data, isLoading, errors, connectionStatus } = useMarketData([symbol]);

  return {
    data: data[0] || null,
    isLoading,
    error: errors[0] || null,
    connectionStatus,
  };
}

/**
 * Hook for stock search (REST API)
 */
export function useStockSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      const response = await fetch(`/api/market/search?q=${query}`);
      if (!response.ok) throw new Error('Failed to search');
      return response.json();
    },
    enabled: query.length >= 1,
  });
}

/**
 * Hook for user profile
 */
export function useUserProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await fetch('/api/user/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    },
  });
}
