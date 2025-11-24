import { NextRequest, NextResponse } from 'next/server';

/**
 * Yahoo Finance Chart Proxy - Historical data with intervals
 * GET /api/yahoo-proxy/chart?symbol=AAPL&interval=5m&range=5d
 *
 * Intervals: 1m, 5m, 15m, 1h, 1d, 1wk, 1mo
 * Ranges: 1d, 5d, 1mo, 3mo, 6mo, 1y, 5y, max
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const interval = searchParams.get('interval') || '1d';
    const range = searchParams.get('range') || '5d';

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    // Validate interval
    const validIntervals = ['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo', '3mo'];
    if (!validIntervals.includes(interval)) {
      return NextResponse.json(
        { error: `Invalid interval. Valid options: ${validIntervals.join(', ')}` },
        { status: 400 }
      );
    }

    // Yahoo Finance chart endpoint
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];

    if (!result) {
      return NextResponse.json(
        { error: 'No data available for this symbol' },
        { status: 404 }
      );
    }

    // Format the response
    const meta = result.meta;
    const timestamps = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0] || {};

    const formattedData = {
      meta: {
        symbol: meta.symbol,
        currency: meta.currency,
        exchangeName: meta.exchangeName,
        regularMarketPrice: meta.regularMarketPrice,
        regularMarketTime: meta.regularMarketTime,
        previousClose: meta.previousClose || meta.chartPreviousClose,
        dataGranularity: meta.dataGranularity,
        range: meta.range,
      },
      timestamps,
      quotes: {
        open: quotes.open || [],
        high: quotes.high || [],
        low: quotes.low || [],
        close: quotes.close || [],
        volume: quotes.volume || [],
      },
    };

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Yahoo Finance chart proxy error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch chart data from Yahoo Finance'
      },
      { status: 500 }
    );
  }
}
