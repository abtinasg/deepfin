"use client";

import { RiskMeterDatum } from '@/types/dashboard';
import { TerminalCard, TerminalCardKpi } from '@/components/shared/terminal-card';
import { DataState } from '@/components/shared/data-state';
import { SkeletonBlock } from '@/components/shared/skeletons';

const fallbackRisk: RiskMeterDatum[] = [
  { label: 'DeepFin Alpha', score: 68, change: -4.1, driver: 'Earnings momentum' },
  { label: 'MegaCap Tech', score: 42, change: 2.3, driver: 'Volatility compression' },
  { label: 'AI Basket', score: 74, change: 5.6, driver: 'Flows + sentiment' },
];

export function PredictiveRiskMeter({ data = fallbackRisk, isLoading = false }: { data?: RiskMeterDatum[]; isLoading?: boolean }) {
  const primary = data[0];
  return (
    <TerminalCard title="PREDICTIVE RISK" subtitle="0 – 100 risk score" toolbar={<p className="text-xs text-textTone-muted">Live AI telemetry</p>}>
      <DataState isLoading={isLoading} skeleton={<SkeletonBlock className="h-[180px]" />}>
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          {primary && (
            <div className="flex flex-1 items-center gap-6">
              <Gauge score={primary.score} />
              <div className="space-y-2">
                <TerminalCardKpi label={primary.label} value={`${primary.score}/100`} change={primary.driver} />
                <p className="text-sm text-textTone-secondary">
                  {primary.change ? `${primary.change > 0 ? '+' : ''}${primary.change.toFixed(1)} pts vs. 5d` : 'Stable vs. 5d'}
                </p>
              </div>
            </div>
          )}
          <div className="flex flex-1 flex-col gap-3">
            {data.slice(1).map((bucket) => (
              <div key={bucket.label} className="flex items-center justify-between rounded-2xl border border-surface-2/60 bg-surface-1/70 px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-textTone-primary">{bucket.label}</p>
                  <p className="text-xs text-textTone-muted">{bucket.driver}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-textTone-primary">{bucket.score}</p>
                  <p className="text-[11px] text-textTone-muted">{bucket.change ? `${bucket.change > 0 ? '+' : ''}${bucket.change.toFixed(1)} pts` : 'flat'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DataState>
    </TerminalCard>
  );
}

function Gauge({ score }: { score: number }) {
  const normalized = Math.max(0, Math.min(100, score));
  const sweep = (normalized / 100) * 360;
  const gradient = `conic-gradient(hsl(var(--positive)) 0deg ${sweep}deg, hsl(var(--negative)) ${sweep}deg 360deg)`;
  const tone = normalized > 60 ? 'text-positive' : normalized < 35 ? 'text-negative' : 'text-textTone-secondary';

  return (
    <div className="relative h-36 w-36">
      <div className="absolute inset-0 rounded-full border border-surface-2/70 bg-layer-1/70 p-2">
        <div className="h-full w-full rounded-full" style={{ backgroundImage: gradient }} />
      </div>
      <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-layer-0">
        <p className={`mono-metric text-3xl font-semibold ${tone}`}>{normalized}</p>
        <p className="text-xs text-textTone-muted">score</p>
      </div>
    </div>
  );
}
