import { NextResponse } from 'next/server';
import { YahooFinanceService } from '@/lib/yahoo-finance-service';
import { Redis } from '@upstash/redis';

// Initialize Redis with error handling
let redis: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    if (url.startsWith('https://') && url.includes('upstash.io')) {
      redis = Redis.fromEnv();
    }
  }
} catch (error) {
  console.warn('Redis initialization failed:', error);
}

const CACHE_TTL = 5; // 5 seconds

export async function GET(
  request: Request,
  { params }: { params: { ticker: string } }
) {
  try {
    const ticker = params.ticker.toUpperCase();
    const cacheKey = `stock:${ticker}`;

    // Try cache first (if Redis is available)
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    // Fetch from Yahoo Finance
    const quote = await YahooFinanceService.getQuote(ticker);
    const details = await YahooFinanceService.getStockDetails(ticker);

    const response = {
      ticker: quote.symbol,
      name: details.shortName || details.longName || ticker,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      volume: quote.regularMarketVolume,
      marketCap: details.marketCap || 0,
      open: quote.regularMarketOpen,
      high: quote.regularMarketDayHigh,
      low: quote.regularMarketDayLow,
      previousClose: quote.regularMarketPreviousClose,
      isLive: true,
      lastUpdate: Date.now(),
    };

    // Cache for 5 seconds (if Redis is available)
    if (redis) {
      await redis.setex(cacheKey, CACHE_TTL, response);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}
