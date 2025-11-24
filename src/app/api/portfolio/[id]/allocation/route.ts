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

    const allocation = await portfolioManager.calculateAllocation(id);

    return NextResponse.json(allocation);
  } catch (error) {
    console.error('Error fetching allocation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch allocation data' },
      { status: 500 }
    );
  }
}
