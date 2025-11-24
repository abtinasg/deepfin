import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 1) {
      return NextResponse.json({ results: [] });
    }

    // In production, this would search a market data API
    // For now, return mock results
    const mockStocks = [
      { symbol: 'AAPL', name: 'Apple Inc.', type: 'Common Stock' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Common Stock' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Common Stock' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'Common Stock' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'Common Stock' },
      { symbol: 'META', name: 'Meta Platforms Inc.', type: 'Common Stock' },
      { symbol: 'TSLA', name: 'Tesla Inc.', type: 'Common Stock' },
    ];

    const results = mockStocks.filter(
      stock =>
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
    );

    return NextResponse.json({ results: results.slice(0, 10) });
  } catch (error) {
    console.error('Error searching stocks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
