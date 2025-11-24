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

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const benchmark = searchParams.get('benchmark') || 'SPY';

    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000); // 1 year ago

    const [chartData, metrics, allocation] = await Promise.all([
      portfolioManager.getHistoricalPerformance(id, startDate, endDate, benchmark),
      portfolioManager.calculatePerformance(id, startDate, endDate),
      portfolioManager.calculateAllocation(id),
    ]);

    const realizedGains = await portfolioManager.getRealizedGains(id);

    return NextResponse.json({
      chartData,
      metrics: { ...metrics, realizedGains },
      allocation,
      startDate,
      endDate,
    });
  } catch (error) {
    console.error('Error fetching performance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    );
  }
}
