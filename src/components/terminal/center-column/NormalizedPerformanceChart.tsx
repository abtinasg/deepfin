'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  LineStyle,
} from 'lightweight-charts';
import { TerminalModule } from '../TerminalModule';
import { useYahooMultiChart, normalizeChartData, ChartInterval, ChartRange } from '@/hooks/use-yahoo-chart';
import { Search, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TickerSelection {
  symbol: string;
  color: string;
  visible: boolean;
}

// Default colors for chart lines (Bloomberg-style)
const DEFAULT_COLORS = [
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#3b82f6', // blue-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
];

const TIME_RANGES: { label: string; interval: ChartInterval; range: ChartRange }[] = [
  { label: '1D', interval: '5m', range: '1d' },
  { label: '5D', interval: '15m', range: '5d' },
  { label: '1M', interval: '1h', range: '1mo' },
  { label: '3M', interval: '1d', range: '3mo' },
  { label: '6M', interval: '1d', range: '6mo' },
  { label: 'YTD', interval: '1d', range: 'ytd' },
  { label: '1Y', interval: '1d', range: '1y' },
  { label: '5Y', interval: '1wk', range: '5y' },
  { label: 'MAX', interval: '1mo', range: 'max' },
];

/**
 * NormalizedPerformanceChart - Main terminal chart
 * Multi-ticker comparison with normalized performance (base 100)
 */
export function NormalizedPerformanceChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesMapRef = useRef<Map<string, ISeriesApi<'Line'>>>(new Map());

  // State
  const [selectedTickers, setSelectedTickers] = useState<TickerSelection[]>([
    { symbol: '^GSPC', color: DEFAULT_COLORS[0], visible: true },
    { symbol: '^IXIC', color: DEFAULT_COLORS[1], visible: true },
    { symbol: '^DJI', color: DEFAULT_COLORS[2], visible: true },
  ]);
  const [selectedTimeRange, setSelectedTimeRange] = useState(1); // 5D default
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const timeConfig = TIME_RANGES[selectedTimeRange];

  // Fetch data for all selected tickers
  const symbols = useMemo(
    () => selectedTickers.filter((t) => t.visible).map((t) => t.symbol),
    [selectedTickers]
  );

  const { data: chartsData, isLoading } = useYahooMultiChart(
    symbols,
    timeConfig.interval,
    timeConfig.range
  );

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0B1121' },
        textColor: '#64748b',
        fontSize: 11,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      },
      grid: {
        vertLines: {
          color: 'rgba(255, 255, 255, 0.03)',
          style: LineStyle.Solid,
        },
        horzLines: {
          color: 'rgba(255, 255, 255, 0.03)',
          style: LineStyle.Solid,
        },
      },
      crosshair: {
        mode: 0,
        vertLine: {
          color: 'rgba(255, 255, 255, 0.1)',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#1e293b',
        },
        horzLine: {
          color: 'rgba(255, 255, 255, 0.1)',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#1e293b',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.06)',
        textColor: '#94a3b8',
        visible: true,
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.06)',
        textColor: '#94a3b8',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    // Auto-resize
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Update chart data
  useEffect(() => {
    if (!chartRef.current || !chartsData) return;

    const chart = chartRef.current;

    // Clear existing series
    seriesMapRef.current.forEach((series) => {
      chart.removeSeries(series);
    });
    seriesMapRef.current.clear();

    // Add series for each ticker
    chartsData.forEach((tickerData, index) => {
      const ticker = selectedTickers.find((t) => t.symbol === tickerData.meta.symbol);
      if (!ticker || !ticker.visible) return;

      const normalized = normalizeChartData(tickerData);
      if (normalized.values.length === 0) return;

      const series = chart.addLineSeries({
        color: ticker.color,
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        lastValueVisible: true,
        priceLineVisible: false,
        title: ticker.symbol,
      });

      const data = normalized.timestamps.map((time, i) => ({
        time: time as any,
        value: normalized.values[i],
      }));

      series.setData(data);
      seriesMapRef.current.set(ticker.symbol, series);
    });

    // Fit content
    chart.timeScale().fitContent();
  }, [chartsData, selectedTickers]);

  // Add ticker
  const handleAddTicker = (symbol: string) => {
    if (!symbol) return;

    const normalized = symbol.toUpperCase().trim();
    if (selectedTickers.find((t) => t.symbol === normalized)) {
      return; // Already exists
    }

    if (selectedTickers.length >= 10) {
      alert('Maximum 10 tickers allowed');
      return;
    }

    const colorIndex = selectedTickers.length % DEFAULT_COLORS.length;
    setSelectedTickers([
      ...selectedTickers,
      { symbol: normalized, color: DEFAULT_COLORS[colorIndex], visible: true },
    ]);
    setSearchQuery('');
    setShowSearch(false);
  };

  // Remove ticker
  const handleRemoveTicker = (symbol: string) => {
    setSelectedTickers(selectedTickers.filter((t) => t.symbol !== symbol));
  };

  // Toggle ticker visibility
  const handleToggleTicker = (symbol: string) => {
    setSelectedTickers(
      selectedTickers.map((t) =>
        t.symbol === symbol ? { ...t, visible: !t.visible } : t
      )
    );
  };

  return (
    <TerminalModule
      title="Normalized Performance"
      subtitle={`${timeConfig.label} View`}
      height="640px"
      isLive={!isLoading}
      actions={
        <div className="flex items-center gap-2">
          {/* Time range selector */}
          <div className="flex items-center gap-1">
            {TIME_RANGES.map((range, index) => (
              <button
                key={range.label}
                onClick={() => setSelectedTimeRange(index)}
                className={`px-2 py-1 rounded text-terminal-xs font-medium transition ${
                  selectedTimeRange === index
                    ? 'bg-indigo-500/20 text-indigo-400 shadow-indigo-glow'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Add ticker button */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/[0.05] transition"
            title="Add ticker"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      }
    >
      <div className="h-full flex flex-col">
        {/* Ticker legend */}
        <div className="flex items-center gap-3 mb-2 px-2 flex-wrap">
          {selectedTickers.map((ticker) => (
            <div
              key={ticker.symbol}
              className="flex items-center gap-2 group"
            >
              <button
                onClick={() => handleToggleTicker(ticker.symbol)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded transition ${
                  ticker.visible
                    ? 'bg-white/[0.03] hover:bg-white/[0.05]'
                    : 'opacity-40 hover:opacity-60'
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: ticker.color }}
                />
                <span className="text-terminal-xs font-mono text-slate-300">
                  {ticker.symbol}
                </span>
              </button>
              <button
                onClick={() => handleRemoveTicker(ticker.symbol)}
                className="p-0.5 rounded opacity-0 group-hover:opacity-100 transition text-slate-500 hover:text-rose-400"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Search input */}
        {showSearch && (
          <div className="mb-2 px-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <Input
                  type="text"
                  placeholder="Enter ticker symbol (e.g., AAPL, MSFT)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTicker(searchQuery);
                    } else if (e.key === 'Escape') {
                      setShowSearch(false);
                      setSearchQuery('');
                    }
                  }}
                  className="pl-8 h-8 text-terminal-xs bg-layer-2 border-white/10"
                  autoFocus
                />
              </div>
              <Button
                size="sm"
                onClick={() => handleAddTicker(searchQuery)}
                className="h-8"
              >
                Add
              </Button>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="flex-1 relative">
          <div ref={chartContainerRef} className="absolute inset-0" />

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-layer-1/80 flex items-center justify-center">
              <div className="text-terminal-sm text-slate-400">Loading chart data...</div>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && chartsData && chartsData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-terminal-base text-slate-400">No data available</p>
                <p className="text-terminal-sm text-slate-600 mt-1">
                  Try different tickers or time range
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </TerminalModule>
  );
}
