import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/alerts/:id - Get a specific alert
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const alert = await prisma.alert.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    return NextResponse.json(alert);
  } catch (error) {
    console.error('Error fetching alert:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/alerts/:id - Update an alert (toggle active or update threshold)
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { active, threshold, condition } = body;

    // Verify ownership
    const existing = await prisma.alert.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    // Build update data
    const updateData: {
      active?: boolean;
      threshold?: number;
      condition?: string;
    } = {};

    if (active !== undefined && typeof active === 'boolean') {
      updateData.active = active;
    }
    if (threshold !== undefined && !isNaN(parseFloat(threshold))) {
      updateData.threshold = parseFloat(threshold);
    }
    if (condition && typeof condition === 'string') {
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
      updateData.condition = condition;
    }

    const alert = await prisma.alert.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(alert);
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/alerts/:id - Delete an alert
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.alert.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    await prisma.alert.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
