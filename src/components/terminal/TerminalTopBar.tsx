'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, Sparkles, Bell, Settings } from 'lucide-react';
import { CustomUserButton } from '@/components/shared/user-button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Markets' },
  { href: '/dashboard/charts', label: 'Charts' },
  { href: '/dashboard/portfolio', label: 'Portfolio' },
  { href: '/dashboard/screener', label: 'Screener' },
];

export function TerminalTopBar() {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-100 h-12 border-b border-white/[0.06] bg-[#020617]/95 backdrop-blur-xl">
      <div className="h-full max-w-[2000px] mx-auto px-terminal-6 flex items-center justify-between">

        {/* Left Section: Logo + Status */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-105">
              <span className="font-bold text-white text-sm">D</span>
              <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/20" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-indigo-300 leading-none">
                Deepfin
              </span>
              <span className="text-xs font-semibold text-white/90 leading-none mt-0.5">
                Terminal
              </span>
            </div>
          </Link>

          {/* Market Status Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.03] border border-white/[0.06]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-terminal-xs text-slate-400 uppercase tracking-wide">
              Market Open
            </span>
            <span className="text-terminal-xs text-slate-500 ml-1">
              {new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              })}
            </span>
          </div>
        </div>

        {/* Center Section: Global Search */}
        <div className="flex-1 max-w-md mx-6">
          <div
            className={cn(
              'relative flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all',
              searchFocused
                ? 'border-indigo-500/50 bg-white/[0.08] shadow-glow-interactive'
                : 'border-white/[0.08] bg-white/[0.03]'
            )}
          >
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tickers, companies... (⌘K)"
              className="flex-1 bg-transparent text-terminal-sm text-white placeholder:text-slate-500 outline-none"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <kbd className="hidden sm:inline-block text-terminal-xs text-slate-500 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.08]">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-3">

          {/* Navigation (hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative rounded-md px-3 py-1.5 text-terminal-sm font-medium text-slate-400 transition-colors hover:text-white"
              >
                {item.label}
                <span className="absolute inset-0 -z-10 scale-90 rounded-md bg-white/5 opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100" />
              </Link>
            ))}
          </nav>

          <div className="h-4 w-px bg-white/[0.08]" />

          {/* Ask Alpha */}
          <button
            type="button"
            className="hidden sm:flex items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-terminal-xs font-medium text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            Ask Alpha
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="relative rounded-md p-2 text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-indigo-500 ring-2 ring-[#020617]" />
          </button>

          {/* Settings */}
          <button
            type="button"
            className="rounded-md p-2 text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            <Settings className="h-4 w-4" />
          </button>

          <div className="h-4 w-px bg-white/[0.08]" />

          {/* User Button */}
          <CustomUserButton />
        </div>
      </div>
    </header>
  );
}
