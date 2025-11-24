import { NextRequest, NextResponse } from 'next/server';

/**
 * Yahoo Finance Proxy - Avoid CORS issues
 * This endpoint proxies requests to Yahoo Finance API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DeepFin/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();

    // Return the raw Yahoo Finance response
    return NextResponse.json(data);
  } catch (error) {
    console.error('Yahoo Finance proxy error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch from Yahoo Finance'
      },
      { status: 500 }
    );
  }
}
