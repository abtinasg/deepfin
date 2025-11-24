import { prisma } from '@/lib/prisma';
import { MOCK_STOCKS } from '@/lib/mock-stocks';
import {
  ScreenerFilters,
  ScreenerSort,
  ScreenerCacheData,
  ScreenerStockResult,
} from '@/types/screener-api';

export class ScreenerService {
  /**
   * Get all stocks from cache, with fallback to mock data
   */
  async getAllStocks(): Promise<ScreenerCacheData[]> {
    try {
      const cached = await prisma.screenerCache.findMany();
      
      if (cached.length > 0) {
        return cached.map((item) => item.data as unknown as ScreenerCacheData);
      }

      // Fallback to mock data
      return this.convertMockToCache();
    } catch (error) {
      console.error('Error fetching from cache:', error);
      return this.convertMockToCache();
    }
  }

  /**
   * Convert mock stocks to cache format
   */
  private convertMockToCache(): ScreenerCacheData[] {
    return MOCK_STOCKS.map((stock) => ({
      ticker: stock.ticker,
      name: stock.name,
      price: stock.price,
      change: stock.change,
      change_percent: stock.changePercent,
      market_cap: stock.marketCap,
      pe_ratio: stock.pe,
      dividend_yield: stock.dividend,
      rsi: stock.rsi,
      volume: stock.volume,
      sector: stock.sector,
      fifty_two_week_high: stock.fiftyTwoWeekHigh,
      fifty_two_week_low: stock.fiftyTwoWeekLow,
      above_50ma: stock.aboveFiftyDayMA,
      above_200ma: stock.aboveTwoHundredDayMA,
      macd_signal: stock.macdSignal,
    }));
  }

  /**
   * Apply filters to stock data
   */
  applyFilters(stocks: ScreenerCacheData[], filters: ScreenerFilters): ScreenerCacheData[] {
    let results = [...stocks];

    // Market Cap filter
    if (filters.market_cap) {
      if (filters.market_cap.min !== undefined) {
        results = results.filter((s) => s.market_cap >= filters.market_cap!.min!);
      }
      if (filters.market_cap.max !== undefined) {
        results = results.filter((s) => s.market_cap <= filters.market_cap!.max!);
      }
    }

    // P/E Ratio filter
    if (filters.pe_ratio) {
      if (filters.pe_ratio.min !== undefined) {
        results = results.filter((s) => s.pe_ratio !== null && s.pe_ratio >= filters.pe_ratio!.min!);
      }
      if (filters.pe_ratio.max !== undefined) {
        results = results.filter((s) => s.pe_ratio !== null && s.pe_ratio <= filters.pe_ratio!.max!);
      }
    }

    // Price filter
    if (filters.price) {
      if (filters.price.min !== undefined) {
        results = results.filter((s) => s.price >= filters.price!.min!);
      }
      if (filters.price.max !== undefined) {
        results = results.filter((s) => s.price <= filters.price!.max!);
      }
    }

    // Dividend Yield filter
    if (filters.dividend_yield) {
      if (filters.dividend_yield.min !== undefined) {
        results = results.filter(
          (s) => s.dividend_yield !== null && s.dividend_yield >= filters.dividend_yield!.min!
        );
      }
      if (filters.dividend_yield.max !== undefined) {
        results = results.filter(
          (s) => s.dividend_yield !== null && s.dividend_yield <= filters.dividend_yield!.max!
        );
      }
    }

    // Volume filter
    if (filters.volume) {
      if (filters.volume.min !== undefined) {
        results = results.filter((s) => s.volume >= filters.volume!.min!);
      }
      if (filters.volume.max !== undefined) {
        results = results.filter((s) => s.volume <= filters.volume!.max!);
      }
    }

    // RSI filter
    if (filters.rsi) {
      if (filters.rsi.min !== undefined) {
        results = results.filter((s) => s.rsi !== null && s.rsi >= filters.rsi!.min!);
      }
      if (filters.rsi.max !== undefined) {
        results = results.filter((s) => s.rsi !== null && s.rsi <= filters.rsi!.max!);
      }
    }

    // Sector filter
    if (filters.sector && filters.sector.length > 0) {
      results = results.filter((s) => filters.sector!.includes(s.sector));
    }

    // Moving Average filters
    if (filters.above_50ma === true) {
      results = results.filter((s) => s.above_50ma === true);
    }
    if (filters.above_200ma === true) {
      results = results.filter((s) => s.above_200ma === true);
    }

    // MACD Signal filter
    if (filters.macd_signal) {
      results = results.filter((s) => s.macd_signal === filters.macd_signal);
    }

    return results;
  }

  /**
   * Sort stock data
   */
  sortStocks(stocks: ScreenerCacheData[], sort?: ScreenerSort): ScreenerCacheData[] {
    if (!sort) {
      return stocks;
    }

    const sorted = [...stocks];
    const { field, order } = sort;

    sorted.sort((a, b) => {
      let aVal: any = a[field as keyof ScreenerCacheData];
      let bVal: any = b[field as keyof ScreenerCacheData];

      // Handle null values
      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return sorted;
  }

  /**
   * Paginate results
   */
  paginate<T>(items: T[], limit: number = 100, offset: number = 0): T[] {
    return items.slice(offset, offset + limit);
  }

  /**
   * Main query method
   */
  async query(
    filters: ScreenerFilters,
    sort?: ScreenerSort,
    limit: number = 100,
    offset: number = 0
  ): Promise<{ total: number; results: ScreenerStockResult[]; cached: boolean }> {
    const startTime = Date.now();

    // Get all stocks
    const allStocks = await this.getAllStocks();

    // Apply filters
    const filtered = this.applyFilters(allStocks, filters);

    // Sort
    const sorted = this.sortStocks(filtered, sort);

    // Paginate
    const paginated = this.paginate(sorted, limit, offset);

    // Convert to result format
    const results: ScreenerStockResult[] = paginated.map((stock) => ({
      ticker: stock.ticker,
      name: stock.name,
      price: stock.price,
      change: stock.change,
      change_percent: stock.change_percent,
      market_cap: stock.market_cap,
      pe_ratio: stock.pe_ratio,
      dividend_yield: stock.dividend_yield,
      rsi: stock.rsi,
      volume: stock.volume,
      sector: stock.sector,
      fifty_two_week_high: stock.fifty_two_week_high,
      fifty_two_week_low: stock.fifty_two_week_low,
      above_50ma: stock.above_50ma,
      above_200ma: stock.above_200ma,
      macd_signal: stock.macd_signal,
    }));

    return {
      total: filtered.length,
      results,
      cached: false,
    };
  }

  /**
   * Update cache with fresh data
   */
  async updateCache(stocks: ScreenerCacheData[]): Promise<void> {
    try {
      // Delete old cache
      await prisma.screenerCache.deleteMany();

      // Insert new data
      const operations = stocks.map((stock) =>
        prisma.screenerCache.create({
          data: {
            ticker: stock.ticker,
            data: stock as any,
          },
        })
      );

      await Promise.all(operations);
      console.log(`Updated cache with ${stocks.length} stocks`);
    } catch (error) {
      console.error('Error updating cache:', error);
      throw error;
    }
  }

  /**
   * Get cache age in minutes
   */
  async getCacheAge(): Promise<number | null> {
    try {
      const latest = await prisma.screenerCache.findFirst({
        orderBy: { updatedAt: 'desc' },
      });

      if (!latest) return null;

      const now = new Date();
      const updated = new Date(latest.updatedAt);
      return Math.floor((now.getTime() - updated.getTime()) / 1000 / 60);
    } catch (error) {
      console.error('Error getting cache age:', error);
      return null;
    }
  }
}

export const screenerService = new ScreenerService();
