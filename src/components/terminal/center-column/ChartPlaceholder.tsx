'use client';

import { TerminalModule } from '../TerminalModule';
import { TrendingUp } from 'lucide-react';

/**
 * ChartPlaceholder - Temporary placeholder for main terminal chart
 * Will be replaced with full normalized performance chart
 */
export function ChartPlaceholder() {
  return (
    <TerminalModule
      title="Normalized Performance"
      subtitle="5D View"
      height="640px"
      isLive
      actions={
        <div className="flex items-center gap-1">
          {['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y'].map((range) => (
            <button
              key={range}
              className="px-2 py-1 rounded text-terminal-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.05] transition"
            >
              {range}
            </button>
          ))}
        </div>
      }
    >
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <p className="text-terminal-base text-slate-400">
            Main terminal chart will be implemented here
          </p>
          <p className="text-terminal-sm text-slate-600 mt-2">
            Multi-ticker normalized performance comparison
          </p>
        </div>
      </div>
    </TerminalModule>
  );
}
