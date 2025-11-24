'use client';

import { create } from 'zustand';

export interface AIContextData {
  currentSymbol?: string;
  currentTimeframe?: string;
  portfolioSummary?: {
    totalValue: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
    topHoldings: Array<{ ticker: string; allocation: number }>;
  };
  watchlist?: string[];
  userQuery?: string;
}

interface AIContextStore {
  context: AIContextData;
  setCurrentSymbol: (symbol: string | undefined) => void;
  setCurrentTimeframe: (timeframe: string | undefined) => void;
  updateContext: (data: Partial<AIContextData>) => void;
  clearContext: () => void;
}

export const useAIContext = create<AIContextStore>((set) => ({
  context: {},
  setCurrentSymbol: (symbol) => set((state) => ({ 
    context: { ...state.context, currentSymbol: symbol } 
  })),
  setCurrentTimeframe: (timeframe) => set((state) => ({ 
    context: { ...state.context, currentTimeframe: timeframe } 
  })),
  updateContext: (data) => set((state) => ({ 
    context: { ...state.context, ...data } 
  })),
  clearContext: () => set({ context: {} }),
}));

// Hook to build comprehensive context string for AI
export function useAIContextBuilder() {
  const { context } = useAIContext();

  const buildContextString = (): string => {
    const parts: string[] = [];

    if (context.currentSymbol) {
      parts.push(`Current Symbol: ${context.currentSymbol}`);
      if (context.currentTimeframe) {
        parts.push(`Timeframe: ${context.currentTimeframe}`);
      }
    }

    if (context.portfolioSummary) {
      const p = context.portfolioSummary;
      parts.push(`\nPortfolio Context:`);
      parts.push(`- Total Value: $${p.totalValue.toLocaleString()}`);
      parts.push(`- Gain/Loss: ${p.totalGainLoss >= 0 ? '+' : ''}$${p.totalGainLoss.toLocaleString()} (${p.totalGainLossPercent.toFixed(2)}%)`);
      if (p.topHoldings.length > 0) {
        parts.push(`- Top Holdings: ${p.topHoldings.map(h => `${h.ticker} (${h.allocation.toFixed(1)}%)`).join(', ')}`);
      }
    }

    if (context.watchlist && context.watchlist.length > 0) {
      parts.push(`\nWatchlist: ${context.watchlist.join(', ')}`);
    }

    return parts.length > 0 ? parts.join('\n') : '';
  };

  return { context, buildContextString };
}
