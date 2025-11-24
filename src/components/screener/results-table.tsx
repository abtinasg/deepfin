'use client';

import { Stock } from '@/types/screener';
import { useState } from 'react';

interface ResultsTableProps {
  stocks: Stock[];
  selectedRows: string[];
  onRowSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  sortBy: { field: keyof Stock; order: 'asc' | 'desc' };
  onSort: (field: keyof Stock) => void;
  page: number;
  perPage: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

export function ResultsTable({
  stocks,
  selectedRows,
  onRowSelect,
  onSelectAll,
  sortBy,
  onSort,
  page,
  perPage,
  totalCount,
  onPageChange,
  onPerPageChange,
}: ResultsTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const totalPages = Math.ceil(totalCount / perPage);
  const startIndex = (page - 1) * perPage + 1;
  const endIndex = Math.min(page * perPage, totalCount);

  const isAllSelected = stocks.length > 0 && stocks.every((s) => selectedRows.includes(s.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectAll([]);
    } else {
      onSelectAll(stocks.map((s) => s.id));
    }
  };

  const getSortIcon = (field: keyof Stock) => {
    if (sortBy.field !== field) return '↕';
    return sortBy.order === 'asc' ? '↑' : '↓';
  };

  const formatNumber = (num: number, decimals = 2) => {
    return num.toFixed(decimals);
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1_000_000_000_000) {
      return `$${(num / 1_000_000_000_000).toFixed(2)}T`;
    }
    if (num >= 1_000_000_000) {
      return `$${(num / 1_000_000_000).toFixed(2)}B`;
    }
    if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(2)}M`;
    }
    return `$${num.toFixed(2)}`;
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (page > 3) {
        pages.push('...');
      }
      
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      
      if (page < totalPages - 2) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="flex-1 bg-white border border-gray-200 rounded-lg flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Results</h2>
          <span className="text-sm text-gray-500">
            {totalCount} {totalCount === 1 ? 'stock' : 'stocks'} found
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Save Screen
          </button>
          <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left w-12">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
              </th>
              <th
                onClick={() => onSort('ticker')}
                className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:text-gray-900 select-none"
              >
                Ticker {getSortIcon('ticker')}
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Company</th>
              <th
                onClick={() => onSort('price')}
                className="px-4 py-3 text-right font-semibold text-gray-700 cursor-pointer hover:text-gray-900 select-none"
              >
                Price {getSortIcon('price')}
              </th>
              <th
                onClick={() => onSort('changePercent')}
                className="px-4 py-3 text-right font-semibold text-gray-700 cursor-pointer hover:text-gray-900 select-none"
              >
                Change {getSortIcon('changePercent')}
              </th>
              <th
                onClick={() => onSort('marketCap')}
                className="px-4 py-3 text-right font-semibold text-gray-700 cursor-pointer hover:text-gray-900 select-none"
              >
                Market Cap {getSortIcon('marketCap')}
              </th>
              <th
                onClick={() => onSort('pe')}
                className="px-4 py-3 text-right font-semibold text-gray-700 cursor-pointer hover:text-gray-900 select-none"
              >
                P/E {getSortIcon('pe')}
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Volume</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stocks.map((stock) => (
              <tr
                key={stock.id}
                onMouseEnter={() => setHoveredRow(stock.id)}
                onMouseLeave={() => setHoveredRow(null)}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(stock.id)}
                    onChange={() => onRowSelect(stock.id)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                  />
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono font-bold text-gray-900">{stock.ticker}</span>
                </td>
                <td className="px-4 py-3 text-gray-700">{stock.name}</td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900">
                  ${formatNumber(stock.price)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`font-semibold ${
                      stock.changePercent > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stock.changePercent > 0 ? '▲' : '▼'}{' '}
                    {formatNumber(Math.abs(stock.changePercent))}%
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-700">
                  {formatLargeNumber(stock.marketCap)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-700">
                  {stock.pe ? formatNumber(stock.pe) : '—'}
                </td>
                <td className="px-4 py-3 text-right text-gray-700">
                  {formatNumber(stock.volume)}M
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-600 hover:text-blue-600"
                      title="Add to watchlist"
                    >
                      ⭐
                    </button>
                    <button
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-600 hover:text-blue-600"
                      title="View chart"
                    >
                      📈
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rows per page:</span>
          <select
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {startIndex}-{endIndex} of {totalCount}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ‹ Prev
            </button>
            {getPageNumbers().map((pageNum, index) =>
              typeof pageNum === 'number' ? (
                <button
                  key={index}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-1 rounded text-sm ${
                    page === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              ) : (
                <span key={index} className="px-3 py-1 text-gray-400">
                  {pageNum}
                </span>
              )
            )}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next ›
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedRows.length > 0 && (
        <div className="p-4 bg-blue-50 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-900 font-medium">
              {selectedRows.length} {selectedRows.length === 1 ? 'stock' : 'stocks'} selected
            </span>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium">
                Add All to Watchlist
              </button>
              <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm hover:bg-blue-50 transition-colors font-medium">
                Compare
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors font-medium">
                Export Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
