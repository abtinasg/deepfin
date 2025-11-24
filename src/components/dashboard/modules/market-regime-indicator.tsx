"use client";

import { RegimeProbability } from '@/types/dashboard';
import { TerminalCard } from '@/components/shared/terminal-card';
import { DataState } from '@/components/shared/data-state';
import { SkeletonBlock } from '@/components/shared/skeletons';

const fallbackRegime: RegimeProbability[] = [
  { label: 'Bull', probability: 0.48 },
  { label: 'Neutral', probability: 0.32 },
  { label: 'Bear', probability: 0.2 },
];

export function MarketRegimeIndicator({ data = fallbackRegime, isLoading = false }: { data?: RegimeProbability[]; isLoading?: boolean }) {
  const dominant = [...data].sort((a, b) => b.probability - a.probability)[0];

  return (
    <TerminalCard title="MARKET REGIME" subtitle="AI probability model">
      <DataState isLoading={isLoading} skeleton={<SkeletonBlock className="h-[140px]" />}>
        <div className="flex flex-col gap-4">
          {dominant && (
            <div className="rounded-2xl border border-surface-2/60 bg-gradient-to-r from-accentTone-1/30 to-transparent px-4 py-3">
              <p className="text-xs uppercase tracking-[0.4em] text-textTone-muted">Current regime</p>
              <p className="text-2xl font-semibold text-textTone-primary">{dominant.label}</p>
              <p className="text-sm text-textTone-secondary">{(dominant.probability * 100).toFixed(0)}% probability</p>
            </div>
          )}
          <div className="space-y-3">
            {data.map((regime) => (
              <div key={regime.label}>
                <div className="mb-1 flex items-center justify-between text-xs text-textTone-secondary">
                  <span>{regime.label}</span>
                  <span>{(regime.probability * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-layer-3">
                  <div
                    className={`h-full rounded-full ${regime.label === 'Bear' ? 'bg-negative' : regime.label === 'Bull' ? 'bg-positive' : 'bg-accentTone-3'}`}
                    style={{ width: `${regime.probability * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </DataState>
    </TerminalCard>
  );
}
