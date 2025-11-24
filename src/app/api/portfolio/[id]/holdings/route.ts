import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/portfolio/:id/holdings - Add a holding to portfolio
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { ticker, shares, costBasis, purchaseDate, notes } = body;

    // Validate required fields
    if (!ticker || typeof ticker !== 'string') {
      return NextResponse.json({ error: 'Ticker symbol is required' }, { status: 400 });
    }
    if (!shares || isNaN(parseFloat(shares))) {
      return NextResponse.json({ error: 'Valid shares amount is required' }, { status: 400 });
    }
    if (!costBasis || isNaN(parseFloat(costBasis))) {
      return NextResponse.json({ error: 'Valid cost basis is required' }, { status: 400 });
    }
    if (!purchaseDate) {
      return NextResponse.json({ error: 'Purchase date is required' }, { status: 400 });
    }

    // Verify portfolio ownership
    const portfolio = await prisma.portfolio.findFirst({
      where: { id, userId },
    });

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const holding = await prisma.holding.create({
      data: {
        portfolioId: id,
        ticker: ticker.toUpperCase(),
        shares: parseFloat(shares),
        costBasis: parseFloat(costBasis),
        purchaseDate: new Date(purchaseDate),
        notes: notes || null,
      },
    });

    return NextResponse.json(holding);
  } catch (error) {
    console.error('Error adding holding:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/portfolio/:id/holdings - Get all holdings for a portfolio
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify portfolio ownership
    const portfolio = await prisma.portfolio.findFirst({
      where: { id, userId },
    });

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const holdings = await prisma.holding.findMany({
      where: { portfolioId: id },
      orderBy: { purchaseDate: 'desc' },
    });

    return NextResponse.json(holdings);
  } catch (error) {
    console.error('Error fetching holdings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
