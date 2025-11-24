import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id } = evt.data;

    try {
      // Create a basic user profile
      const profile = await prisma.userProfile.create({
        data: {
          clerkUserId: id,
          onboardingCompleted: false,
        },
      });

      // Create default watchlist for the new user
      await prisma.watchlist.create({
        data: {
          userId: id,
          name: 'My Watchlist',
        },
      });

      // Create default portfolio for the new user
      await prisma.portfolio.create({
        data: {
          userId: id,
          name: 'My Portfolio',
          description: 'Your default portfolio',
        },
      });

      console.log(`User ${id} created with default watchlist and portfolio`);
    } catch (error) {
      console.error('Error creating user profile:', error);
      // Don't return error, just log it
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    if (id) {
      // Delete user profile and related data
      await prisma.userProfile.delete({
        where: { clerkUserId: id },
      });
    }
  }

  return new Response('', { status: 200 });
}
