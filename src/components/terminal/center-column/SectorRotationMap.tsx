'use client';

import { TerminalModule } from '../TerminalModule';

interface SectorPoint {
  sector: string;
  etf: string;
  momentum: number; // -100 to +100
  strength: number; // -100 to +100
  color: string;
}

// Mock data for demonstration - In production, calculate from real market data
const SECTOR_DATA: SectorPoint[] = [
  { sector: 'Technology', etf: 'XLK', momentum: 65, strength: 45, color: '#3b82f6' },
  { sector: 'Healthcare', etf: 'XLV', momentum: 35, strength: -15, color: '#10b981' },
  { sector: 'Financials', etf: 'XLF', momentum: -25, strength: -35, color: '#ef4444' },
  { sector: 'Energy', etf: 'XLE', momentum: -45, strength: 25, color: '#f59e0b' },
  { sector: 'Consumer', etf: 'XLY', momentum: 15, strength: 55, color: '#8b5cf6' },
  { sector: 'Industrials', etf: 'XLI', momentum: 5, strength: -5, color: '#ec4899' },
  { sector: 'Materials', etf: 'XLB', momentum: -15, strength: 15, color: '#14b8a6' },
  { sector: 'Utilities', etf: 'XLU', momentum: -55, strength: -45, color: '#64748b' },
];

const QUADRANT_LABELS = [
  { label: 'Leading', x: 15, y: 15, description: 'High momentum, strong relative strength' },
  { label: 'Weakening', x: 85, y: 15, description: 'Losing momentum, but still strong' },
  { label: 'Lagging', x: 85, y: 85, description: 'Weak momentum and strength' },
  { label: 'Improving', x: 15, y: 85, description: 'Gaining momentum, but weak' },
];

function getQuadrant(point: SectorPoint): string {
  if (point.momentum >= 0 && point.strength >= 0) return 'Leading';
  if (point.momentum < 0 && point.strength >= 0) return 'Weakening';
  if (point.momentum < 0 && point.strength < 0) return 'Lagging';
  return 'Improving';
}

/**
 * SectorRotationMap - Quadrant visualization of sector momentum vs strength
 */
export function SectorRotationMap() {
  return (
    <TerminalModule
      title="Sector Rotation"
      subtitle="Momentum vs Relative Strength"
      height="380px"
      isLive
    >
      <div className="h-full flex gap-4">
        {/* Quadrant Chart */}
        <div className="flex-1 relative">
          {/* Chart container */}
          <div className="w-full h-full rounded-lg border border-white/[0.06] bg-white/[0.02] relative">
            {/* Axes */}
            <div className="absolute inset-0">
              {/* Vertical line (Y-axis) */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/[0.1]" />
              {/* Horizontal line (X-axis) */}
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white/[0.1]" />
            </div>

            {/* Quadrant labels */}
            {QUADRANT_LABELS.map((quad) => (
              <div
                key={quad.label}
                className="absolute text-terminal-xs font-medium text-slate-600 uppercase tracking-wider"
                style={{
                  left: `${quad.x}%`,
                  top: `${quad.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {quad.label}
              </div>
            ))}

            {/* Data points */}
            {SECTOR_DATA.map((point) => {
              // Convert from -100/+100 to 0-100% coordinates
              const x = ((point.strength + 100) / 200) * 100;
              const y = ((100 - point.momentum) / 200) * 100; // Invert Y axis

              return (
                <div
                  key={point.sector}
                  className="absolute group cursor-pointer"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {/* Dot */}
                  <div
                    className="w-3 h-3 rounded-full shadow-lg transition-all group-hover:scale-150"
                    style={{
                      backgroundColor: point.color,
                      boxShadow: `0 0 12px ${point.color}40`,
                    }}
                  />

                  {/* Label */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-layer-2 border border-white/10 rounded px-2 py-1 shadow-xl">
                      <div className="text-terminal-xs font-medium text-white">
                        {point.sector}
                      </div>
                      <div className="text-terminal-xs text-slate-400">
                        M: {point.momentum > 0 ? '+' : ''}
                        {point.momentum} / S: {point.strength > 0 ? '+' : ''}
                        {point.strength}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Axis labels */}
            <div className="absolute bottom-2 left-2 text-terminal-xs text-slate-500">
              Weak
            </div>
            <div className="absolute bottom-2 right-2 text-terminal-xs text-slate-500">
              Strong
            </div>
            <div className="absolute top-2 left-2 text-terminal-xs text-slate-500">
              High Momentum
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-terminal-xs text-slate-400 font-medium">
              Relative Strength →
            </div>
            <div
              className="absolute left-2 top-1/2 -translate-y-1/2 text-terminal-xs text-slate-400 font-medium"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg) translateY(50%)' }}
            >
              Momentum →
            </div>
          </div>
        </div>

        {/* Legend / Sector list */}
        <div className="w-48 flex flex-col gap-1 overflow-y-auto terminal-scrollbar">
          {SECTOR_DATA.map((point) => {
            const quadrant = getQuadrant(point);
            const quadrantColor =
              quadrant === 'Leading'
                ? 'text-emerald-400'
                : quadrant === 'Improving'
                  ? 'text-blue-400'
                  : quadrant === 'Weakening'
                    ? 'text-amber-400'
                    : 'text-rose-400';

            return (
              <div
                key={point.sector}
                className="flex items-center justify-between gap-2 p-2 rounded bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] hover:border-white/[0.08] transition cursor-pointer"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: point.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-terminal-xs font-medium text-white truncate">
                      {point.sector}
                    </div>
                    <div className={`text-terminal-xs font-medium ${quadrantColor}`}>
                      {quadrant}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TerminalModule>
  );
}
