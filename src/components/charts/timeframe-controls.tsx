'use client';

import { useState } from 'react';
import { Timeframe } from '@/types/chart';

interface TimeframeControlsProps {
  selected: Timeframe;
  onChange: (timeframe: Timeframe) => void;
}

const TIMEFRAMES: { value: Timeframe; label: string }[] = [
  { value: '1m', label: '1m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '30m', label: '30m' },
  { value: '1h', label: '1h' },
  { value: '4h', label: '4h' },
  { value: '1D', label: '1D' },
  { value: '1W', label: '1W' },
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: '1Y', label: '1Y' },
  { value: '5Y', label: '5Y' },
  { value: 'All', label: 'All' },
];

export function TimeframeControls({ selected, onChange }: TimeframeControlsProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf.value}
          onClick={() => onChange(tf.value)}
          className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
            selected === tf.value
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {tf.label}
        </button>
      ))}
    </div>
  );
}
