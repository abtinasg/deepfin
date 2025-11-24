/**
 * Yahoo Finance API Service
 * 
 * Yahoo Finance provides free, reliable market data without requiring an API key.
 * This is often the best choice for real-time stock data.
 * 
 * API Endpoints:
 * - Chart Data: query1.finance.yahoo.com/v8/finance/chart/{symbol}
 * - Quote: query1.finance.yahoo.com/v7/finance/quote
 * - Search: query1.finance.yahoo.com/v1/finance/search
 */

export interface YahooQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketOpen: number;
  regularMarketPreviousClose: number;
  regularMarketTime: number;
}

export interface YahooSearchResult {
  symbol: string;
  name: string;
  exchDisp: string;
  typeDisp: string;
}

export class YahooFinanceService {
  private static BASE_URL = 'https://query1.finance.yahoo.com';
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static CACHE_TTL = 30000; // 30 seconds

  /**
   * Fetch quote data for a symbol
   */
  static async getQuote(symbol: string): Promise<YahooQuote> {
    const cacheKey = `quote:${symbol}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.BASE_URL}/v8/finance/chart/${symbol}?interval=1d&range=1d`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DeepFin/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`Yahoo Finance API error: ${response.status}`);
      }

      const data = await response.json();
      const result = data.chart?.result?.[0];
      
      if (!result) {
        throw new Error('No data available');
      }

      const meta = result.meta;
      const quote = result.indicators?.quote?.[0];

      const regularMarketPrice = meta.regularMarketPrice || meta.previousClose || 0;
      const previousClose = meta.previousClose || meta.chartPreviousClose || 0;
      const regularMarketChange = regularMarketPrice - previousClose;
      const regularMarketChangePercent = previousClose > 0 
        ? (regularMarketChange / previousClose) * 100 
        : 0;

      const lastIndex = quote?.close?.length - 1 || 0;

      const yahooQuote: YahooQuote = {
        symbol: symbol.toUpperCase(),
        regularMarketPrice,
        regularMarketChange,
        regularMarketChangePercent,
        regularMarketVolume: quote?.volume?.[lastIndex] || 0,
        regularMarketDayHigh: quote?.high?.[lastIndex] || meta.regularMarketDayHigh || 0,
        regularMarketDayLow: quote?.low?.[lastIndex] || meta.regularMarketDayLow || 0,
        regularMarketOpen: quote?.open?.[lastIndex] || meta.regularMarketOpen || 0,
        regularMarketPreviousClose: previousClose,
        regularMarketTime: meta.regularMarketTime || Math.floor(Date.now() / 1000),
      };

      this.setCache(cacheKey, yahooQuote);
      return yahooQuote;
    } catch (error) {
      console.error(`[YahooFinance] Error fetching ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Fetch quotes for multiple symbols at once
   */
  static async getQuotes(symbols: string[]): Promise<YahooQuote[]> {
    // Yahoo allows batch quotes but we'll do individual for simplicity
    const promises = symbols.map(symbol => this.getQuote(symbol));
    const results = await Promise.allSettled(promises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<YahooQuote> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);
  }

  /**
   * Search for stocks
   */
  static async search(query: string): Promise<YahooSearchResult[]> {
    if (!query || query.length < 1) return [];

    const cacheKey = `search:${query}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.BASE_URL}/v1/finance/search?q=${encodeURIComponent(query)}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DeepFin/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`Yahoo Finance API error: ${response.status}`);
      }

      const data = await response.json();
      const quotes = data.quotes || [];

      const results: YahooSearchResult[] = quotes
        .filter((q: any) => q.symbol && q.shortname)
        .slice(0, 10)
        .map((q: any) => ({
          symbol: q.symbol,
          name: q.shortname || q.longname || q.symbol,
          exchDisp: q.exchDisp || q.exchange || '',
          typeDisp: q.typeDisp || q.quoteType || '',
        }));

      this.setCache(cacheKey, results);
      return results;
    } catch (error) {
      console.error('[YahooFinance] Search error:', error);
      return [];
    }
  }

  /**
   * Get historical data
   */
  static async getHistoricalData(
    symbol: string,
    range: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '5y' = '1mo',
    interval: '1m' | '5m' | '15m' | '1h' | '1d' | '1wk' | '1mo' = '1d'
  ): Promise<any[]> {
    try {
      const url = `${this.BASE_URL}/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DeepFin/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`Yahoo Finance API error: ${response.status}`);
      }

      const data = await response.json();
      const result = data.chart?.result?.[0];
      
      if (!result) {
        throw new Error('No historical data available');
      }

      const timestamps = result.timestamp || [];
      const quote = result.indicators?.quote?.[0];

      if (!quote) {
        throw new Error('No quote data in historical response');
      }

      return timestamps.map((timestamp: number, i: number) => ({
        timestamp: timestamp * 1000,
        open: quote.open?.[i] || 0,
        high: quote.high?.[i] || 0,
        low: quote.low?.[i] || 0,
        close: quote.close?.[i] || 0,
        volume: quote.volume?.[i] || 0,
      }));
    } catch (error) {
      console.error('[YahooFinance] Historical data error:', error);
      throw error;
    }
  }

  /**
   * Get chart data for trading charts
   */
  static async getChartData(
    symbol: string,
    range: string = '1y',
    interval: string = '1d'
  ): Promise<Array<{
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>> {
    try {
      const url = `${this.BASE_URL}/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DeepFin/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`Yahoo Finance API error: ${response.status}`);
      }

      const data = await response.json();
      const result = data.chart?.result?.[0];
      
      if (!result) {
        throw new Error('No chart data available');
      }

      const timestamps = result.timestamp || [];
      const quote = result.indicators?.quote?.[0];

      if (!quote) {
        throw new Error('No quote data in chart response');
      }

      return timestamps.map((timestamp: number, i: number) => ({
        time: timestamp,
        open: quote.open?.[i] || 0,
        high: quote.high?.[i] || 0,
        low: quote.low?.[i] || 0,
        close: quote.close?.[i] || 0,
        volume: quote.volume?.[i] || 0,
      })).filter((candle: any) => candle.close > 0);
    } catch (error) {
      console.error('[YahooFinance] Chart data error:', error);
      throw error;
    }
  }

  /**
   * Get detailed stock information
   */
  static async getStockDetails(symbol: string): Promise<{
    shortName: string;
    longName: string;
    marketCap: number;
    sharesOutstanding: number;
    bookValue: number;
    priceToBook: number;
    currency: string;
    fiftyTwoWeekLow: number;
    fiftyTwoWeekHigh: number;
    fiftyDayAverage: number;
    twoHundredDayAverage: number;
    averageDailyVolume10Day: number;
    averageDailyVolume3Month: number;
    trailingPE: number | null;
    forwardPE: number | null;
    dividendYield: number | null;
    beta: number | null;
    epsTrailingTwelveMonths: number | null;
    revenuePerShare: number | null;
  }> {
    try {
      const url = `${this.BASE_URL}/v8/finance/chart/${symbol}?range=1d&interval=1d`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DeepFin/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`Yahoo Finance API error: ${response.status}`);
      }

      const data = await response.json();
      const result = data.chart?.result?.[0];
      const meta = result?.meta || {};

      // Fetch additional details from quoteSummary
      let detailsData: any = {};
      try {
        const detailsUrl = `${this.BASE_URL}/v10/finance/quoteSummary/${symbol}?modules=summaryDetail,defaultKeyStatistics,financialData`;
        const detailsResponse = await fetch(detailsUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; DeepFin/1.0)',
          },
        });

        if (detailsResponse.ok) {
          const details = await detailsResponse.json();
          const summary = details.quoteSummary?.result?.[0];
          detailsData = {
            ...summary?.summaryDetail,
            ...summary?.defaultKeyStatistics,
            ...summary?.financialData,
          };
        }
      } catch (err) {
        console.log('Could not fetch detailed data, using basic info');
      }

      return {
        shortName: meta.shortName || meta.symbol || symbol,
        longName: meta.longName || meta.shortName || symbol,
        marketCap: detailsData.marketCap?.raw || meta.marketCap || 0,
        sharesOutstanding: detailsData.sharesOutstanding?.raw || 0,
        bookValue: detailsData.bookValue?.raw || 0,
        priceToBook: detailsData.priceToBook?.raw || 0,
        currency: meta.currency || 'USD',
        fiftyTwoWeekLow: detailsData.fiftyTwoWeekLow?.raw || meta.fiftyTwoWeekLow || 0,
        fiftyTwoWeekHigh: detailsData.fiftyTwoWeekHigh?.raw || meta.fiftyTwoWeekHigh || 0,
        fiftyDayAverage: detailsData.fiftyDayAverage?.raw || 0,
        twoHundredDayAverage: detailsData.twoHundredDayAverage?.raw || 0,
        averageDailyVolume10Day: detailsData.averageDailyVolume10Day?.raw || 0,
        averageDailyVolume3Month: detailsData.averageDailyVolume3Month?.raw || 0,
        trailingPE: detailsData.trailingPE?.raw || null,
        forwardPE: detailsData.forwardPE?.raw || null,
        dividendYield: detailsData.dividendYield?.raw || null,
        beta: detailsData.beta?.raw || null,
        epsTrailingTwelveMonths: detailsData.epsTrailingTwelveMonths?.raw || null,
        revenuePerShare: detailsData.revenuePerShare?.raw || null,
      };
    } catch (error) {
      console.error('[YahooFinance] Stock details error:', error);
      throw error;
    }
  }

  /**
   * Get market summary (indices)
   */
  static async getMarketSummary(): Promise<YahooQuote[]> {
    const indices = ['^GSPC', '^DJI', '^IXIC', '^RUT', '^VIX'];
    return this.getQuotes(indices);
  }

  private static getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  private static setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  static clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const yahooFinanceService = YahooFinanceService;
