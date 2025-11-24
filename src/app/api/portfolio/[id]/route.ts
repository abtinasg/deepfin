import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { portfolioManager } from '@/lib/portfolio-manager';

/**
 * GET /api/portfolio/:id - Get a specific portfolio with real-time values
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const portfolio = await prisma.portfolio.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const fullPortfolio = await portfolioManager.calculatePortfolioValue(id);

    return NextResponse.json(fullPortfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/portfolio/:id - Update portfolio details
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    // Verify ownership
    const existing = await prisma.portfolio.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const updateData: { name?: string; description?: string | null } = {};
    if (name && typeof name === 'string') {
      updateData.name = name;
    }
    if (description !== undefined) {
      updateData.description = description || null;
    }

    const portfolio = await prisma.portfolio.update({
      where: { id },
      data: updateData,
      include: {
        holdings: true,
      },
    });

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Error updating portfolio:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/portfolio/:id - Delete a portfolio
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.portfolio.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    await prisma.portfolio.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
