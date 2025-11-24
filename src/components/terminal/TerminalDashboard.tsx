'use client';

import { TerminalLayout } from './TerminalLayout';
import { IndicesGrid } from './left-column/IndicesGrid';
import { SectorHeatmap } from './left-column/SectorHeatmap';
import { QuickStatsBar } from './center-column/QuickStatsBar';
import { ChartPlaceholder } from './center-column/ChartPlaceholder';
import { AICopilotPanel } from './ai-copilot/AICopilotPanel';
import { TerminalModule } from './TerminalModule';

/**
 * TerminalDashboard - Bloomberg-style financial terminal
 *
 * Layout:
 * - Left Column (30%): Indices, Sectors, Movers, Futures, etc.
 * - Center Column (40%): Main chart, heatmaps, breadth indicators
 * - Right Column (400px): AI Copilot, always visible
 */
export function TerminalDashboard() {
  return (
    <TerminalLayout
      leftColumn={
        <>
          {/* US Market Indices */}
          <IndicesGrid />

          {/* Sector Performance */}
          <SectorHeatmap />

          {/* Market Movers - Placeholder */}
          <TerminalModule title="Market Movers" height="320px">
            <div className="flex items-center justify-center h-full text-slate-500 text-terminal-sm">
              Gainers / Losers / Active
            </div>
          </TerminalModule>

          {/* Futures & Commodities - Placeholder */}
          <TerminalModule title="Futures & Commodities" height="240px">
            <div className="flex items-center justify-center h-full text-slate-500 text-terminal-sm">
              Gold, Oil, Bitcoin, etc.
            </div>
          </TerminalModule>

          {/* Currency Pairs - Placeholder */}
          <TerminalModule title="Currency Pairs" height="180px">
            <div className="flex items-center justify-center h-full text-slate-500 text-terminal-sm">
              EUR/USD, GBP/USD, etc.
            </div>
          </TerminalModule>

          {/* Bond Yields - Placeholder */}
          <TerminalModule title="Bond Yields" height="180px">
            <div className="flex items-center justify-center h-full text-slate-500 text-terminal-sm">
              10Y, 30Y Treasury Yields
            </div>
          </TerminalModule>
        </>
      }
      centerColumn={
        <>
          {/* Quick Stats Bar */}
          <QuickStatsBar />

          {/* Main Terminal Chart */}
          <ChartPlaceholder />

          {/* Sector Rotation Map - Placeholder */}
          <TerminalModule title="Sector Rotation" height="320px">
            <div className="flex items-center justify-center h-full text-slate-500 text-terminal-sm">
              Quadrant chart visualization
            </div>
          </TerminalModule>

          {/* Market Heatmap - Placeholder */}
          <TerminalModule title="Market Heatmap" height="480px">
            <div className="flex items-center justify-center h-full text-slate-500 text-terminal-sm">
              Treemap of S&P 500 constituents
            </div>
          </TerminalModule>
        </>
      }
      rightColumn={<AICopilotPanel />}
      showAICopilot={true}
    />
  );
}
