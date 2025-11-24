import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { portfolioManager } from '@/lib/portfolio-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const portfolio = await prisma.portfolio.findFirst({
      where: { id, userId },
    });

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const transactions = await prisma.transaction.findMany({
      where: { portfolioId: id },
      orderBy: { transactionDate: 'desc' },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const portfolio = await prisma.portfolio.findFirst({
      where: { id, userId },
    });

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const { ticker, type, shares, price, fees, transactionDate, notes } =
      await request.json();

    if (!ticker || !type || !shares || !price || !transactionDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (type !== 'buy' && type !== 'sell') {
      return NextResponse.json(
        { error: 'Transaction type must be "buy" or "sell"' },
        { status: 400 }
      );
    }

    const transaction = await portfolioManager.addTransaction({
      portfolioId: id,
      ticker,
      type,
      shares: Number(shares),
      price: Number(price),
      fees: fees ? Number(fees) : 0,
      transactionDate: new Date(transactionDate),
      notes,
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error adding transaction:', error);
    return NextResponse.json(
      { error: 'Failed to add transaction' },
      { status: 500 }
    );
  }
}
