'use client';

import { useState } from 'react';
import { ChartType } from '@/types/chart';

interface ChartTypeControlsProps {
  selected: ChartType;
  onChange: (type: ChartType) => void;
}

const CHART_TYPES: { value: ChartType; label: string; icon: string }[] = [
  { value: 'candlestick', label: 'Candlestick', icon: '📊' },
  { value: 'line', label: 'Line', icon: '📈' },
  { value: 'area', label: 'Area', icon: '📉' },
  { value: 'bar', label: 'Bar', icon: '📏' },
];

export function ChartTypeControls({ selected, onChange }: ChartTypeControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedType = CHART_TYPES.find((t) => t.value === selected) || CHART_TYPES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <span>{selectedType.icon}</span>
        <span>{selectedType.label}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            {CHART_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => {
                  onChange(type.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                  type.value === selected ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                } ${
                  type === CHART_TYPES[0] ? 'rounded-t-lg' : ''
                } ${
                  type === CHART_TYPES[CHART_TYPES.length - 1] ? 'rounded-b-lg' : ''
                }`}
              >
                <span className="text-xl">{type.icon}</span>
                <span className="font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
