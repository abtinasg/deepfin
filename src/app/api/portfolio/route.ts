import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { portfolioManager } from '@/lib/portfolio-manager';

/**
 * GET /api/portfolio - Get all portfolios for authenticated user with real-time values
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const portfolios = await prisma.portfolio.findMany({
      where: { userId },
      include: {
        holdings: true,
        _count: {
          select: { holdings: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Enrich with current values
    const enrichedPortfolios = await Promise.all(
      portfolios.map(async (p) => {
        try {
          const fullPortfolio = await portfolioManager.calculatePortfolioValue(p.id);
          return {
            id: p.id,
            name: p.name,
            description: p.description,
            totalValue: fullPortfolio.totalValue,
            totalGainLoss: fullPortfolio.totalGainLoss,
            totalGainLossPercent: fullPortfolio.totalGainLossPercent,
            dayChange: fullPortfolio.dayChange,
            dayChangePercent: fullPortfolio.dayChangePercent,
            numberOfHoldings: p._count.holdings,
            lastUpdated: p.updatedAt,
          };
        } catch (error) {
          console.error(`Error calculating portfolio ${p.id}:`, error);
          return {
            id: p.id,
            name: p.name,
            description: p.description,
            totalValue: 0,
            totalGainLoss: 0,
            totalGainLossPercent: 0,
            dayChange: 0,
            dayChangePercent: 0,
            numberOfHoldings: p._count.holdings,
            lastUpdated: p.updatedAt,
          };
        }
      })
    );

    return NextResponse.json(enrichedPortfolios);
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/portfolio - Create a new portfolio
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Portfolio name is required' }, { status: 400 });
    }

    const portfolio = await prisma.portfolio.create({
      data: {
        userId,
        name,
        description: description || null,
      },
      include: {
        holdings: true,
      },
    });

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Error creating portfolio:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
