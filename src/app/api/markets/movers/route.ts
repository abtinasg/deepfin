import { NextRequest, NextResponse } from 'next/server';
import { MarketsService } from '@/lib/markets-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'gainers' | 'losers' | 'active' || 'gainers';
    
    const movers = await MarketsService.getMarketMovers(type);
    
    return NextResponse.json({
      success: true,
      movers,
      type,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching market movers:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch market movers' 
      },
      { status: 500 }
    );
  }
}
