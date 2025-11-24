"use client";

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  ActivitySquare,
  BarChart3,
  Brain,
  Home,
  LineChart,
  Menu,
  Newspaper,
  Radar,
  Search,
  Settings2,
  Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type TerminalNavItem = {
  id: string;
  label: string;
  icon: ReactNode;
  href?: string;
  active?: boolean;
  badge?: string;
};

export type TerminalShellProps = {
  navItems?: TerminalNavItem[];
  children: ReactNode;
  className?: string;
  topBarExtras?: ReactNode;
  quickActions?: ReactNode;
  rightPanel?: ReactNode;
  title?: string;
  subtitle?: string;
};

const defaultNav: TerminalNavItem[] = [
  { id: 'overview', label: 'Overview', icon: <Home size={18} /> },
  { id: 'charts', label: 'Charts', icon: <LineChart size={18} /> },
  { id: 'screener', label: 'Screener', icon: <BarChart3 size={18} /> },
  { id: 'macro', label: 'Macro', icon: <Radar size={18} /> },
  { id: 'ai', label: 'AI Desk', icon: <Brain size={18} /> },
  { id: 'news', label: 'News', icon: <Newspaper size={18} /> },
  { id: 'alerts', label: 'Alerts', icon: <ActivitySquare size={18} /> },
];

export function TerminalShell({
  navItems = defaultNav,
  children,
  className,
  topBarExtras,
  quickActions,
  rightPanel,
  title = 'Deep Terminal',
  subtitle = 'Unified market cockpit',
}: TerminalShellProps) {
  return (
    <div className="min-h-screen bg-layer-0 text-textTone-primary">
      <div className="grid min-h-screen grid-cols-[72px,_1fr] gap-0">
        <aside className="flex flex-col items-center gap-8 border-r border-surface-2/50 bg-layer-1/90 py-8">
          <div className="rounded-2xl bg-surface-2/70 p-3 text-accentTone-3">
            <Share2 size={22} />
          </div>
          <nav className="flex flex-col gap-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-2xl text-textTone-muted transition',
                  item.active && 'bg-accentTone-1/15 text-accentTone-1 shadow-glow',
                  !item.active && 'hover:bg-surface-highlight/40 hover:text-textTone-primary',
                )}
                aria-label={item.label}
              >
                {item.icon}
              </button>
            ))}
          </nav>
          <button className="mt-auto rounded-2xl border border-surface-2/60 p-3 text-textTone-muted hover:text-textTone-primary">
            <Settings2 size={18} />
          </button>
        </aside>
        <div className="relative flex flex-col overflow-hidden">
          <motion.header
            className="flex flex-col gap-4 border-b border-surface-2/60 bg-layer-0/80 px-8 py-6 backdrop-blur-xl"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.35em] text-textTone-muted">{subtitle}</p>
                <h1 className="text-2xl font-semibold text-textTone-primary">{title}</h1>
              </div>
              <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-textTone-muted" size={16} />
                  <input
                    className="w-full rounded-2xl border border-surface-2/70 bg-surface-1/70 py-2 pl-10 pr-4 text-sm text-textTone-primary placeholder:text-textTone-muted focus:border-accentTone-1 focus:outline-none"
                    placeholder="Search tickers, macro themes, ideas"
                  />
                </div>
                <button className="rounded-2xl border border-surface-2/60 p-2 hover:border-accentTone-1/80">
                  <Menu size={18} />
                </button>
                {quickActions}
              </div>
            </div>
            {topBarExtras}
          </motion.header>
          <main className={cn('flex flex-1 flex-col gap-6 overflow-y-auto px-8 py-8', className)}>
            {children}
          </main>
          {rightPanel && (
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[320px] border-l border-surface-2/60 bg-layer-1/95 px-6 py-8 lg:block">
              <div className="pointer-events-auto h-full overflow-y-auto">{rightPanel}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
