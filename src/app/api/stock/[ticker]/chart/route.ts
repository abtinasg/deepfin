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
const CACHE_TTL = 30; // 30 seconds for chart data

export async function GET(
  request: Request,
  context: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker: tickerParam } = await context.params;
    const ticker = tickerParam.toUpperCase();
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '1Y';

    const cacheKey = `stock:chart:${ticker}:${timeframe}`;

    // Try cache first (if Redis is available)
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    // Map timeframe to Yahoo Finance range
    const rangeMap: Record<string, string> = {
      '1D': '1d',
      '1W': '5d',
      '1M': '1mo',
      '3M': '3mo',
      '1Y': '1y',
      'ALL': 'max',
    };

    const range = rangeMap[timeframe] || '1y';
    const interval = timeframe === '1D' ? '5m' : timeframe === '1W' ? '30m' : '1d';

    const chartData = await YahooFinanceService.getChartData(ticker, range, interval);

    const response = {
      ticker,
      timeframe,
      data: chartData.map((candle) => ({
        timestamp: candle.time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume,
      })),
    };

    // Cache chart data (if Redis is available)
    if (redis) {
      await redis.setex(cacheKey, CACHE_TTL, response);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    );
  }
}
