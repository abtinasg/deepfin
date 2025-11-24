import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { SavedScreenCreate } from '@/types/screener-api';

export const dynamic = 'force-dynamic';

// GET - Fetch all saved screens for the user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const savedScreens = await prisma.savedScreen.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format response
    const formatted = savedScreens.map((screen) => ({
      id: screen.id,
      userId: screen.userId,
      name: screen.name,
      description: screen.description,
      filters: screen.filtersJson,
      createdAt: screen.createdAt.toISOString(),
      updatedAt: screen.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      screens: formatted,
      total: formatted.length,
    });
  } catch (error) {
    console.error('Error fetching saved screens:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new saved screen
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: SavedScreenCreate = await request.json();

    // Validate request
    if (!body.name || !body.filters) {
      return NextResponse.json(
        { error: 'Name and filters are required' },
        { status: 400 }
      );
    }

    // Create saved screen
    const savedScreen = await prisma.savedScreen.create({
      data: {
        userId,
        name: body.name,
        description: body.description || null,
        filtersJson: body.filters as any,
      },
    });

    return NextResponse.json({
      id: savedScreen.id,
      userId: savedScreen.userId,
      name: savedScreen.name,
      description: savedScreen.description,
      filters: savedScreen.filtersJson,
      createdAt: savedScreen.createdAt.toISOString(),
      updatedAt: savedScreen.updatedAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating saved screen:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
