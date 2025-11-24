import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/watchlist/:id/items - Add a stock to watchlist
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { ticker } = body;

    if (!ticker || typeof ticker !== 'string') {
      return NextResponse.json({ error: 'Ticker symbol is required' }, { status: 400 });
    }

    // Verify watchlist ownership
    const watchlist = await prisma.watchlist.findFirst({
      where: { id, userId },
    });

    if (!watchlist) {
      return NextResponse.json({ error: 'Watchlist not found' }, { status: 404 });
    }

    // Check if item already exists
    const existing = await prisma.watchlistItem.findUnique({
      where: {
        watchlistId_ticker: {
          watchlistId: id,
          ticker: ticker.toUpperCase(),
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Stock already in watchlist' }, { status: 409 });
    }

    const item = await prisma.watchlistItem.create({
      data: {
        watchlistId: id,
        ticker: ticker.toUpperCase(),
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/watchlist/:id/items?ticker=AAPL - Remove a stock from watchlist
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');

    if (!ticker) {
      return NextResponse.json({ error: 'Ticker symbol is required' }, { status: 400 });
    }

    // Verify watchlist ownership
    const watchlist = await prisma.watchlist.findFirst({
      where: { id, userId },
    });

    if (!watchlist) {
      return NextResponse.json({ error: 'Watchlist not found' }, { status: 404 });
    }

    // Delete the item
    await prisma.watchlistItem.deleteMany({
      where: {
        watchlistId: id,
        ticker: ticker.toUpperCase(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
