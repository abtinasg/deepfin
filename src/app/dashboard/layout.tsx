"use client";

import Link from 'next/link';
import { Sparkles, Bell } from 'lucide-react';
import { CustomUserButton } from '@/components/shared/user-button';
import { ToastContainer } from '@/components/ui/toast';
import DashboardWithAI from '@/components/dashboard/DashboardWithAI';

const navItems = [
  { href: '/dashboard', label: 'Markets' },
  { href: '/dashboard/charts', label: 'Charts' },
  { href: '/dashboard/portfolio', label: 'Portfolio' },
  { href: '/dashboard/screener', label: 'Screener' }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardWithAI>
      <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30">
        <ToastContainer />
        <header className="sticky top-0 z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#020617]/60">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-105">
                  <span className="font-bold text-white">D</span>
                  <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">Deepfin</span>
                  <span className="text-sm font-semibold text-white/90">Terminal</span>
                </div>
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group relative rounded-lg px-3 py-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-white"
                  >
                    {item.label}
                    <span className="absolute inset-0 -z-10 scale-90 rounded-lg bg-white/5 opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100" />
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="hidden sm:flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                onClick={() => console.log('Open AI command bar')}
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                Ask Alpha
                <kbd className="ml-1 hidden rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-slate-400 lg:inline-block">⌘K</kbd>
              </button>
              <div className="h-4 w-px bg-white/10" />
              <button
                type="button"
                className="relative rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-indigo-500 ring-2 ring-[#020617]" />
              </button>
              <CustomUserButton />
            </div>
          </div>
        </div>
      </header>
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-[1800px] mx-auto">{children}</div>
      </main>
      </div>
    </DashboardWithAI>
  );
}
