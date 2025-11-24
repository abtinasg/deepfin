"use client";

import { ToastContainer } from '@/components/ui/toast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToastContainer />
      {children}
    </>
  );
}
