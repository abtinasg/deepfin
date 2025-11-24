import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/chart/layouts/[id]
 * Get a specific chart layout
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // For now, return a mock response
    // In production, uncomment:
    /*
    const layout = await prisma.chartLayout.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!layout) {
      return NextResponse.json(
        { error: 'Layout not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: layout.id,
      name: layout.name,
      config: layout.config,
      createdAt: layout.createdAt.toISOString(),
      updatedAt: layout.updatedAt.toISOString(),
    });
    */

    return NextResponse.json(
      { error: 'Layout not found' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Error fetching chart layout:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chart layout' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/chart/layouts/[id]
 * Update a chart layout
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { name, config } = body;

    // For now, return a mock response
    // In production, uncomment:
    /*
    const layout = await prisma.chartLayout.updateMany({
      where: {
        id,
        userId,
      },
      data: {
        ...(name && { name }),
        ...(config && { config }),
        updatedAt: new Date(),
      },
    });

    if (layout.count === 0) {
      return NextResponse.json(
        { error: 'Layout not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.chartLayout.findUnique({
      where: { id },
    });

    return NextResponse.json({
      id: updated!.id,
      name: updated!.name,
      config: updated!.config,
      createdAt: updated!.createdAt.toISOString(),
      updatedAt: updated!.updatedAt.toISOString(),
    });
    */

    return NextResponse.json({
      id,
      name: name || 'Updated Layout',
      config: config || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error updating chart layout:', error);
    return NextResponse.json(
      { error: 'Failed to update chart layout' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chart/layouts/[id]
 * Delete a chart layout
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // For now, return success
    // In production, uncomment:
    /*
    const result = await prisma.chartLayout.deleteMany({
      where: {
        id,
        userId,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Layout not found' },
        { status: 404 }
      );
    }
    */

    return NextResponse.json({
      success: true,
      message: 'Layout deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting chart layout:', error);
    return NextResponse.json(
      { error: 'Failed to delete chart layout' },
      { status: 500 }
    );
  }
}
