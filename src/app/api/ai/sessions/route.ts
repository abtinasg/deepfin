import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
// import { prisma } from '@/lib/prisma';

// Get all chat sessions for user
// TODO: Uncomment after running prisma migrate
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Temporarily return empty array until migration is run
  return NextResponse.json([]);

  // try {
  //   const sessions = await prisma.chatSession.findMany({
  //     where: { userId },
  //     orderBy: { updatedAt: 'desc' },
  //     include: {
  //       messages: {
  //         orderBy: { createdAt: 'asc' },
  //         take: 1, // Just get first message for preview
  //       },
  //     },
  //   });

  //   return NextResponse.json(sessions);
  // } catch (error) {
  //   console.error('Failed to fetch sessions:', error);
  //   return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  // }
}

// Create new chat session
// TODO: Uncomment after running prisma migrate
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Temporarily return mock session until migration is run
  const { title } = await req.json();
  return NextResponse.json({ 
    id: `temp-${Date.now()}`, 
    userId, 
    title: title || 'New Chat',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // try {
  //   const { title, context } = await req.json();

  //   const session = await prisma.chatSession.create({
  //     data: {
  //       userId,
  //       title: title || 'New Chat',
  //       context: context || null,
  //     },
  //   });

  //   return NextResponse.json(session);
  // } catch (error) {
  //   console.error('Failed to create session:', error);
  //   return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  // }
}
