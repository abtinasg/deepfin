'use client';

import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import type { StockChartData, TimeFrame } from '@/types/stock';

interface PriceChartProps {
  ticker: string;
  timeframe?: TimeFrame;
  onTimeframeChange?: (timeframe: TimeFrame) => void;
}

const timeframes: TimeFrame[] = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

export function PriceChart({ 
  ticker, 
  timeframe = '1Y',
  onTimeframeChange 
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const { data, isLoading } = useQuery<StockChartData[]>({
    queryKey: ['stock-chart', ticker, timeframe],
    queryFn: async () => {
      const response = await fetch(`/api/stock/${ticker}/chart?timeframe=${timeframe}`);
      if (!response.ok) throw new Error('Failed to fetch chart data');
      return response.json();
    },
    refetchInterval: timeframe === '1D' ? 5000 : undefined, // Only refetch for 1D view
  });

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      rightPriceScale: {
        borderColor: '#e0e0e0',
      },
      timeScale: {
        borderColor: '#e0e0e0',
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1,
      },
    });

    chartRef.current = chart;

    // Create candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    seriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!data || !seriesRef.current) return;

    const chartData = data.map((point) => ({
      time: Math.floor(point.timestamp / 1000) as any, // Convert to seconds
      open: point.open,
      high: point.high,
      low: point.low,
      close: point.close,
    }));

    seriesRef.current.setData(chartData);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  return (
    <div className="bg-white rounded-2xl border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Price Chart</h2>
        
        {/* Timeframe Selector */}
        <div className="flex gap-2">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange?.(tf)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                timeframe === tf
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading chart data...</p>
          </div>
        </div>
      ) : (
        <div ref={chartContainerRef} className="w-full" />
      )}
    </div>
  );
}
