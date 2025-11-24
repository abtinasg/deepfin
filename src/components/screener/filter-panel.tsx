'use client';

import { useState } from 'react';
import {
  ScreenerFilters,
  MARKET_CAP_OPTIONS,
  SECTORS,
  TECHNICAL_INDICATORS,
  FILTER_TEMPLATES,
} from '@/types/screener';

interface FilterPanelProps {
  filters: ScreenerFilters;
  onFiltersChange: (filters: ScreenerFilters) => void;
  onReset: () => void;
}

export function FilterPanel({ filters, onFiltersChange, onReset }: FilterPanelProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleMarketCapChange = (value: string) => {
    const newMarketCap = filters.marketCap.includes(value)
      ? filters.marketCap.filter((v) => v !== value)
      : [...filters.marketCap, value];
    onFiltersChange({ ...filters, marketCap: newMarketCap });
  };

  const handlePERatioChange = (field: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    onFiltersChange({
      ...filters,
      peRatio: { ...filters.peRatio, [field]: numValue },
    });
  };

  const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    onFiltersChange({ ...filters, sectors: selected });
  };

  const handleTechnicalChange = (value: string) => {
    const newTechnical = filters.technical.includes(value)
      ? filters.technical.filter((v) => v !== value)
      : [...filters.technical, value];
    onFiltersChange({ ...filters, technical: newTechnical });
  };

  const handleTemplateClick = (templateFilters: Partial<ScreenerFilters>) => {
    onFiltersChange({ ...filters, ...templateFilters });
  };

  const removeFilter = (filterKey: string) => {
    if (filterKey.startsWith('peRatio')) {
      onFiltersChange({ ...filters, peRatio: {} });
    } else if (filterKey.startsWith('sector_')) {
      const sector = filterKey.replace('sector_', '');
      onFiltersChange({
        ...filters,
        sectors: filters.sectors.filter((s) => s !== sector),
      });
    } else if (filterKey.startsWith('tech_')) {
      const tech = filterKey.replace('tech_', '');
      onFiltersChange({
        ...filters,
        technical: filters.technical.filter((t) => t !== tech),
      });
    }
  };

  // Calculate active filters for badges
  const getActiveFilterBadges = () => {
    const badges: { key: string; label: string }[] = [];

    if (filters.peRatio.min !== undefined || filters.peRatio.max !== undefined) {
      let label = 'P/E: ';
      if (filters.peRatio.min !== undefined && filters.peRatio.max !== undefined) {
        label += `${filters.peRatio.min}-${filters.peRatio.max}`;
      } else if (filters.peRatio.min !== undefined) {
        label += `> ${filters.peRatio.min}`;
      } else {
        label += `< ${filters.peRatio.max}`;
      }
      badges.push({ key: 'peRatio', label });
    }

    filters.sectors.forEach((sector) => {
      badges.push({ key: `sector_${sector}`, label: sector });
    });

    filters.technical.forEach((tech) => {
      const indicator = TECHNICAL_INDICATORS.find((t) => t.value === tech);
      if (indicator) {
        badges.push({ key: `tech_${tech}`, label: indicator.label });
      }
    });

    return badges;
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto h-full">
      {/* Active Filters Badges */}
      {getActiveFilterBadges().length > 0 && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <h3 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wide">
            Active Filters
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {getActiveFilterBadges().map((badge) => (
              <span
                key={badge.key}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1"
              >
                {badge.label}
                <button
                  onClick={() => removeFilter(badge.key)}
                  className="hover:text-blue-900 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Market Cap Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Market Cap</h3>
        <div className="space-y-2">
          {MARKET_CAP_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
            >
              <input
                type="checkbox"
                checked={filters.marketCap.includes(option.value)}
                onChange={() => handleMarketCapChange(option.value)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* P/E Ratio Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">P/E Ratio</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.peRatio.min ?? ''}
            onChange={(e) => handlePERatioChange('min', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-gray-400">—</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.peRatio.max ?? ''}
            onChange={(e) => handlePERatioChange('max', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Technical Indicators Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Technical Indicators</h3>
        <div className="space-y-2">
          {TECHNICAL_INDICATORS.map((indicator) => (
            <label
              key={indicator.value}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
            >
              <input
                type="checkbox"
                checked={filters.technical.includes(indicator.value)}
                onChange={() => handleTechnicalChange(indicator.value)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{indicator.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sectors Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Sectors</h3>
        <select
          multiple
          value={filters.sectors}
          onChange={handleSectorChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {SECTORS.map((sector) => (
            <option key={sector} value={sector}>
              {sector}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">Hold Cmd/Ctrl to select multiple</p>
      </div>

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        Reset All Filters
      </button>

      {/* Templates Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Templates</h3>
        <div className="space-y-2">
          {FILTER_TEMPLATES.map((template) => (
            <button
              key={template.name}
              onClick={() => handleTemplateClick(template.filters)}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{template.icon}</span>
                <span className="text-sm font-medium text-gray-900">{template.name}</span>
              </div>
              <div className="text-xs text-gray-500 pl-7">{template.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
