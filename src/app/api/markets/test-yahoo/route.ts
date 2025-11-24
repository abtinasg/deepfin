import { NextRequest, NextResponse } from 'next/server';
import { YahooFinanceService } from '@/lib/yahoo-finance-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'AAPL';
    
    console.log(`Testing Yahoo Finance API for ${symbol}...`);
    
    // Test Yahoo Finance directly
    const quote = await YahooFinanceService.getQuote(symbol);
    
    if (!quote) {
      throw new Error(`Failed to fetch quote for ${symbol} from Yahoo Finance`);
    }
    
    return NextResponse.json({
      success: true,
      symbol,
      data: quote,
      source: 'Yahoo Finance',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error testing Yahoo Finance:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch data from Yahoo Finance',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
