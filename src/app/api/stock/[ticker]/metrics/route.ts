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
const CACHE_TTL = 60; // 1 minute for metrics

export async function GET(
  request: Request,
  { params }: { params: { ticker: string } }
) {
  try {
    const ticker = params.ticker.toUpperCase();
    const cacheKey = `metrics:${ticker}`;

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
      marketCap: details.marketCap || 0,
      peRatio: details.trailingPE || null,
      eps: details.epsTrailingTwelveMonths || null,
      dividendYield: details.dividendYield || null,
      week52High: details.fiftyTwoWeekHigh || 0,
      week52Low: details.fiftyTwoWeekLow || 0,
      volume: quote.regularMarketVolume,
      avgVolume: details.averageDailyVolume3Month || 0,
      beta: details.beta || null,
      revenue: details.revenuePerShare || null,
    };

    // Cache metrics (if Redis is available)
    if (redis) {
      await redis.setex(cacheKey, CACHE_TTL, response);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching stock metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock metrics' },
      { status: 500 }
    );
  }
}
