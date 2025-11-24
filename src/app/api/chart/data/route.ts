import { NextRequest, NextResponse } from 'next/server';
import { Timeframe } from '@/types/chart';

/**
 * GET /api/chart/data
 * Fetch OHLCV (Open, High, Low, Close, Volume) chart data for a ticker
 * 
 * Query Parameters:
 * - ticker: Stock symbol (required)
 * - timeframe: Chart timeframe (1m, 5m, 15m, 30m, 1h, 4h, 1D, 1W, 1M, etc.)
 * - from: Start timestamp (optional)
 * - to: End timestamp (optional)
 * 
 * Example:
 * GET /api/chart/data?ticker=AAPL&timeframe=1D
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ticker = searchParams.get('ticker');
    const timeframe = (searchParams.get('timeframe') || '1D') as Timeframe;
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker symbol is required' },
        { status: 400 }
      );
    }

    // Calculate date range based on timeframe
    const endDate = to ? new Date(parseInt(to) * 1000) : new Date();
    const startDate = from 
      ? new Date(parseInt(from) * 1000)
      : getStartDateForTimeframe(timeframe, endDate);

    // Fetch data from Yahoo Finance or your data provider
    const chartData = await fetchChartData(ticker, timeframe, startDate, endDate);

    return NextResponse.json({
      ticker,
      timeframe,
      data: chartData,
      timestamp: Date.now(),
    });

  } catch (error) {
    console.error('Chart data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    );
  }
}

/**
 * Calculate start date based on timeframe
 */
function getStartDateForTimeframe(timeframe: Timeframe, endDate: Date): Date {
  const start = new Date(endDate);
  
  switch (timeframe) {
    case '1m':
    case '5m':
    case '15m':
    case '30m':
      start.setDate(start.getDate() - 7); // 7 days for intraday
      break;
    case '1h':
      start.setMonth(start.getMonth() - 1); // 1 month
      break;
    case '4h':
      start.setMonth(start.getMonth() - 3); // 3 months
      break;
    case '1D':
      start.setFullYear(start.getFullYear() - 1); // 1 year
      break;
    case '1W':
      start.setFullYear(start.getFullYear() - 5); // 5 years
      break;
    case '1M':
      start.setFullYear(start.getFullYear() - 10); // 10 years
      break;
    case '3M':
      start.setMonth(start.getMonth() - 3);
      break;
    case '6M':
      start.setMonth(start.getMonth() - 6);
      break;
    case '1Y':
      start.setFullYear(start.getFullYear() - 1);
      break;
    case '5Y':
      start.setFullYear(start.getFullYear() - 5);
      break;
    case 'All':
      start.setFullYear(start.getFullYear() - 20); // 20 years max
      break;
  }
  
  return start;
}

/**
 * Fetch chart data from data provider
 * This is a placeholder - integrate with your actual data source
 */
async function fetchChartData(
  ticker: string,
  timeframe: Timeframe,
  startDate: Date,
  endDate: Date
) {
  // Use mock data for now - Yahoo Finance requires CORS proxy in production
  console.log(`Fetching chart data for ${ticker} (${timeframe})`);
  
  try {
    // For production, use a proper data provider or proxy
    // For now, generate realistic mock data
    const mockData = generateMockData(ticker, timeframe, startDate, endDate);
    
    if (mockData.length === 0) {
      throw new Error('No data generated');
    }
    
    return mockData;
    
  } catch (error) {
    console.error('Error generating chart data:', error);
    
    // Last resort: return minimal data
    const now = Math.floor(Date.now() / 1000);
    return [{
      time: now,
      open: 100,
      high: 105,
      low: 95,
      close: 102,
      volume: 1000000,
    }];
  }
}

/**
 * Get Yahoo Finance interval from timeframe
 */
function getYahooInterval(timeframe: Timeframe): string {
  const intervalMap: Record<Timeframe, string> = {
    '1m': '1m',
    '5m': '5m',
    '15m': '15m',
    '30m': '30m',
    '1h': '1h',
    '4h': '1h', // Yahoo doesn't have 4h, use 1h
    '1D': '1d',
    '1W': '1wk',
    '1M': '1mo',
    '3M': '1d',
    '6M': '1d',
    '1Y': '1d',
    '5Y': '1wk',
    'All': '1mo',
  };
  
  return intervalMap[timeframe] || '1d';
}

/**
 * Get Yahoo Finance range from timeframe
 */
function getYahooRange(timeframe: Timeframe): string {
  const rangeMap: Record<Timeframe, string> = {
    '1m': '1d',
    '5m': '5d',
    '15m': '5d',
    '30m': '1mo',
    '1h': '1mo',
    '4h': '3mo',
    '1D': '1y',
    '1W': '5y',
    '1M': '10y',
    '3M': '3mo',
    '6M': '6mo',
    '1Y': '1y',
    '5Y': '5y',
    'All': 'max',
  };
  
  return rangeMap[timeframe] || '1y';
}

/**
 * Get cache revalidation time in seconds
 */
function getRevalidationTime(timeframe: Timeframe): number {
  const revalidationMap: Record<Timeframe, number> = {
    '1m': 60, // 1 minute
    '5m': 300, // 5 minutes
    '15m': 900, // 15 minutes
    '30m': 1800, // 30 minutes
    '1h': 3600, // 1 hour
    '4h': 3600, // 1 hour
    '1D': 3600, // 1 hour
    '1W': 86400, // 1 day
    '1M': 86400, // 1 day
    '3M': 3600,
    '6M': 3600,
    '1Y': 3600,
    '5Y': 86400,
    'All': 86400,
  };
  
  return revalidationMap[timeframe] || 3600;
}

/**
 * Generate mock data for development/testing
 */
function generateMockData(
  ticker: string,
  timeframe: Timeframe,
  startDate: Date,
  endDate: Date
) {
  const data = [];
  let currentDate = new Date(startDate);
  
  // Set base price based on ticker
  const basePrices: Record<string, number> = {
    'AAPL': 178,
    'MSFT': 370,
    'GOOGL': 140,
    'AMZN': 150,
    'NVDA': 480,
    'TSLA': 240,
    'META': 320,
    'BRK.B': 360,
  };
  
  let currentPrice = basePrices[ticker] || 100 + Math.random() * 100;
  const intervalMs = getIntervalMilliseconds(timeframe);
  
  // Limit data points to prevent too much data
  const maxPoints = 500;
  let pointCount = 0;
  
  while (currentDate <= endDate && pointCount < maxPoints) {
    const volatility = 0.02; // 2% volatility
    const change = currentPrice * volatility * (Math.random() - 0.5) * 2;
    const open = currentPrice;
    const close = currentPrice + change;
    const high = Math.max(open, close) * (1 + Math.random() * volatility);
    const low = Math.min(open, close) * (1 - Math.random() * volatility);
    const volume = Math.floor(1000000 + Math.random() * 10000000);
    
    data.push({
      time: Math.floor(currentDate.getTime() / 1000),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });
    
    currentPrice = close;
    currentDate = new Date(currentDate.getTime() + intervalMs);
    pointCount++;
  }
  
  return data;
}

/**
 * Get interval in milliseconds
 */
function getIntervalMilliseconds(timeframe: Timeframe): number {
  const intervalMap: Record<Timeframe, number> = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '30m': 30 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '1D': 24 * 60 * 60 * 1000,
    '1W': 7 * 24 * 60 * 60 * 1000,
    '1M': 30 * 24 * 60 * 60 * 1000,
    '3M': 24 * 60 * 60 * 1000,
    '6M': 24 * 60 * 60 * 1000,
    '1Y': 24 * 60 * 60 * 1000,
    '5Y': 7 * 24 * 60 * 60 * 1000,
    'All': 30 * 24 * 60 * 60 * 1000,
  };
  
  return intervalMap[timeframe] || 24 * 60 * 60 * 1000;
}
