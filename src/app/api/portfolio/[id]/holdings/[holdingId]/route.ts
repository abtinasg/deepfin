import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/portfolio/:id/holdings/:holdingId - Update a holding
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; holdingId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: portfolioId, holdingId } = await params;
    const body = await request.json();
    const { shares, costBasis, purchaseDate, notes } = body;

    // Verify portfolio ownership
    const portfolio = await prisma.portfolio.findFirst({
      where: { id: portfolioId, userId },
    });

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // Verify holding exists in this portfolio
    const existingHolding = await prisma.holding.findFirst({
      where: { id: holdingId, portfolioId },
    });

    if (!existingHolding) {
      return NextResponse.json({ error: 'Holding not found' }, { status: 404 });
    }

    // Build update data
    const updateData: {
      shares?: number;
      costBasis?: number;
      purchaseDate?: Date;
      notes?: string | null;
    } = {};

    if (shares !== undefined && !isNaN(parseFloat(shares))) {
      updateData.shares = parseFloat(shares);
    }
    if (costBasis !== undefined && !isNaN(parseFloat(costBasis))) {
      updateData.costBasis = parseFloat(costBasis);
    }
    if (purchaseDate) {
      updateData.purchaseDate = new Date(purchaseDate);
    }
    if (notes !== undefined) {
      updateData.notes = notes || null;
    }

    const holding = await prisma.holding.update({
      where: { id: holdingId },
      data: updateData,
    });

    return NextResponse.json(holding);
  } catch (error) {
    console.error('Error updating holding:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/portfolio/:id/holdings/:holdingId - Delete a holding
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; holdingId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: portfolioId, holdingId } = await params;

    // Verify portfolio ownership
    const portfolio = await prisma.portfolio.findFirst({
      where: { id: portfolioId, userId },
    });

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // Verify holding exists in this portfolio
    const existingHolding = await prisma.holding.findFirst({
      where: { id: holdingId, portfolioId },
    });

    if (!existingHolding) {
      return NextResponse.json({ error: 'Holding not found' }, { status: 404 });
    }

    await prisma.holding.delete({
      where: { id: holdingId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting holding:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
