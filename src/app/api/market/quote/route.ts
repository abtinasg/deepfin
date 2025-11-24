import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getCachedData } from '@/lib/redis';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    const cacheKey = `quote:${symbol.toUpperCase()}`;

    const quote = await getCachedData(
      cacheKey,
      async () => {
        // In production, this would fetch from a market data API
        // For now, return mock data
        return {
          symbol: symbol.toUpperCase(),
          price: 178.45,
          change: 2.34,
          changePercent: 1.33,
          volume: 45678900,
          high: 180.12,
          low: 176.23,
          open: 176.89,
          previousClose: 176.11,
          timestamp: new Date().toISOString(),
        };
      },
      60 // Cache for 60 seconds
    );

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
