import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ProfessionalChartDashboard from '@/components/charts/professional-chart-dashboard';

export default async function ChartsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return <ProfessionalChartDashboard />;
}
