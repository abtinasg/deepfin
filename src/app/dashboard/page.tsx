import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import MarketsClient from '@/components/markets/markets-client';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return <MarketsClient />;
}
