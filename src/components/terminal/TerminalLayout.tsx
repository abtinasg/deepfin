'use client';

import { ReactNode, useState } from 'react';
import { TerminalTopBar } from './TerminalTopBar';
import { cn } from '@/lib/utils';

interface TerminalLayoutProps {
  leftColumn: ReactNode;
  centerColumn: ReactNode;
  rightColumn?: ReactNode;
  showAICopilot?: boolean;
}

/**
 * TerminalLayout - Bloomberg-style 3-column grid
 *
 * Desktop layout:
 * - Left:   30% (indices, sectors, movers, etc.)
 * - Center: 40% (main chart, heatmap, breadth)
 * - Right:  400px fixed (AI Copilot, always visible)
 *
 * Responsive:
 * - <1280px: AI Copilot becomes overlay/drawer
 * - <1024px: 2-column layout
 * - <768px:  Single column stack
 */
export function TerminalLayout({
  leftColumn,
  centerColumn,
  rightColumn,
  showAICopilot = true,
}: TerminalLayoutProps) {
  const [copilotExpanded, setCopilotExpanded] = useState(true);

  return (
    <div className="h-screen overflow-hidden bg-[#020617]">
      {/* Fixed Top Bar */}
      <TerminalTopBar />

      {/* Main Terminal Grid */}
      <div className="flex h-[calc(100vh-48px)] overflow-hidden">

        {/* Left Column - Market Data Tables */}
        <div
          className={cn(
            'flex-shrink-0 overflow-y-auto terminal-scrollbar',
            // Desktop widths
            'hidden xl:block',
            showAICopilot && copilotExpanded ? 'xl:w-[30%]' : 'xl:w-[35%]',
            // Tablet widths (when AI copilot is hidden)
            'lg:block lg:w-[40%]'
          )}
        >
          <div className="p-terminal-6 space-y-terminal-6">
            {leftColumn}
          </div>
        </div>

        {/* Center Column - Main Chart & Visualizations */}
        <div
          className={cn(
            'flex-1 overflow-y-auto terminal-scrollbar',
            // Desktop
            'xl:block',
            // Tablet - takes full width when left is hidden
            'lg:block',
            // Mobile - full width
            'w-full'
          )}
        >
          <div className="p-terminal-6 space-y-terminal-6">
            {centerColumn}
          </div>
        </div>

        {/* Right Column - AI Copilot (Fixed Position) */}
        {showAICopilot && rightColumn && (
          <aside
            className={cn(
              'flex-shrink-0 border-l border-white/[0.06] bg-[#0B1121]/98 backdrop-blur-lg',
              'overflow-hidden transition-all duration-300',
              // Desktop - always visible, fixed width
              copilotExpanded ? 'hidden xl:block xl:w-[400px]' : 'xl:w-0',
              // Tablet/Mobile - overlay or drawer
              'lg:hidden'
            )}
          >
            <div className="h-full overflow-y-auto terminal-scrollbar">
              {rightColumn}
            </div>
          </aside>
        )}

        {/* Mobile AI Copilot Overlay (for tablet/mobile) */}
        {showAICopilot && rightColumn && copilotExpanded && (
          <div className="xl:hidden">
            <div
              className={cn(
                'fixed inset-y-12 right-0 z-50 w-[90%] max-w-md',
                'border-l border-white/[0.06] bg-[#0B1121]/98 backdrop-blur-lg',
                'shadow-2xl transition-transform duration-300',
                copilotExpanded ? 'translate-x-0' : 'translate-x-full'
              )}
            >
              <div className="h-full overflow-y-auto terminal-scrollbar">
                {rightColumn}
              </div>
            </div>
            {/* Overlay backdrop */}
            <div
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setCopilotExpanded(false)}
            />
          </div>
        )}

        {/* Floating AI Toggle Button (Mobile/Tablet) */}
        {showAICopilot && (
          <button
            onClick={() => setCopilotExpanded(!copilotExpanded)}
            className={cn(
              'xl:hidden fixed bottom-6 right-6 z-50',
              'h-12 w-12 rounded-full',
              'bg-gradient-to-br from-indigo-600 to-violet-600',
              'shadow-lg shadow-indigo-500/30',
              'flex items-center justify-center',
              'text-white transition-transform hover:scale-110'
            )}
          >
            <span className="text-xs font-bold">AI</span>
          </button>
        )}
      </div>
    </div>
  );
}
