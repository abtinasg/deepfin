'use client';

import { TerminalLayout } from './TerminalLayout';
import { IndicesGrid } from './left-column/IndicesGrid';
import { SectorHeatmap } from './left-column/SectorHeatmap';
import { MarketMoversTable } from './left-column/MarketMoversTable';
import { FuturesGrid } from './left-column/FuturesGrid';
import { ForexGrid } from './left-column/ForexGrid';
import { BondYields } from './left-column/BondYields';
import { QuickStatsBar } from './center-column/QuickStatsBar';
import { NormalizedPerformanceChart } from './center-column/NormalizedPerformanceChart';
import { SectorRotationMap } from './center-column/SectorRotationMap';
import { MarketHeatmap } from './center-column/MarketHeatmap';
import { AICopilotPanel } from './ai-copilot/AICopilotPanel';

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

          {/* Market Movers */}
          <MarketMoversTable />

          {/* Futures & Commodities */}
          <FuturesGrid />

          {/* Currency Pairs */}
          <ForexGrid />

          {/* Bond Yields */}
          <BondYields />
        </>
      }
      centerColumn={
        <>
          {/* Quick Stats Bar */}
          <QuickStatsBar />

          {/* Main Terminal Chart */}
          <NormalizedPerformanceChart />

          {/* Sector Rotation Map */}
          <SectorRotationMap />

          {/* Market Heatmap */}
          <MarketHeatmap />
        </>
      }
      rightColumn={<AICopilotPanel />}
      showAICopilot={true}
    />
  );
}
