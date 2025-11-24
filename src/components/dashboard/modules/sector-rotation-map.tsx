"use client";

import { SectorRotationPoint } from '@/types/dashboard';
import { TerminalCard } from '@/components/shared/terminal-card';
import { DataState } from '@/components/shared/data-state';
import { SkeletonBlock } from '@/components/shared/skeletons';

const fallbackRotation: SectorRotationPoint[] = [
  { sector: 'Tech', momentum: 78, strength: 64, color: '#4C8BFF' },
  { sector: 'Health', momentum: 55, strength: 22, color: '#7A5CFF' },
  { sector: 'Energy', momentum: -12, strength: 48, color: '#4FE0C1' },
  { sector: 'Financials', momentum: -28, strength: -14, color: '#F26767' },
  { sector: 'Consumer', momentum: 12, strength: 60, color: '#F5B94C' },
];

const quadrants = [
  { label: 'Leading', position: 'top-left' },
  { label: 'Weakening', position: 'top-right' },
  { label: 'Lagging', position: 'bottom-right' },
  { label: 'Improving', position: 'bottom-left' },
];

export function SectorRotationMap({ data = fallbackRotation, isLoading = false }: { data?: SectorRotationPoint[]; isLoading?: boolean }) {
  return (
    <TerminalCard title="SECTOR ROTATION" subtitle="Momentum vs. relative strength" toolbar={<p className="text-xs text-textTone-muted">AI rotation monitor</p>}>
      <DataState isLoading={isLoading} skeleton={<SkeletonBlock className="h-[260px]" />}>
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="relative h-64 rounded-3xl border border-surface-2/60 bg-layer-1/80 p-4">
            <div className="absolute inset-1 grid grid-cols-2 grid-rows-2 place-items-center text-[11px] uppercase tracking-widest text-textTone-muted">
              {quadrants.map((quadrant) => (
                <span key={quadrant.label}>{quadrant.label}</span>
              ))}
            </div>
            <div className="absolute left-1/2 top-1/2 h-1/2 w-px -translate-x-1/2 bg-surface-3/60" />
            <div className="absolute left-1/2 top-1/2 w-1/2 -translate-y-1/2 border-t border-surface-3/60" />
            {data.map((point) => {
              const left = ((point.strength + 100) / 200) * 100;
              const top = 100 - ((point.momentum + 100) / 200) * 100;
              return (
                <div
                  key={point.sector}
                  className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                  style={{ left: `${left}%`, top: `${top}%` }}
                >
                  <span
                    className="mb-1 h-3 w-3 rounded-full shadow-glow"
                    style={{ backgroundColor: point.color || 'hsl(var(--accent-03))' }}
                  />
                  <p className="text-xs font-semibold text-textTone-primary">{point.sector}</p>
                  <p className="text-[11px] text-textTone-muted">{Math.round(point.momentum)} / {Math.round(point.strength)}</p>
                </div>
              );
            })}
          </div>
          <div className="space-y-4">
            {data.map((point) => (
              <div key={point.sector} className="flex items-center justify-between rounded-2xl border border-surface-2/70 bg-surface-1/60 px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-textTone-primary">{point.sector}</p>
                  <p className="text-xs text-textTone-muted">Momentum {point.momentum > 0 ? '+' : ''}{point.momentum.toFixed(0)} · Strength {point.strength > 0 ? '+' : ''}{point.strength.toFixed(0)}</p>
                </div>
                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: point.color || 'hsl(var(--accent-03))' }}
                >
                  {getQuadrant(point)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </DataState>
    </TerminalCard>
  );
}

function getQuadrant(point: SectorRotationPoint) {
  if (point.momentum >= 0 && point.strength >= 0) return 'LEADING';
  if (point.momentum >= 0 && point.strength < 0) return 'IMPROVING';
  if (point.momentum < 0 && point.strength < 0) return 'LAGGING';
  return 'WEAKENING';
}
