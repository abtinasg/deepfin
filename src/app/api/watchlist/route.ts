import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/watchlist - Get all watchlists for authenticated user
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const watchlists = await prisma.watchlist.findMany({
      where: { userId },
      include: {
        items: {
          orderBy: { addedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(watchlists);
  } catch (error) {
    console.error('Error fetching watchlists:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/watchlist - Create a new watchlist
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Watchlist name is required' }, { status: 400 });
    }

    const watchlist = await prisma.watchlist.create({
      data: {
        userId,
        name,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(watchlist);
  } catch (error) {
    console.error('Error creating watchlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
