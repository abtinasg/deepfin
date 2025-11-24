import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { ChartLayout } from '@/types/chart';

/**
 * GET /api/chart/layouts
 * Get all saved chart layouts for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const layouts = await prisma.chartLayout.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      layouts: layouts.map(layout => ({
        id: layout.id,
        name: layout.name,
        config: layout.config,
        createdAt: layout.createdAt.toISOString(),
        updatedAt: layout.updatedAt.toISOString(),
      })),
    });

  } catch (error) {
    console.error('Error fetching chart layouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chart layouts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chart/layouts
 * Save a new chart layout
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, config } = body;

    if (!name || !config) {
      return NextResponse.json(
        { error: 'Name and config are required' },
        { status: 400 }
      );
    }

    const layout = await prisma.chartLayout.create({
      data: {
        userId,
        name,
        config,
      },
    });

    return NextResponse.json({
      id: layout.id,
      name: layout.name,
      config: layout.config,
      createdAt: layout.createdAt.toISOString(),
      updatedAt: layout.updatedAt.toISOString(),
    });

  } catch (error) {
    console.error('Error saving chart layout:', error);
    return NextResponse.json(
      { error: 'Failed to save chart layout' },
      { status: 500 }
    );
  }
}
