"use client";

import { ScreenerQuickCard } from '@/types/dashboard';
import { TerminalCard } from '@/components/shared/terminal-card';
import { DataState } from '@/components/shared/data-state';
import { SkeletonBlock } from '@/components/shared/skeletons';

const fallbackCards: ScreenerQuickCard[] = [
  {
    title: 'Value',
    tone: 'positive',
    metrics: [
      { label: 'Avg P/E', value: '12.4x' },
      { label: 'Div Yield', value: '3.2%' },
    ],
  },
  {
    title: 'Growth',
    tone: 'positive',
    metrics: [
      { label: 'Rev CAGR', value: '+28%' },
      { label: 'Rule of 40', value: '46' },
    ],
  },
  {
    title: 'Income',
    tone: 'neutral',
    metrics: [
      { label: 'Yield', value: '5.4%' },
      { label: 'Coverage', value: '2.9x' },
    ],
  },
  {
    title: 'High Vol',
    tone: 'negative',
    metrics: [
      { label: 'Beta', value: '1.6' },
      { label: 'IV', value: '42%' },
    ],
  },
  {
    title: 'Trend',
    tone: 'positive',
    metrics: [
      { label: '50/200', value: 'Rising' },
      { label: 'ADX', value: '34' },
    ],
  },
];

const toneBackground: Record<ScreenerQuickCard['tone'], string> = {
  positive: 'from-positive/20 to-transparent',
  negative: 'from-negative/20 to-transparent',
  neutral: 'from-accentTone-3/20 to-transparent',
};

export function ScreenerQuickCards({ data = fallbackCards, isLoading = false }: { data?: ScreenerQuickCard[]; isLoading?: boolean }) {
  return (
    <TerminalCard title="SCREENER PRESETS" subtitle="Value · Growth · Income · High Vol · Trend">
      <DataState isLoading={isLoading} skeleton={<SkeletonBlock className="h-[160px]" />}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {data.map((card) => (
            <button
              key={card.title}
              className={`rounded-2xl border border-surface-2/60 bg-gradient-to-b ${toneBackground[card.tone]} p-3 text-left transition hover:border-accentTone-1/60`}
            >
              <p className="text-xs uppercase tracking-[0.3em] text-textTone-muted">{card.title}</p>
              <div className="mt-3 space-y-1">
                {card.metrics.map((metric) => (
                  <div key={metric.label} className="flex items-center justify-between text-sm">
                    <span className="text-textTone-secondary">{metric.label}</span>
                    <span className="font-semibold text-textTone-primary">{metric.value}</span>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </DataState>
    </TerminalCard>
  );
}
