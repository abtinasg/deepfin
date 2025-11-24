import { prisma } from './prisma';
import { yahooFinanceService } from './yahoo-finance-service';
import {
  Portfolio,
  Holding,
  Transaction,
  PerformanceMetrics,
  AllocationData,
  AllocationItem,
  ChartDataPoint,
  BenchmarkComparison,
  RiskMetrics,
  DiversificationMetrics,
} from '@/types/portfolio';

export class PortfolioManager {
  /**
   * Calculate real-time portfolio value with current market prices
   */
  async calculatePortfolioValue(portfolioId: string): Promise<Portfolio> {
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: {
        holdings: true,
      },
    });

    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    // Fetch current prices for all holdings
    const tickers = portfolio.holdings.map((h) => h.ticker);
    const quotes = await Promise.all(
      tickers.map((ticker) => yahooFinanceService.getQuote(ticker))
    );

    const priceMap = new Map(
      quotes.map((q) => [q.symbol, { price: q.price, change: q.change, changePercent: q.changePercent }])
    );

    let totalValue = 0;
    let totalCost = 0;
    let totalDayChange = 0;

    const enrichedHoldings: Holding[] = portfolio.holdings.map((holding) => {
      const quote = priceMap.get(holding.ticker);
      const currentPrice = quote?.price || 0;
      const dayChange = quote?.change || 0;
      const dayChangePercent = quote?.changePercent || 0;

      const shares = Number(holding.shares);
      const costBasis = Number(holding.costBasis);
      const currentValue = shares * currentPrice;
      const totalCost_holding = shares * costBasis;
      const gainLoss = currentValue - totalCost_holding;
      const gainLossPercent = totalCost_holding > 0 ? (gainLoss / totalCost_holding) * 100 : 0;
      const dayChangeValue = shares * dayChange;

      totalValue += currentValue;
      totalCost += totalCost_holding;
      totalDayChange += dayChangeValue;

      return {
        id: holding.id,
        portfolioId: holding.portfolioId,
        ticker: holding.ticker,
        name: holding.ticker, // Will be enriched later
        shares,
        costBasis,
        currentPrice,
        currentValue,
        gainLoss,
        gainLossPercent,
        dayChange: dayChangeValue,
        dayChangePercent,
        allocation: 0, // Will be calculated after
        purchaseDate: holding.purchaseDate,
        notes: holding.notes || undefined,
      };
    });

    // Calculate allocation percentages
    enrichedHoldings.forEach((holding) => {
      holding.allocation = totalValue > 0 ? (holding.currentValue / totalValue) * 100 : 0;
    });

    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
    const dayChangePercent = totalValue > 0 ? (totalDayChange / totalValue) * 100 : 0;

    return {
      id: portfolio.id,
      userId: portfolio.userId,
      name: portfolio.name,
      description: portfolio.description || undefined,
      holdings: enrichedHoldings,
      totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPercent,
      dayChange: totalDayChange,
      dayChangePercent,
      createdAt: portfolio.createdAt,
      updatedAt: portfolio.updatedAt,
    };
  }

  /**
   * Calculate portfolio allocation by sector, asset class, etc.
   */
  async calculateAllocation(portfolioId: string): Promise<AllocationData> {
    const portfolio = await this.calculatePortfolioValue(portfolioId);

    // Sector mapping (simplified - in production, fetch from data service)
    const sectorMap: Record<string, string> = {
      AAPL: 'Technology',
      MSFT: 'Technology',
      GOOGL: 'Technology',
      NVDA: 'Technology',
      TSLA: 'Automotive',
      JNJ: 'Healthcare',
      UNH: 'Healthcare',
      JPM: 'Finance',
      BAC: 'Finance',
      XOM: 'Energy',
      CVX: 'Energy',
      PG: 'Consumer Goods',
      KO: 'Consumer Goods',
    };

    // Group by sector
    const sectorTotals = new Map<string, number>();
    portfolio.holdings.forEach((holding) => {
      const sector = sectorMap[holding.ticker] || 'Other';
      sectorTotals.set(sector, (sectorTotals.get(sector) || 0) + holding.currentValue);
    });

    const bySector: AllocationItem[] = Array.from(sectorTotals.entries()).map(([name, value]) => ({
      name,
      value,
      percentage: (value / portfolio.totalValue) * 100,
    })).sort((a, b) => b.value - a.value);

    // Top holdings
    const topHoldings: AllocationItem[] = portfolio.holdings
      .sort((a, b) => b.currentValue - a.currentValue)
      .slice(0, 10)
      .map((h) => ({
        name: h.ticker,
        value: h.currentValue,
        percentage: h.allocation,
      }));

    // Calculate concentration metrics
    const sortedValues = portfolio.holdings
      .map((h) => h.currentValue)
      .sort((a, b) => b - a);

    const top5 = sortedValues.slice(0, 5).reduce((sum, v) => sum + v, 0);
    const top10 = sortedValues.slice(0, 10).reduce((sum, v) => sum + v, 0);

    // Herfindahl Index (sum of squared market shares)
    const herfindahlIndex = portfolio.holdings.reduce(
      (sum, h) => sum + Math.pow(h.allocation / 100, 2),
      0
    );

    return {
      bySector,
      byAssetClass: [{ name: 'Equities', value: portfolio.totalValue, percentage: 100 }],
      byMarketCap: [],
      byCountry: [{ name: 'United States', value: portfolio.totalValue, percentage: 100 }],
      topHoldings,
      concentration: {
        top5: (top5 / portfolio.totalValue) * 100,
        top10: (top10 / portfolio.totalValue) * 100,
        herfindahlIndex,
      },
    };
  }

  /**
   * Calculate performance metrics (Sharpe ratio, max drawdown, etc.)
   */
  async calculatePerformance(
    portfolioId: string,
    startDate: Date,
    endDate: Date
  ): Promise<PerformanceMetrics> {
    const snapshots = await prisma.portfolioSnapshot.findMany({
      where: {
        portfolioId,
        snapshotDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { snapshotDate: 'asc' },
    });

    if (snapshots.length < 2) {
      throw new Error('Insufficient data for performance calculation');
    }

    const values = snapshots.map((s) => Number(s.totalValue));
    const returns = this.calculateReturns(values);

    const totalReturn = values[values.length - 1] - values[0];
    const totalReturnPercent = (totalReturn / values[0]) * 100;

    // Annualized return
    const years = (endDate.getTime() - startDate.getTime()) / (365 * 24 * 60 * 60 * 1000);
    const annualizedReturn = Math.pow(values[values.length - 1] / values[0], 1 / years) - 1;

    // Sharpe ratio (assuming 2% risk-free rate)
    const sharpeRatio = this.calculateSharpeRatio(returns, 0.02 / 252); // Daily risk-free rate

    // Max drawdown
    const { maxDrawdown, maxDrawdownPercent } = this.calculateMaxDrawdown(values);

    // Volatility (standard deviation of returns)
    const volatility = this.calculateStdDev(returns) * Math.sqrt(252); // Annualized

    // Win rate
    const winningDays = returns.filter((r) => r > 0).length;
    const winRate = returns.length > 0 ? (winningDays / returns.length) * 100 : 0;

    // Best and worst days
    const bestDay = Math.max(...returns, 0);
    const worstDay = Math.min(...returns, 0);

    return {
      totalReturn,
      totalReturnPercent,
      annualizedReturn: annualizedReturn * 100,
      sharpeRatio,
      maxDrawdown,
      maxDrawdownPercent,
      winRate,
      bestDay: bestDay * 100,
      worstDay: worstDay * 100,
      volatility: volatility * 100,
    };
  }

  /**
   * Get historical performance data for charting
   */
  async getHistoricalPerformance(
    portfolioId: string,
    startDate: Date,
    endDate: Date,
    benchmark?: string
  ): Promise<ChartDataPoint[]> {
    const snapshots = await prisma.portfolioSnapshot.findMany({
      where: {
        portfolioId,
        snapshotDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { snapshotDate: 'asc' },
    });

    const chartData: ChartDataPoint[] = snapshots.map((s) => ({
      date: s.snapshotDate.toISOString().split('T')[0],
      value: Number(s.totalValue),
    }));

    // Fetch benchmark data if requested
    if (benchmark && chartData.length > 0) {
      try {
        const benchmarkHistory = await yahooFinanceService.getHistory(
          benchmark,
          startDate,
          endDate,
          '1d'
        );

        const benchmarkMap = new Map(
          benchmarkHistory.map((b) => [b.date.split('T')[0], b.close])
        );

        // Normalize benchmark to portfolio starting value
        const firstBenchmarkPrice = benchmarkHistory[0]?.close || 1;
        const portfolioStartValue = chartData[0]?.value || 1;

        chartData.forEach((point) => {
          const benchmarkPrice = benchmarkMap.get(point.date);
          if (benchmarkPrice) {
            point.benchmark = (benchmarkPrice / firstBenchmarkPrice) * portfolioStartValue;
          }
        });
      } catch (error) {
        console.error('Failed to fetch benchmark data:', error);
      }
    }

    return chartData;
  }

  /**
   * Add a transaction and update holdings
   */
  async addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    const created = await prisma.transaction.create({
      data: {
        portfolioId: transaction.portfolioId,
        ticker: transaction.ticker,
        type: transaction.type,
        shares: transaction.shares,
        price: transaction.price,
        fees: transaction.fees,
        transactionDate: transaction.transactionDate,
        notes: transaction.notes,
      },
    });

    // Update holdings
    await this.updateHoldingsFromTransaction(transaction);

    return {
      id: created.id,
      portfolioId: created.portfolioId,
      ticker: created.ticker,
      type: created.type as 'buy' | 'sell',
      shares: Number(created.shares),
      price: Number(created.price),
      fees: Number(created.fees),
      transactionDate: created.transactionDate,
      notes: created.notes || undefined,
      createdAt: created.createdAt,
    };
  }

  /**
   * Update holdings based on transaction
   */
  private async updateHoldingsFromTransaction(
    transaction: Omit<Transaction, 'id' | 'createdAt'>
  ): Promise<void> {
    const existingHolding = await prisma.holding.findFirst({
      where: {
        portfolioId: transaction.portfolioId,
        ticker: transaction.ticker,
      },
    });

    if (transaction.type === 'buy') {
      if (existingHolding) {
        // Update existing holding with weighted average cost basis
        const totalShares = Number(existingHolding.shares) + transaction.shares;
        const totalCost =
          Number(existingHolding.shares) * Number(existingHolding.costBasis) +
          transaction.shares * transaction.price;
        const newCostBasis = totalCost / totalShares;

        await prisma.holding.update({
          where: { id: existingHolding.id },
          data: {
            shares: totalShares,
            costBasis: newCostBasis,
          },
        });
      } else {
        // Create new holding
        await prisma.holding.create({
          data: {
            portfolioId: transaction.portfolioId,
            ticker: transaction.ticker,
            shares: transaction.shares,
            costBasis: transaction.price,
            purchaseDate: transaction.transactionDate,
          },
        });
      }
    } else if (transaction.type === 'sell') {
      if (existingHolding) {
        const newShares = Number(existingHolding.shares) - transaction.shares;

        if (newShares <= 0) {
          // Remove holding if all shares sold
          await prisma.holding.delete({
            where: { id: existingHolding.id },
          });
        } else {
          // Update shares
          await prisma.holding.update({
            where: { id: existingHolding.id },
            data: { shares: newShares },
          });
        }
      }
    }
  }

  /**
   * Get realized gains from closed positions
   */
  async getRealizedGains(portfolioId: string): Promise<number> {
    const transactions = await prisma.transaction.findMany({
      where: { portfolioId },
      orderBy: { transactionDate: 'asc' },
    });

    let realizedGains = 0;
    const positions = new Map<string, { shares: number; costBasis: number }>();

    for (const tx of transactions) {
      const ticker = tx.ticker;
      const pos = positions.get(ticker) || { shares: 0, costBasis: 0 };

      if (tx.type === 'buy') {
        const totalCost = pos.shares * pos.costBasis + Number(tx.shares) * Number(tx.price);
        const totalShares = pos.shares + Number(tx.shares);
        positions.set(ticker, {
          shares: totalShares,
          costBasis: totalCost / totalShares,
        });
      } else if (tx.type === 'sell') {
        const costBasis = pos.costBasis;
        const gainLoss = (Number(tx.price) - costBasis) * Number(tx.shares) - Number(tx.fees);
        realizedGains += gainLoss;

        positions.set(ticker, {
          shares: pos.shares - Number(tx.shares),
          costBasis: pos.costBasis,
        });
      }
    }

    return realizedGains;
  }

  /**
   * Create daily snapshot of portfolio
   */
  async createSnapshot(portfolioId: string, date: Date): Promise<void> {
    const portfolio = await this.calculatePortfolioValue(portfolioId);

    const holdingsSnapshot = portfolio.holdings.map((h) => ({
      ticker: h.ticker,
      shares: h.shares,
      price: h.currentPrice,
      value: h.currentValue,
    }));

    await prisma.portfolioSnapshot.upsert({
      where: {
        portfolioId_snapshotDate: {
          portfolioId,
          snapshotDate: date,
        },
      },
      create: {
        portfolioId,
        totalValue: portfolio.totalValue,
        totalGainLoss: portfolio.totalGainLoss,
        snapshotDate: date,
        holdings: holdingsSnapshot,
      },
      update: {
        totalValue: portfolio.totalValue,
        totalGainLoss: portfolio.totalGainLoss,
        holdings: holdingsSnapshot,
      },
    });
  }

  // Helper methods for calculations

  private calculateReturns(values: number[]): number[] {
    const returns: number[] = [];
    for (let i = 1; i < values.length; i++) {
      returns.push((values[i] - values[i - 1]) / values[i - 1]);
    }
    return returns;
  }

  private calculateSharpeRatio(returns: number[], riskFreeRate: number = 0): number {
    if (returns.length === 0) return 0;

    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const stdDev = this.calculateStdDev(returns);

    if (stdDev === 0) return 0;

    return (avgReturn - riskFreeRate) / stdDev;
  }

  private calculateMaxDrawdown(values: number[]): {
    maxDrawdown: number;
    maxDrawdownPercent: number;
  } {
    let maxDrawdown = 0;
    let maxDrawdownPercent = 0;
    let peak = values[0];

    for (const value of values) {
      if (value > peak) peak = value;
      const drawdown = peak - value;
      const drawdownPercent = peak > 0 ? (drawdown / peak) * 100 : 0;

      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
        maxDrawdownPercent = drawdownPercent;
      }
    }

    return { maxDrawdown, maxDrawdownPercent };
  }

  private calculateStdDev(values: number[]): number {
    if (values.length === 0) return 0;

    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map((v) => Math.pow(v - avg, 2));
    const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;

    return Math.sqrt(variance);
  }

  private calculateCAGR(startValue: number, endValue: number, years: number): number {
    return Math.pow(endValue / startValue, 1 / years) - 1;
  }
}

export const portfolioManager = new PortfolioManager();
