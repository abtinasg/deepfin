import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
// import { prisma } from '@/lib/prisma';

// Get specific session with all messages
// TODO: Uncomment after running prisma migrate
export async function GET(
  req: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Await params in Next.js 15
  const { sessionId } = await context.params;

  // Temporarily return empty session until migration is run
  return NextResponse.json({ 
    id: sessionId, 
    userId, 
    title: 'Chat Session',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // try {
  //   const session = await prisma.chatSession.findFirst({
  //     where: {
  //       id: sessionId,
  //       userId,
  //     },
  //     include: {
  //       messages: {
  //         orderBy: { createdAt: 'asc' },
  //       },
  //     },
  //   });

  //   if (!session) {
  //     return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  //   }

  //   return NextResponse.json(session);
  // } catch (error) {
  //   console.error('Failed to fetch session:', error);
  //   return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  // }
}

// Delete session
// TODO: Uncomment after running prisma migrate
export async function DELETE(
  req: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Await params in Next.js 15
  const { sessionId } = await context.params;

  // Temporarily return success until migration is run
  return NextResponse.json({ success: true });

  // try {
  //   await prisma.chatSession.deleteMany({
  //     where: {
  //       id: sessionId,
  //       userId,
  //     },
  //   });

  //   return NextResponse.json({ success: true });
  // } catch (error) {
  //   console.error('Failed to delete session:', error);
  //   return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  // }
}
