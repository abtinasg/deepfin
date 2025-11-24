'use client';

import { useState, useMemo, useCallback } from 'react';
import { FilterPanel } from '@/components/screener/filter-panel';
import { ResultsTable } from '@/components/screener/results-table';
import { ScreenerFilters, Stock } from '@/types/screener';
import { MOCK_STOCKS } from '@/lib/mock-stocks';

const initialFilters: ScreenerFilters = {
  marketCap: [],
  peRatio: {},
  priceRange: {},
  sectors: [],
  technical: [],
  dividendYield: {},
  volume: {},
};

export default function ScreenerClient() {
  const [filters, setFilters] = useState<ScreenerFilters>(initialFilters);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<{ field: keyof Stock; order: 'asc' | 'desc' }>({
    field: 'marketCap',
    order: 'desc',
  });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  // Filter stocks based on active filters
  const filteredStocks = useMemo(() => {
    let result = [...MOCK_STOCKS];

    // Market Cap filter
    if (filters.marketCap.length > 0 && !filters.marketCap.includes('all')) {
      result = result.filter((stock) => {
        return filters.marketCap.some((capType) => {
          if (capType === 'mega') return stock.marketCap > 200_000_000_000;
          if (capType === 'large')
            return stock.marketCap >= 10_000_000_000 && stock.marketCap <= 200_000_000_000;
          if (capType === 'mid')
            return stock.marketCap >= 2_000_000_000 && stock.marketCap < 10_000_000_000;
          if (capType === 'small') return stock.marketCap < 2_000_000_000;
          return true;
        });
      });
    }

    // P/E Ratio filter
    if (filters.peRatio.min !== undefined || filters.peRatio.max !== undefined) {
      result = result.filter((stock) => {
        if (stock.pe === null) return false;
        if (filters.peRatio.min !== undefined && stock.pe < filters.peRatio.min) return false;
        if (filters.peRatio.max !== undefined && stock.pe > filters.peRatio.max) return false;
        return true;
      });
    }

    // Sectors filter
    if (filters.sectors.length > 0) {
      result = result.filter((stock) => filters.sectors.includes(stock.sector));
    }

    // Technical indicators filter
    if (filters.technical.length > 0) {
      result = result.filter((stock) => {
        return filters.technical.every((indicator) => {
          if (indicator === 'rsi_overbought') return stock.rsi !== null && stock.rsi > 70;
          if (indicator === 'rsi_oversold') return stock.rsi !== null && stock.rsi < 30;
          if (indicator === 'above_50ma') return stock.aboveFiftyDayMA;
          if (indicator === 'above_200ma') return stock.aboveTwoHundredDayMA;
          if (indicator === 'macd_bullish') return stock.macdSignal === 'bullish';
          if (indicator === 'volume_high') return stock.volume > 30; // Arbitrary threshold
          return true;
        });
      });
    }

    return result;
  }, [filters]);

  // Sort stocks
  const sortedStocks = useMemo(() => {
    const sorted = [...filteredStocks];
    sorted.sort((a, b) => {
      const aVal = a[sortBy.field];
      const bVal = b[sortBy.field];

      // Handle null values
      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortBy.order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortBy.order === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
    return sorted;
  }, [filteredStocks, sortBy]);

  // Paginate stocks
  const paginatedStocks = useMemo(() => {
    const startIndex = (page - 1) * perPage;
    return sortedStocks.slice(startIndex, startIndex + perPage);
  }, [sortedStocks, page, perPage]);

  const handleFiltersChange = useCallback((newFilters: ScreenerFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(initialFilters);
    setPage(1);
  }, []);

  const handleRowSelect = useCallback((id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback((ids: string[]) => {
    setSelectedRows(ids);
  }, []);

  const handleSort = useCallback(
    (field: keyof Stock) => {
      setSortBy((prev) => ({
        field,
        order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc',
      }));
    },
    []
  );

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stock Screener</h1>
            <p className="text-sm text-gray-500 mt-1">
              Filter and discover stocks based on your criteria
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Load Saved Screen
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Save Current Screen
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <FilterPanel
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleResetFilters}
        />
        <ResultsTable
          stocks={paginatedStocks}
          selectedRows={selectedRows}
          onRowSelect={handleRowSelect}
          onSelectAll={handleSelectAll}
          sortBy={sortBy}
          onSort={handleSort}
          page={page}
          perPage={perPage}
          totalCount={sortedStocks.length}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
        />
      </div>
    </div>
  );
}
