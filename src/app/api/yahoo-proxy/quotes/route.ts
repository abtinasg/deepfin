import { NextRequest, NextResponse } from 'next/server';

/**
 * Yahoo Finance Quotes Proxy - Batch fetch multiple symbols
 * GET /api/yahoo-proxy/quotes?symbols=AAPL,MSFT,GOOGL
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');

    if (!symbolsParam) {
      return NextResponse.json(
        { error: 'Symbols parameter is required' },
        { status: 400 }
      );
    }

    const symbols = symbolsParam.split(',').map(s => s.trim()).filter(Boolean);

    if (symbols.length === 0) {
      return NextResponse.json(
        { error: 'At least one symbol is required' },
        { status: 400 }
      );
    }

    // Yahoo Finance quote endpoint
    const url = `https://query1.finance.yahoo.com/v6/finance/quote?symbols=${symbols.join(',')}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 15 }, // Cache for 15 seconds
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract quote results
    const quotes = data.quoteResponse?.result || [];

    // Format quotes to a cleaner structure
    const formattedQuotes = quotes.map((quote: any) => ({
      symbol: quote.symbol,
      shortName: quote.shortName || quote.symbol,
      regularMarketPrice: quote.regularMarketPrice || 0,
      regularMarketChange: quote.regularMarketChange || 0,
      regularMarketChangePercent: quote.regularMarketChangePercent || 0,
      regularMarketVolume: quote.regularMarketVolume || 0,
      regularMarketTime: quote.regularMarketTime || Date.now() / 1000,
      regularMarketDayHigh: quote.regularMarketDayHigh || 0,
      regularMarketDayLow: quote.regularMarketDayLow || 0,
      regularMarketOpen: quote.regularMarketOpen || 0,
      regularMarketPreviousClose: quote.regularMarketPreviousClose || 0,
      marketState: quote.marketState || 'REGULAR',
    }));

    return NextResponse.json(formattedQuotes);
  } catch (error) {
    console.error('Yahoo Finance quotes proxy error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch quotes from Yahoo Finance'
      },
      { status: 500 }
    );
  }
}
