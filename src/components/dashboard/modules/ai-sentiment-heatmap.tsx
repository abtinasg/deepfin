"use client";

import { Fragment } from 'react';
import { TerminalCard } from '@/components/shared/terminal-card';
import { DataState } from '@/components/shared/data-state';
import { SkeletonBlock } from '@/components/shared/skeletons';
import { SentimentDatum } from '@/types/dashboard';

const fallbackSentiment: SentimentDatum[] = [
  { ticker: 'NVDA', sentiment: 78, change: 6.2, volume: 240 },
  { ticker: 'MSFT', sentiment: 64, change: 2.1, volume: 180 },
  { ticker: 'AAPL', sentiment: 52, change: 1.4, volume: 210 },
  { ticker: 'TSLA', sentiment: -34, change: -4.3, volume: 260 },
  { ticker: 'META', sentiment: 41, change: 3.1, volume: 122 },
  { ticker: 'AMZN', sentiment: 55, change: 2.4, volume: 190 },
  { ticker: 'SMCI', sentiment: 83, change: 8.2, volume: 44 },
  { ticker: 'NFLX', sentiment: 28, change: 0.4, volume: 77 },
  { ticker: 'AMD', sentiment: 12, change: -1.1, volume: 143 },
  { ticker: 'BA', sentiment: -52, change: -7.5, volume: 65 },
  { ticker: 'JPM', sentiment: 22, change: 1.2, volume: 88 },
  { ticker: 'GS', sentiment: 35, change: 3.3, volume: 61 },
];

const getTileColor = (sentiment: number, alpha = 1) => {
  const normalized = Math.max(-100, Math.min(100, sentiment));
  const hue = (normalized + 100) * 0.6; // map to 0-120 (red-green)
  const saturation = 65;
  const lightness = 35 + (Math.abs(normalized) / 100) * 20;
  return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
};

export function AISentimentHeatmap({ data = fallbackSentiment, isLoading = false }: { data?: SentimentDatum[]; isLoading?: boolean }) {
  return (
    <TerminalCard title="AI SENTIMENT" subtitle="News + social tone" toolbar={<SentimentLegend />}>
      <DataState
        isLoading={isLoading}
        skeleton={<SkeletonBlock className="h-[220px]" />}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {data.map((tile) => (
            <div
              key={tile.ticker}
              className="rounded-2xl p-3 text-center shadow-soft"
              style={{
                backgroundColor: getTileColor(tile.sentiment, 0.15),
                border: `1px solid ${getTileColor(tile.sentiment, 0.35)}`,
              }}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-textTone-muted">{tile.ticker}</p>
              <p className="mono-metric text-2xl font-semibold text-textTone-primary">{tile.sentiment > 0 ? '+' : ''}{tile.sentiment}</p>
              <p className="text-[11px] text-textTone-secondary">{tile.change ? `${tile.change > 0 ? '+' : ''}${tile.change.toFixed(1)} pts` : 'stable'}</p>
            </div>
          ))}
        </div>
      </DataState>
    </TerminalCard>
  );
}

function SentimentLegend() {
  const bands = [
    { label: 'Bearish', value: -60 },
    { label: 'Neutral', value: 0 },
    { label: 'Bullish', value: 70 },
  ];
  return (
    <div className="flex items-center gap-3 text-[11px] text-textTone-muted">
      {bands.map((band) => (
        <Fragment key={band.label}>
          <span
            className="h-2 w-6 rounded-full"
            style={{ backgroundColor: getTileColor(band.value) }}
          />
          <span>{band.label}</span>
        </Fragment>
      ))}
    </div>
  );
}
