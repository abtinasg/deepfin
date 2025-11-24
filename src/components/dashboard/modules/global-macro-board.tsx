"use client";

import { MacroMetric } from '@/types/dashboard';
import { TerminalCard } from '@/components/shared/terminal-card';
import { DataState } from '@/components/shared/data-state';
import { SkeletonBlock } from '@/components/shared/skeletons';

const fallbackMacro: MacroMetric[] = [
  { group: 'Rates', label: 'US 10Y', value: '4.38%', delta: '-7bp', sentiment: 'positive' },
  { group: 'Rates', label: '2s10s', value: '-35bp', delta: '+3bp', sentiment: 'negative' },
  { group: 'Bonds', label: 'HY OAS', value: '3.70%', delta: '-12bp', sentiment: 'positive' },
  { group: 'Bonds', label: 'IG OAS', value: '1.18%', delta: '-3bp', sentiment: 'positive' },
  { group: 'Commodities', label: 'Brent', value: '$81.40', delta: '+1.2%', sentiment: 'positive' },
  { group: 'Commodities', label: 'Gold', value: '$2,356', delta: '-0.4%', sentiment: 'negative' },
  { group: 'FX', label: 'DXY', value: '103.4', delta: '-0.2%', sentiment: 'negative' },
  { group: 'FX', label: 'USDJPY', value: '149.20', delta: '+0.6%', sentiment: 'positive' },
];

const toneClass = {
  positive: 'text-positive',
  negative: 'text-negative',
  neutral: 'text-textTone-secondary',
};

export function GlobalMacroBoard({ data = fallbackMacro, isLoading = false }: { data?: MacroMetric[]; isLoading?: boolean }) {
  const grouped = data.reduce<Record<string, MacroMetric[]>>((acc, metric) => {
    if (!acc[metric.group]) acc[metric.group] = [];
    acc[metric.group].push(metric);
    return acc;
  }, {});

  return (
    <TerminalCard title="GLOBAL MACRO" subtitle="Rates · Bonds · Commodities · FX">
      <DataState isLoading={isLoading} skeleton={<SkeletonBlock className="h-[220px]" />}>
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(grouped).map(([group, metrics]) => (
            <div key={group} className="rounded-2xl border border-surface-2/60 bg-layer-1/80 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-textTone-muted">{group}</p>
                <span className="text-[11px] text-textTone-secondary">{metrics.length} metrics</span>
              </div>
              <div className="space-y-2">
                {metrics.map((metric) => (
                  <div key={metric.label} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-b-0 last:pb-0">
                    <div>
                      <p className="text-sm text-textTone-primary">{metric.label}</p>
                      <p className="text-[11px] text-textTone-muted">{metric.delta}</p>
                    </div>
                    <p className={`mono-metric text-base font-semibold ${toneClass[metric.sentiment || 'neutral']}`}>
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DataState>
    </TerminalCard>
  );
}
