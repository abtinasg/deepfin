import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/alerts - Get all alerts for authenticated user
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const alerts = await prisma.alert.findMany({
      where: {
        userId,
        ...(activeOnly && { active: true }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/alerts - Create a new alert
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ticker, condition, threshold } = body;

    // Validate required fields
    if (!ticker || typeof ticker !== 'string') {
      return NextResponse.json({ error: 'Ticker symbol is required' }, { status: 400 });
    }
    if (!condition || typeof condition !== 'string') {
      return NextResponse.json({ error: 'Condition is required' }, { status: 400 });
    }
    if (!threshold || isNaN(parseFloat(threshold))) {
      return NextResponse.json({ error: 'Valid threshold is required' }, { status: 400 });
    }

    // Validate condition type
    const validConditions = [
      'price_above',
      'price_below',
      'volume_spike',
      'percent_change_up',
      'percent_change_down',
    ];
    if (!validConditions.includes(condition)) {
      return NextResponse.json({ error: 'Invalid condition type' }, { status: 400 });
    }

    const alert = await prisma.alert.create({
      data: {
        userId,
        ticker: ticker.toUpperCase(),
        condition,
        threshold: parseFloat(threshold),
        active: true,
      },
    });

    return NextResponse.json(alert);
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
