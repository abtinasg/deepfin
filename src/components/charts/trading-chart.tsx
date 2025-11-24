'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { ChartManager } from '@/lib/chart-manager';
import { DrawingToolsManager } from '@/lib/drawing-tools';
import { OHLCVData, ChartType, Timeframe, IndicatorConfig, ChartPreset, CHART_PRESETS } from '@/types/chart';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  ChevronDown,
  Plus,
  Save,
  Download,
  Settings,
  Pencil,
  Ruler,
  Triangle,
} from 'lucide-react';

interface TradingChartProps {
  ticker: string;
  name?: string;
  initialData: OHLCVData[];
  data?: OHLCVData[];
  chartType?: ChartType;
  showVolume?: boolean;
  height?: number;
  onTimeframeChange?: (timeframe: Timeframe) => void;
  onSaveLayout?: () => void;
}

export function TradingChart({
  ticker,
  initialData,
  data,
  chartType = 'candlestick',
  showVolume = true,
  height = 500,
}: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const volumeContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const volumeChartRef = useRef<IChartApi | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);

  // Use data if provided, otherwise use initialData
  const chartData = data || initialData;

  useEffect(() => {
    if (!chartContainerRef.current || !chartData || chartData.length === 0) return;

    // Create main chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: showVolume ? height * 0.7 : height,
      layout: {
        background: { color: '#FFFFFF' },
        textColor: '#191919',
      },
      grid: {
        vertLines: { color: '#F0F0F0' },
        horzLines: { color: '#F0F0F0' },
      },
      rightPriceScale: {
        borderColor: '#D1D4DC',
      },
      timeScale: {
        borderColor: '#D1D4DC',
        timeVisible: true,
      },
    });

    chartRef.current = chart;

    // Add series based on chart type
    let mainSeries: any;
    if (chartType === 'candlestick' || chartType === 'bar') {
      mainSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: chartType === 'bar',
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });
      mainSeries.setData(chartData);
    } else if (chartType === 'line') {
      mainSeries = chart.addLineSeries({
        color: '#2196F3',
        lineWidth: 2,
      });
      const lineData = chartData.map(d => ({ time: d.time, value: d.close }));
      mainSeries.setData(lineData);
    } else if (chartType === 'area') {
      mainSeries = chart.addAreaSeries({
        topColor: 'rgba(33, 150, 243, 0.56)',
        bottomColor: 'rgba(33, 150, 243, 0.04)',
        lineColor: 'rgba(33, 150, 243, 1)',
        lineWidth: 2,
      });
      const areaData = chartData.map(d => ({ time: d.time, value: d.close }));
      mainSeries.setData(areaData);
    }

    // Update current price
    if (chartData.length > 0) {
      const lastCandle = chartData[chartData.length - 1];
      const prevCandle = chartData[chartData.length - 2];
      setCurrentPrice(lastCandle.close);
      if (prevCandle) {
        const change = lastCandle.close - prevCandle.close;
        setPriceChange((change / prevCandle.close) * 100);
      }
    }

    // Create volume chart
    if (showVolume && volumeContainerRef.current) {
      const volumeChart = createChart(volumeContainerRef.current, {
        width: volumeContainerRef.current.clientWidth,
        height: height * 0.3,
        layout: {
          background: { color: '#FFFFFF' },
          textColor: '#191919',
        },
        grid: {
          vertLines: { color: '#F0F0F0' },
          horzLines: { color: '#F0F0F0' },
        },
        rightPriceScale: {
          borderColor: '#D1D4DC',
        },
        timeScale: {
          borderColor: '#D1D4DC',
          visible: false,
        },
      });

      volumeChartRef.current = volumeChart;

      const volumeData = chartData.map((d, i) => ({
        time: d.time,
        value: d.volume,
        color: i > 0 && d.close >= chartData[i - 1].close 
          ? 'rgba(38, 166, 154, 0.5)' 
          : 'rgba(239, 83, 80, 0.5)',
      }));

      const volumeSeries = volumeChart.addHistogramSeries({
        priceFormat: {
          type: 'volume',
        },
      });
      volumeSeries.setData(volumeData);

      // Sync time scales
      chart.timeScale().subscribeVisibleLogicalRangeChange((timeRange) => {
        if (timeRange) {
          volumeChart.timeScale().setVisibleLogicalRange(timeRange);
        }
      });
    }

    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
      if (volumeContainerRef.current && volumeChartRef.current) {
        volumeChartRef.current.applyOptions({
          width: volumeContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      if (volumeChartRef.current) {
        volumeChartRef.current.remove();
      }
    };
  }, [chartData, chartType, showVolume, height]);

  return (
    <div className="w-full">
      {/* Price Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{ticker}</h2>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">
              ${currentPrice.toFixed(2)}
            </span>
            <span
              className={`text-lg font-semibold ${
                priceChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div ref={chartContainerRef} className="w-full border border-gray-200 rounded-lg" />

      {/* Volume Container */}
      {showVolume && (
        <div
          ref={volumeContainerRef}
          className="w-full mt-2 border border-gray-200 rounded-lg"
        />
      )}
    </div>
  );
}
