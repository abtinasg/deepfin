import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { MarketData, IndexData, StockData, HistoricalDataPoint } from '@/types/market-data';

interface MarketState {
  // Current market data
  indices: Record<string, IndexData>;
  stocks: Record<string, StockData>;
  historicalData: Record<string, HistoricalDataPoint[]>;
  
  // Optimistic update tracking
  pendingUpdates: Map<string, MarketData>;
  
  // Loading and error states
  loading: Set<string>;
  errors: Record<string, string>;
  
  // Last update timestamps
  lastUpdated: Record<string, number>;
  
  // Actions
  updatePrice: (symbol: string, data: Partial<MarketData>) => void;
  updateIndex: (symbol: string, data: Partial<IndexData>) => void;
  updateStock: (symbol: string, data: Partial<StockData>) => void;
  
  // Optimistic updates
  startOptimisticUpdate: (symbol: string, data: MarketData) => void;
  commitOptimisticUpdate: (symbol: string) => void;
  rollbackOptimisticUpdate: (symbol: string) => void;
  
  // Historical data
  addHistoricalData: (symbol: string, data: HistoricalDataPoint) => void;
  setHistoricalData: (symbol: string, data: HistoricalDataPoint[]) => void;
  
  // Batch updates
  batchUpdateStocks: (updates: Record<string, Partial<StockData>>) => void;
  batchUpdateIndices: (updates: Record<string, Partial<IndexData>>) => void;
  
  // State management
  setLoading: (symbol: string, loading: boolean) => void;
  setError: (symbol: string, error: string | null) => void;
  clearErrors: () => void;
  reset: () => void;
}

// Create a backup for rollback functionality
const createBackup = <T,>(data: Record<string, T>, symbol: string): T | undefined => {
  return data[symbol] ? { ...data[symbol] } : undefined;
};

export const useMarketStore = create<MarketState>()(
  devtools(
    (set, get) => ({
      // Initial state
      indices: {},
      stocks: {},
      historicalData: {},
      pendingUpdates: new Map(),
      loading: new Set(),
      errors: {},
      lastUpdated: {},

      // Update individual stock price
      updatePrice: (symbol: string, data: Partial<MarketData>) => {
        set((state) => {
          const existing = state.stocks[symbol];
          if (!existing) return state;

          // Calculate change if price is provided
          let change = data.change ?? existing.change;
          let changePercent = data.changePercent ?? existing.changePercent;
          
          if (data.price !== undefined && existing.price) {
            change = data.price - existing.price;
            changePercent = (change / existing.price) * 100;
          }

          return {
            stocks: {
              ...state.stocks,
              [symbol]: {
                ...existing,
                ...data,
                change,
                changePercent,
              },
            },
            lastUpdated: {
              ...state.lastUpdated,
              [symbol]: Date.now(),
            },
          };
        }, false, 'updatePrice');
      },

      // Update index data
      updateIndex: (symbol: string, data: Partial<IndexData>) => {
        set((state) => {
          const existing = state.indices[symbol];
          const updated = existing
            ? { ...existing, ...data }
            : {
                name: data.name || symbol,
                symbol,
                value: data.value || 0,
                change: data.change || 0,
                changePercent: data.changePercent || 0,
                timestamp: data.timestamp || Date.now(),
                isLive: data.isLive ?? true,
                ...data,
              };

          return {
            indices: {
              ...state.indices,
              [symbol]: updated,
            },
            lastUpdated: {
              ...state.lastUpdated,
              [symbol]: Date.now(),
            },
          };
        }, false, 'updateIndex');
      },

      // Update stock data
      updateStock: (symbol: string, data: Partial<StockData>) => {
        set((state) => {
          const existing = state.stocks[symbol];
          const updated = existing
            ? { ...existing, ...data }
            : {
                symbol,
                name: data.name || symbol,
                price: data.price || 0,
                change: data.change || 0,
                changePercent: data.changePercent || 0,
                volume: data.volume || 0,
                timestamp: data.timestamp || Date.now(),
                ...data,
              };

          return {
            stocks: {
              ...state.stocks,
              [symbol]: updated,
            },
            lastUpdated: {
              ...state.lastUpdated,
              [symbol]: Date.now(),
            },
          };
        }, false, 'updateStock');
      },

      // Start optimistic update
      startOptimisticUpdate: (symbol: string, data: MarketData) => {
        set((state) => {
          const backup = createBackup(state.stocks, symbol);
          if (backup) {
            const newPendingUpdates = new Map(state.pendingUpdates);
            newPendingUpdates.set(symbol, backup as MarketData);

            return {
              stocks: {
                ...state.stocks,
                [symbol]: {
                  ...(state.stocks[symbol] || {}),
                  ...data,
                } as StockData,
              },
              pendingUpdates: newPendingUpdates,
            };
          }
          return state;
        }, false, 'startOptimisticUpdate');
      },

      // Commit optimistic update
      commitOptimisticUpdate: (symbol: string) => {
        set((state) => {
          const newPendingUpdates = new Map(state.pendingUpdates);
          newPendingUpdates.delete(symbol);
          return { pendingUpdates: newPendingUpdates };
        }, false, 'commitOptimisticUpdate');
      },

      // Rollback optimistic update
      rollbackOptimisticUpdate: (symbol: string) => {
        set((state) => {
          const backup = state.pendingUpdates.get(symbol);
          if (backup) {
            const newPendingUpdates = new Map(state.pendingUpdates);
            newPendingUpdates.delete(symbol);

            return {
              stocks: {
                ...state.stocks,
                [symbol]: backup as StockData,
              },
              pendingUpdates: newPendingUpdates,
            };
          }
          return state;
        }, false, 'rollbackOptimisticUpdate');
      },

      // Add single historical data point
      addHistoricalData: (symbol: string, data: HistoricalDataPoint) => {
        set((state) => {
          const existing = state.historicalData[symbol] || [];
          const updated = [...existing, data].sort((a, b) => a.timestamp - b.timestamp);
          
          // Keep only last 100 data points
          const trimmed = updated.slice(-100);

          return {
            historicalData: {
              ...state.historicalData,
              [symbol]: trimmed,
            },
          };
        }, false, 'addHistoricalData');
      },

      // Set historical data
      setHistoricalData: (symbol: string, data: HistoricalDataPoint[]) => {
        set((state) => ({
          historicalData: {
            ...state.historicalData,
            [symbol]: data.sort((a, b) => a.timestamp - b.timestamp),
          },
        }), false, 'setHistoricalData');
      },

      // Batch update stocks
      batchUpdateStocks: (updates: Record<string, Partial<StockData>>) => {
        set((state) => {
          const newStocks = { ...state.stocks };
          const newLastUpdated = { ...state.lastUpdated };
          const now = Date.now();

          Object.entries(updates).forEach(([symbol, data]) => {
            const existing = newStocks[symbol];
            newStocks[symbol] = existing
              ? { ...existing, ...data }
              : {
                  symbol,
                  name: data.name || symbol,
                  price: data.price || 0,
                  change: data.change || 0,
                  changePercent: data.changePercent || 0,
                  volume: data.volume || 0,
                  timestamp: data.timestamp || now,
                  ...data,
                } as StockData;
            newLastUpdated[symbol] = now;
          });

          return {
            stocks: newStocks,
            lastUpdated: newLastUpdated,
          };
        }, false, 'batchUpdateStocks');
      },

      // Batch update indices
      batchUpdateIndices: (updates: Record<string, Partial<IndexData>>) => {
        set((state) => {
          const newIndices = { ...state.indices };
          const newLastUpdated = { ...state.lastUpdated };
          const now = Date.now();

          Object.entries(updates).forEach(([symbol, data]) => {
            const existing = newIndices[symbol];
            newIndices[symbol] = existing
              ? { ...existing, ...data }
              : {
                  symbol,
                  name: data.name || symbol,
                  value: data.value || 0,
                  change: data.change || 0,
                  changePercent: data.changePercent || 0,
                  timestamp: data.timestamp || now,
                  isLive: data.isLive ?? true,
                  ...data,
                };
            newLastUpdated[symbol] = now;
          });

          return {
            indices: newIndices,
            lastUpdated: newLastUpdated,
          };
        }, false, 'batchUpdateIndices');
      },

      // Set loading state
      setLoading: (symbol: string, loading: boolean) => {
        set((state) => {
          const newLoading = new Set(state.loading);
          if (loading) {
            newLoading.add(symbol);
          } else {
            newLoading.delete(symbol);
          }
          return { loading: newLoading };
        }, false, 'setLoading');
      },

      // Set error
      setError: (symbol: string, error: string | null) => {
        set((state) => {
          if (error === null) {
            const { [symbol]: _, ...rest } = state.errors;
            return { errors: rest };
          }
          return {
            errors: {
              ...state.errors,
              [symbol]: error,
            },
          };
        }, false, 'setError');
      },

      // Clear all errors
      clearErrors: () => {
        set({ errors: {} }, false, 'clearErrors');
      },

      // Reset store
      reset: () => {
        set({
          indices: {},
          stocks: {},
          historicalData: {},
          pendingUpdates: new Map(),
          loading: new Set(),
          errors: {},
          lastUpdated: {},
        }, false, 'reset');
      },
    }),
    { name: 'MarketStore' }
  )
);

// Selectors for optimized access
export const selectStock = (symbol: string) => (state: MarketState) => state.stocks[symbol];
export const selectIndex = (symbol: string) => (state: MarketState) => state.indices[symbol];
export const selectHistoricalData = (symbol: string) => (state: MarketState) => 
  state.historicalData[symbol] || [];
export const selectIsLoading = (symbol: string) => (state: MarketState) => 
  state.loading.has(symbol);
export const selectError = (symbol: string) => (state: MarketState) => 
  state.errors[symbol];
export const selectLastUpdated = (symbol: string) => (state: MarketState) => 
  state.lastUpdated[symbol];
