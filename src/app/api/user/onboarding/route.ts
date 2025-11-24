import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Create or update the user profile
    const profile = await prisma.userProfile.upsert({
      where: { clerkUserId: userId },
      update: {
        experienceLevel: body.experienceLevel,
        sectors: body.sectors,
        investmentStyle: body.investmentStyle,
        goals: body.goals,
        onboardingCompleted: true,
      },
      create: {
        clerkUserId: userId,
        experienceLevel: body.experienceLevel,
        sectors: body.sectors,
        investmentStyle: body.investmentStyle,
        goals: body.goals,
        onboardingCompleted: true,
      },
    });

    // Create default watchlist for the user
    await prisma.watchlist.create({
      data: {
        userId: userId,
        name: 'Default Watchlist',
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
