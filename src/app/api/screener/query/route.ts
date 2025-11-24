import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { screenerService } from '@/lib/screener-service';
import { ScreenerQuery, ScreenerResponse } from '@/types/screener-api';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Auth check (optional - screener can be public or require auth)
    const { userId } = await auth();

    // Parse request body
    const body: ScreenerQuery = await request.json();

    // Validate request
    if (!body.filters) {
      return NextResponse.json(
        { error: 'Filters are required' },
        { status: 400 }
      );
    }

    // Extract parameters
    const { filters, sort, limit = 100, offset = 0 } = body;

    // Validate limit
    if (limit > 500) {
      return NextResponse.json(
        { error: 'Limit cannot exceed 500' },
        { status: 400 }
      );
    }

    // Execute query
    const queryResult = await screenerService.query(filters, sort, limit, offset);

    // Calculate execution time
    const executionTime = Date.now() - startTime;

    // Build response
    const response: ScreenerResponse = {
      total: queryResult.total,
      results: queryResult.results,
      execution_time_ms: executionTime,
      cached: queryResult.cached,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Screener query error:', error);
    
    const executionTime = Date.now() - startTime;
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        execution_time_ms: executionTime,
      },
      { status: 500 }
    );
  }
}

// GET method for simple queries via URL params
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);

    // Build filters from query params
    const filters: any = {};

    // Market cap
    const marketCapMin = searchParams.get('market_cap_min');
    const marketCapMax = searchParams.get('market_cap_max');
    if (marketCapMin || marketCapMax) {
      filters.market_cap = {};
      if (marketCapMin) filters.market_cap.min = Number(marketCapMin);
      if (marketCapMax) filters.market_cap.max = Number(marketCapMax);
    }

    // P/E ratio
    const peMin = searchParams.get('pe_min');
    const peMax = searchParams.get('pe_max');
    if (peMin || peMax) {
      filters.pe_ratio = {};
      if (peMin) filters.pe_ratio.min = Number(peMin);
      if (peMax) filters.pe_ratio.max = Number(peMax);
    }

    // Sector
    const sector = searchParams.get('sector');
    if (sector) {
      filters.sector = sector.split(',');
    }

    // Sort
    const sortField = searchParams.get('sort_field') as any;
    const sortOrder = searchParams.get('sort_order') as 'asc' | 'desc';
    const sort = sortField ? { field: sortField, order: sortOrder || 'desc' } : undefined;

    // Pagination
    const limit = Number(searchParams.get('limit') || 100);
    const offset = Number(searchParams.get('offset') || 0);

    // Execute query
    const queryResult = await screenerService.query(filters, sort, limit, offset);

    // Calculate execution time
    const executionTime = Date.now() - startTime;

    // Build response
    const response: ScreenerResponse = {
      total: queryResult.total,
      results: queryResult.results,
      execution_time_ms: executionTime,
      cached: queryResult.cached,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Screener GET error:', error);
    
    const executionTime = Date.now() - startTime;
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        execution_time_ms: executionTime,
      },
      { status: 500 }
    );
  }
}
