import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { screenerService } from '@/lib/screener-service';
import { MOCK_STOCKS } from '@/lib/mock-stocks';

export const dynamic = 'force-dynamic';

// POST - Update the screener cache (admin only or scheduled job)
export async function POST(request: NextRequest) {
  try {
    // Check authorization (in production, verify admin role or API key)
    const { userId } = await auth();
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Allow either authenticated admin or cron job with secret
    const isAuthorized = userId || (authHeader === `Bearer ${cronSecret}` && cronSecret);

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, we'll update cache with mock data
    // In production, fetch from real data sources (Yahoo Finance, Alpha Vantage, etc.)
    const stocksToCache = MOCK_STOCKS.map((stock) => ({
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

    // Update the cache
    await screenerService.updateCache(stocksToCache);

    return NextResponse.json({
      success: true,
      message: 'Cache updated successfully',
      stocks_updated: stocksToCache.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating cache:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get cache status
export async function GET(request: NextRequest) {
  try {
    const cacheAge = await screenerService.getCacheAge();

    return NextResponse.json({
      cache_age_minutes: cacheAge,
      last_updated: cacheAge !== null ? `${cacheAge} minutes ago` : 'Never',
      is_stale: cacheAge !== null && cacheAge > 60, // Consider stale after 1 hour
    });
  } catch (error) {
    console.error('Error getting cache status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
