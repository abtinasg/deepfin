import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ScreenerClient from './screener-client';

export default async function ScreenerPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return <ScreenerClient />;
}
