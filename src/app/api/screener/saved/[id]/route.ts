import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// DELETE - Delete a saved screen by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Find the screen first to verify ownership
    const screen = await prisma.savedScreen.findUnique({
      where: { id },
    });

    if (!screen) {
      return NextResponse.json(
        { error: 'Screen not found' },
        { status: 404 }
      );
    }

    if (screen.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Delete the screen
    await prisma.savedScreen.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Screen deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting saved screen:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get a specific saved screen by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const screen = await prisma.savedScreen.findUnique({
      where: { id },
    });

    if (!screen) {
      return NextResponse.json(
        { error: 'Screen not found' },
        { status: 404 }
      );
    }

    if (screen.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: screen.id,
      userId: screen.userId,
      name: screen.name,
      description: screen.description,
      filters: screen.filtersJson,
      createdAt: screen.createdAt.toISOString(),
      updatedAt: screen.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching saved screen:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update a saved screen
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Find the screen first to verify ownership
    const screen = await prisma.savedScreen.findUnique({
      where: { id },
    });

    if (!screen) {
      return NextResponse.json(
        { error: 'Screen not found' },
        { status: 404 }
      );
    }

    if (screen.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Update the screen
    const updated = await prisma.savedScreen.update({
      where: { id },
      data: {
        name: body.name || screen.name,
        description: body.description !== undefined ? body.description : screen.description,
        filtersJson: body.filters || screen.filtersJson,
      },
    });

    return NextResponse.json({
      id: updated.id,
      userId: updated.userId,
      name: updated.name,
      description: updated.description,
      filters: updated.filtersJson,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error updating saved screen:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
