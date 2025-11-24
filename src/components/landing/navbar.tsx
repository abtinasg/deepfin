'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 font-bold text-white shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-105">
            DT
          </div>
          <div>
            <p className="text-base font-bold text-white">Deep Terminal</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Market Intelligence</p>
          </div>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-white/60 md:flex">
          <Link href="/dashboard" className="hover:text-white transition-colors">
            Platform
          </Link>
          <Link href="/dashboard/portfolio" className="hover:text-white transition-colors">
            Portfolio
          </Link>
          <Link href="/dashboard/markets" className="hover:text-white transition-colors">
            Markets
          </Link>
          <Link href="/#sectors" className="hover:text-white transition-colors">
            Sectors
          </Link>
          <Link href="/dashboard/realtime-demo" className="hover:text-white transition-colors">
            Real-time
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="hidden text-sm font-medium text-white/60 hover:text-white transition-colors sm:block">
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-900 transition-transform hover:scale-105 hover:bg-blue-50"
          >
            Start Trial
          </Link>
        </div>
      </div>
    </nav>
  );
}
