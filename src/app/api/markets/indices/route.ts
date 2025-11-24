import { NextRequest, NextResponse } from 'next/server';
import { MarketsService } from '@/lib/markets-service';

export async function GET(request: NextRequest) {
  try {
    const indices = await MarketsService.getUSIndices();
    
    return NextResponse.json({
      success: true,
      indices,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching indices:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch indices' 
      },
      { status: 500 }
    );
  }
}
