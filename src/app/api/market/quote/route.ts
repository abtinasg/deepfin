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
        // Fetch from Finnhub API
        const apiKey = process.env.FINNHUB_API_KEY;
        if (!apiKey) {
          throw new Error('FINNHUB_API_KEY not configured');
        }

        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${symbol.toUpperCase()}&token=${apiKey}`
        );

        if (!response.ok) {
          throw new Error(`Finnhub API error: ${response.status}`);
        }

        const data = await response.json();

        return {
          symbol: symbol.toUpperCase(),
          price: data.c || 0, // current price
          change: data.d || 0, // change
          changePercent: data.dp || 0, // percent change
          volume: 0, // Finnhub quote doesn't include volume
          high: data.h || 0,
          low: data.l || 0,
          open: data.o || 0,
          previousClose: data.pc || 0,
          timestamp: new Date(data.t * 1000).toISOString(),
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
