import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { PortfolioPageClient } from './portfolio-client';

export default async function PortfolioPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return <PortfolioPageClient />;
}
