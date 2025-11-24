'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMarketData } from './use-market-data';
import {
  Portfolio,
  PortfolioSummary,
  PerformanceMetrics,
  AllocationData,
  Transaction,
  AddTransactionRequest,
} from '@/types/portfolio';

export function usePortfolio(portfolioId?: string) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    if (!portfolioId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/portfolio/${portfolioId}`);
      if (!response.ok) throw new Error('Failed to fetch portfolio');
      const data = await response.json();
      setPortfolio(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [portfolioId]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  return { portfolio, loading, error, refetch: fetchPortfolio };
}

export function usePortfolios() {
  const [portfolios, setPortfolios] = useState<PortfolioSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolios = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/portfolio');
      if (!response.ok) throw new Error('Failed to fetch portfolios');
      const data = await response.json();
      setPortfolios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  const createPortfolio = async (name: string, description?: string) => {
    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) throw new Error('Failed to create portfolio');

      await fetchPortfolios();
      return response.json();
    } catch (err) {
      throw err;
    }
  };

  const deletePortfolio = async (id: string) => {
    try {
      const response = await fetch(`/api/portfolio/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete portfolio');

      await fetchPortfolios();
    } catch (err) {
      throw err;
    }
  };

  return {
    portfolios,
    loading,
    error,
    refetch: fetchPortfolios,
    createPortfolio,
    deletePortfolio,
  };
}

export function usePortfolioRealtime(portfolioId?: string) {
  const { portfolio, loading, error, refetch } = usePortfolio(portfolioId);
  const [realtimePortfolio, setRealtimePortfolio] = useState<Portfolio | null>(null);

  // Get tickers from portfolio
  const tickers = portfolio?.holdings?.map((h) => h.ticker) || [];

  // Subscribe to real-time market data
  const { data: marketData } = useMarketData(tickers);

  // Update portfolio with real-time prices
  useEffect(() => {
    if (!portfolio || !marketData || Object.keys(marketData).length === 0) {
      setRealtimePortfolio(portfolio);
      return;
    }

    let totalValue = 0;
    let totalCost = 0;
    let totalDayChange = 0;

    const updatedHoldings = portfolio.holdings.map((holding) => {
      const quote = marketData[holding.ticker];
      const currentPrice = quote?.price || holding.currentPrice;
      const dayChange = quote?.change || 0;
      const dayChangePercent = quote?.changePercent || 0;

      const currentValue = holding.shares * currentPrice;
      const costValue = holding.shares * holding.costBasis;
      const gainLoss = currentValue - costValue;
      const gainLossPercent = costValue > 0 ? (gainLoss / costValue) * 100 : 0;
      const dayChangeValue = holding.shares * dayChange;

      totalValue += currentValue;
      totalCost += costValue;
      totalDayChange += dayChangeValue;

      return {
        ...holding,
        currentPrice,
        currentValue,
        gainLoss,
        gainLossPercent,
        dayChange: dayChangeValue,
        dayChangePercent,
      };
    });

    // Recalculate allocation
    updatedHoldings.forEach((holding) => {
      holding.allocation = totalValue > 0 ? (holding.currentValue / totalValue) * 100 : 0;
    });

    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
    const dayChangePercent = totalValue > 0 ? (totalDayChange / totalValue) * 100 : 0;

    setRealtimePortfolio({
      ...portfolio,
      holdings: updatedHoldings,
      totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPercent,
      dayChange: totalDayChange,
      dayChangePercent,
    });
  }, [portfolio, marketData]);

  return {
    portfolio: realtimePortfolio,
    loading,
    error,
    refetch,
  };
}

export function usePortfolioPerformance(portfolioId?: string, startDate?: Date, endDate?: Date) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [allocation, setAllocation] = useState<AllocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!portfolioId) return;

    const fetchPerformance = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (startDate) params.set('startDate', startDate.toISOString());
        if (endDate) params.set('endDate', endDate.toISOString());

        const response = await fetch(`/api/portfolio/${portfolioId}/performance?${params}`);
        if (!response.ok) throw new Error('Failed to fetch performance data');

        const data = await response.json();
        setChartData(data.chartData);
        setMetrics(data.metrics);
        setAllocation(data.allocation);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [portfolioId, startDate, endDate]);

  return { chartData, metrics, allocation, loading, error };
}

export function usePortfolioTransactions(portfolioId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!portfolioId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/portfolio/${portfolioId}/transactions`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [portfolioId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (transaction: Omit<AddTransactionRequest, 'portfolioId'>) => {
    if (!portfolioId) throw new Error('Portfolio ID is required');

    try {
      const response = await fetch(`/api/portfolio/${portfolioId}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });

      if (!response.ok) throw new Error('Failed to add transaction');

      await fetchTransactions();
      return response.json();
    } catch (err) {
      throw err;
    }
  };

  return { transactions, loading, error, addTransaction, refetch: fetchTransactions };
}
