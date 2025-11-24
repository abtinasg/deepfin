import { NextResponse } from 'next/server';
import { YahooFinanceService } from '@/lib/yahoo-finance-service';

export const revalidate = 60; // Cache for 60 seconds

const TICKER_SYMBOLS = [
  'BTC-USD', 'ETH-USD', '^GSPC', '^NDX', '^VIX', 
  'AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMD', 'CL=F'
];

const SYMBOL_MAP: Record<string, string> = {
  'BTC-USD': 'BTC',
  'ETH-USD': 'ETH',
  '^GSPC': 'SPX',
  '^NDX': 'NDX',
  '^VIX': 'VIX',
  'CL=F': 'WTI'
};

export async function GET() {
  try {
    const quotes = await YahooFinanceService.getQuotes(TICKER_SYMBOLS);
    
    const tickerItems = quotes.map(quote => ({
      symbol: SYMBOL_MAP[quote.symbol] || quote.symbol,
      price: quote.regularMarketPrice.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }),
      change: `${quote.regularMarketChange >= 0 ? '+' : ''}${quote.regularMarketChangePercent.toFixed(2)}%`,
      isPositive: quote.regularMarketChange >= 0
    }));

    return NextResponse.json({ items: tickerItems });
  } catch (error) {
    console.error('Error fetching ticker data:', error);
    return NextResponse.json({ error: 'Failed to fetch ticker data' }, { status: 500 });
  }
}
