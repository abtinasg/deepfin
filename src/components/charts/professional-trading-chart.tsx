'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ChartManager } from '@/lib/chart-manager';
import { DrawingToolsManager } from '@/lib/drawing-tools';
import { 
  OHLCVData, 
  ChartType, 
  Timeframe, 
  IndicatorConfig, 
  IndicatorType,
  DrawingType,
} from '@/types/chart';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
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
  BarChart3,
  LineChart,
  AreaChart,
  X,
  Maximize2,
} from 'lucide-react';

interface ProfessionalTradingChartProps {
  ticker: string;
  name?: string;
  initialData: OHLCVData[];
  onTimeframeChange?: (timeframe: Timeframe) => void;
  onSaveLayout?: () => void;
}

const TIMEFRAMES: Timeframe[] = ['1m', '5m', '15m', '30m', '1h', '4h', '1D', '1W', '1M', '3M', '6M', '1Y', '5Y', 'All'];

const CHART_TYPES: { type: ChartType; label: string; icon: any }[] = [
  { type: 'candlestick', label: 'Candlestick', icon: BarChart3 },
  { type: 'line', label: 'Line', icon: LineChart },
  { type: 'area', label: 'Area', icon: AreaChart },
  { type: 'bar', label: 'OHLC', icon: BarChart3 },
  { type: 'heikin-ashi', label: 'Heikin Ashi', icon: BarChart3 },
];

const INDICATORS: { type: IndicatorType; label: string; category: string }[] = [
  { type: 'SMA', label: 'Simple Moving Average', category: 'Moving Averages' },
  { type: 'EMA', label: 'Exponential Moving Average', category: 'Moving Averages' },
  { type: 'WMA', label: 'Weighted Moving Average', category: 'Moving Averages' },
  { type: 'RSI', label: 'Relative Strength Index', category: 'Momentum' },
  { type: 'MACD', label: 'MACD', category: 'Momentum' },
  { type: 'Stochastic', label: 'Stochastic Oscillator', category: 'Momentum' },
  { type: 'CCI', label: 'Commodity Channel Index', category: 'Momentum' },
  { type: 'BollingerBands', label: 'Bollinger Bands', category: 'Volatility' },
  { type: 'ATR', label: 'Average True Range', category: 'Volatility' },
  { type: 'KeltnerChannels', label: 'Keltner Channels', category: 'Volatility' },
  { type: 'OBV', label: 'On-Balance Volume', category: 'Volume' },
  { type: 'VWAP', label: 'VWAP', category: 'Volume' },
  { type: 'ADX', label: 'Average Directional Index', category: 'Trend' },
  { type: 'ParabolicSAR', label: 'Parabolic SAR', category: 'Trend' },
  { type: 'IchimokuCloud', label: 'Ichimoku Cloud', category: 'Trend' },
];

const DRAWING_TOOLS: { type: DrawingType; label: string; icon: any }[] = [
  { type: 'horizontal-line', label: 'Horizontal Line', icon: Ruler },
  { type: 'vertical-line', label: 'Vertical Line', icon: Ruler },
  { type: 'trend-line', label: 'Trend Line', icon: Pencil },
  { type: 'fibonacci-retracement', label: 'Fibonacci Retracement', icon: Triangle },
  { type: 'fibonacci-extension', label: 'Fibonacci Extension', icon: Triangle },
  { type: 'rectangle', label: 'Rectangle', icon: Settings },
  { type: 'triangle', label: 'Triangle', icon: Triangle },
  { type: 'text', label: 'Text', icon: Pencil },
];

export function ProfessionalTradingChart({
  ticker,
  name = 'Stock',
  initialData,
  onTimeframeChange,
  onSaveLayout,
}: ProfessionalTradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const volumeContainerRef = useRef<HTMLDivElement>(null);
  const chartManagerRef = useRef<ChartManager | null>(null);
  const drawingToolsRef = useRef<DrawingToolsManager | null>(null);

  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1D');
  const [selectedChartType, setSelectedChartType] = useState<ChartType>('candlestick');
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0);
  const [activeIndicators, setActiveIndicators] = useState<IndicatorConfig[]>([]);
  const [showIndicatorMenu, setShowIndicatorMenu] = useState(false);
  const [showDrawingTools, setShowDrawingTools] = useState(false);
  const [showChartTypeMenu, setShowChartTypeMenu] = useState(false);
  const [activeDrawingTool, setActiveDrawingTool] = useState<DrawingType | null>(null);
  const [showVolume, setShowVolume] = useState(true);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chartManager = new ChartManager();
    
    try {
      chartManager.initialize(
        chartContainerRef.current,
        showVolume ? volumeContainerRef.current || undefined : undefined,
        'dark'
      );
      
      chartManagerRef.current = chartManager;

      // Load initial data
      if (initialData.length > 0) {
        chartManager.loadData(initialData, selectedChartType);
        updatePriceInfo(initialData);
      }
    } catch (error) {
      console.error('Error initializing chart:', error);
    }

    return () => {
      try {
        chartManager.destroy();
      } catch (error) {
        console.error('Error destroying chart:', error);
      }
    };
  }, [showVolume]);

  // Update data when it changes
  useEffect(() => {
    if (chartManagerRef.current && initialData.length > 0) {
      try {
        chartManagerRef.current.loadData(initialData, selectedChartType);
        updatePriceInfo(initialData);
      } catch (error) {
        console.error('Error loading chart data:', error);
      }
    }
  }, [initialData, selectedChartType]);

  // Setup click handler for drawing tools
  useEffect(() => {
    const chart = chartManagerRef.current?.getState().chart;
    if (!chart) return;

    const clickHandler = (param: any) => {
      if (!drawingToolsRef.current || !activeDrawingTool) return;
      
      if (param.time && param.point) {
        // Get price from seriesData - try candlestick first, then line/area
        let price = 0;
        if (param.seriesData && param.seriesData.size > 0) {
          const seriesData: any = Array.from(param.seriesData.values())[0];
          if (seriesData && 'close' in seriesData) {
            price = seriesData.close as number;
          } else if (seriesData && 'value' in seriesData) {
            price = seriesData.value as number;
          }
        }
        
        if (price > 0) {
          drawingToolsRef.current.handleClick(param.time, price);
          toast(`Drawing point added at $${price.toFixed(2)}`, 'info');
        }
      }
    };

    chart.subscribeClick(clickHandler);

    return () => {
      chart.unsubscribeClick(clickHandler);
    };
  }, [activeDrawingTool]);

  // Update price info
  const updatePriceInfo = (data: OHLCVData[]) => {
    if (data.length < 2) return;
    
    const lastCandle = data[data.length - 1];
    const prevCandle = data[data.length - 2];
    
    setCurrentPrice(lastCandle.close);
    const change = lastCandle.close - prevCandle.close;
    const changePercent = (change / prevCandle.close) * 100;
    setPriceChange(change);
    setPriceChangePercent(changePercent);
  };

  // Handle timeframe change
  const handleTimeframeChange = (timeframe: Timeframe) => {
    setSelectedTimeframe(timeframe);
    onTimeframeChange?.(timeframe);
  };

  // Handle chart type change
  const handleChartTypeChange = (chartType: ChartType) => {
    setSelectedChartType(chartType);
  };

  // Add indicator
  const handleAddIndicator = (type: IndicatorType) => {
    if (!chartManagerRef.current) return;

    const config: IndicatorConfig = {
      id: `${type}-${Date.now()}`,
      type,
      params: getDefaultParams(type),
      visible: true,
      color: getIndicatorColor(activeIndicators.length),
    };

    chartManagerRef.current.addIndicator(config);
    setActiveIndicators([...activeIndicators, config]);
    setShowIndicatorMenu(false);
    toast(`Indicator ${type} added`, 'success');
  };

  // Remove indicator
  const handleRemoveIndicator = (id: string) => {
    if (!chartManagerRef.current) return;

    chartManagerRef.current.removeIndicator(id);
    setActiveIndicators(activeIndicators.filter(ind => ind.id !== id));
    toast('Indicator removed', 'info');
  };

  // Handle drawing tool selection
  const handleSelectDrawingTool = useCallback((tool: DrawingType) => {
    setActiveDrawingTool(tool);
    setShowDrawingTools(false);
    
    if (chartManagerRef.current && chartManagerRef.current.getState().chart) {
      // Initialize drawing tools manager if not exists
      if (!drawingToolsRef.current) {
        drawingToolsRef.current = new DrawingToolsManager(chartManagerRef.current.getState().chart!);
      }
      drawingToolsRef.current.setTool(tool);
      toast(`Drawing tool ${tool} activated - Click on chart to draw`, 'info');
      console.log(`Drawing tool activated: ${tool}`);
    }
  }, []);

  // Cancel active drawing tool
  const handleCancelDrawingTool = () => {
    setActiveDrawingTool(null);
    if (drawingToolsRef.current) {
      drawingToolsRef.current.setTool(null);
    }
    toast('Drawing tool cancelled', 'info');
  };

  // Handle export chart
  const handleExportChart = () => {
    if (!chartContainerRef.current) return;
    
    try {
      // Use html2canvas or similar library to capture chart
      // For now, we'll use the browser's built-in functionality
      const link = document.createElement('a');
      link.download = `${ticker}-chart-${new Date().toISOString()}.png`;
      
      // Simple notification for now - in production use html2canvas
      toast('برای export کامل، html2canvas نصب کنید: npm install html2canvas', 'info');
      
      console.log('Export chart clicked');
    } catch (error) {
      console.error('Error exporting chart:', error);
      toast('Error exporting chart', 'error');
    }
  };

  // Handle fullscreen
  const handleFullscreen = () => {
    if (!chartContainerRef.current) return;
    
    const container = chartContainerRef.current.parentElement?.parentElement;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Get default parameters for indicators
  const getDefaultParams = (type: IndicatorType): Record<string, any> => {
    switch (type) {
      case 'SMA':
      case 'EMA':
      case 'WMA':
        return { period: 20, source: 'close' };
      case 'RSI':
        return { period: 14, overbought: 70, oversold: 30 };
      case 'MACD':
        return { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 };
      case 'BollingerBands':
        return { period: 20, stdDev: 2, source: 'close' };
      case 'Stochastic':
        return { kPeriod: 14, dPeriod: 3, smooth: 3 };
      case 'ATR':
        return { period: 14 };
      case 'ADX':
        return { period: 14 };
      default:
        return {};
    }
  };

  // Get indicator color
  const getIndicatorColor = (index: number): string => {
    const colors = ['#2196F3', '#FF9800', '#4CAF50', '#9C27B0', '#F44336', '#00BCD4'];
    return colors[index % colors.length];
  };

  const isPositive = priceChange >= 0;

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Main Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 bg-card border rounded-md shadow-sm gap-4 sm:gap-0">
        <div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto no-scrollbar">
          {/* Price Info */}
          <div className="flex flex-col min-w-[100px]">
            <span className="text-lg font-bold leading-none">${currentPrice.toFixed(2)}</span>
            <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
            </div>
          </div>

          <div className="h-8 w-px bg-border shrink-0" />

          {/* Timeframes */}
          <div className="flex items-center gap-1">
            {TIMEFRAMES.slice(0, 8).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => handleTimeframeChange(timeframe)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  selectedTimeframe === timeframe 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
                }`}
              >
                {timeframe}
              </button>
            ))}
            <div className="hidden xl:flex items-center gap-1">
              {TIMEFRAMES.slice(8).map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => handleTimeframeChange(timeframe)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    selectedTimeframe === timeframe 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
                  }`}
                >
                  {timeframe}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tools */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Chart Type */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 gap-2 px-2"
              onClick={() => setShowChartTypeMenu(!showChartTypeMenu)}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden lg:inline">{CHART_TYPES.find(ct => ct.type === selectedChartType)?.label}</span>
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
            
            {showChartTypeMenu && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-popover border rounded-md shadow-md z-50 py-1">
                {CHART_TYPES.map((chartType) => {
                  const Icon = chartType.icon;
                  return (
                    <button
                      key={chartType.type}
                      onClick={() => {
                        handleChartTypeChange(chartType.type);
                        setShowChartTypeMenu(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-accent hover:text-accent-foreground text-sm ${
                        selectedChartType === chartType.type ? 'bg-accent/50 text-accent-foreground' : ''
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {chartType.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Indicators */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowIndicatorMenu(!showIndicatorMenu)}
              className="h-8 gap-2 px-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden lg:inline">Indicators</span>
              {activeIndicators.length > 0 && (
                <span className="bg-primary text-primary-foreground text-[10px] px-1.5 rounded-full">
                  {activeIndicators.length}
                </span>
              )}
            </Button>
            
            {showIndicatorMenu && (
              <div className="absolute top-full right-0 mt-1 w-64 bg-popover border rounded-md shadow-md z-50 max-h-96 overflow-y-auto py-1">
                {Object.entries(
                  INDICATORS.reduce((acc, ind) => {
                    if (!acc[ind.category]) acc[ind.category] = [];
                    acc[ind.category].push(ind);
                    return acc;
                  }, {} as Record<string, typeof INDICATORS>)
                ).map(([category, indicators]) => (
                  <div key={category} className="p-2">
                    <div className="font-semibold text-xs text-muted-foreground mb-1 px-2 uppercase tracking-wider">{category}</div>
                    {indicators.map((ind) => (
                      <button
                        key={ind.type}
                        onClick={() => handleAddIndicator(ind.type)}
                        className="w-full text-left px-3 py-1.5 hover:bg-accent hover:text-accent-foreground rounded-sm text-sm transition-colors"
                      >
                        {ind.label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Drawing Tools */}
          <div className="relative">
            <Button 
              variant={activeDrawingTool ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setShowDrawingTools(!showDrawingTools)}
              className="h-8 gap-2 px-2"
            >
              <Pencil className="w-4 h-4" />
              <span className="hidden lg:inline">{activeDrawingTool || 'Draw'}</span>
            </Button>
            
            {showDrawingTools && (
              <div className="absolute top-full right-0 mt-1 w-56 bg-popover border rounded-md shadow-md z-50 py-1">
                {activeDrawingTool && (
                  <button
                    onClick={() => {
                      setActiveDrawingTool(null);
                      if (drawingToolsRef.current) {
                        drawingToolsRef.current.setTool(null);
                      }
                      setShowDrawingTools(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-destructive/10 text-destructive text-sm border-b"
                  >
                    <X className="w-4 h-4" />
                    Cancel Drawing
                  </button>
                )}
                {DRAWING_TOOLS.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.type}
                      onClick={() => handleSelectDrawingTool(tool.type)}
                      className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-accent hover:text-accent-foreground text-sm ${
                        activeDrawingTool === tool.type ? 'bg-accent text-accent-foreground' : ''
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tool.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-border" />

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleExportChart}>
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleFullscreen}>
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Active Indicators Bar */}
      {activeIndicators.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto py-1 px-1">
          {activeIndicators.map((ind) => (
            <div
              key={ind.id}
              className="flex items-center gap-1.5 px-2 py-1 bg-accent/50 border rounded-full text-xs whitespace-nowrap"
            >
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: ind.color }}
              />
              <span className="font-medium">{ind.type}</span>
              <button
                onClick={() => handleRemoveIndicator(ind.id)}
                className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Chart Container */}
      <div className="flex-1 border rounded-md overflow-hidden relative bg-card shadow-sm">
        {/* Active Drawing Tool Banner */}
        {activeDrawingTool && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-primary text-primary-foreground px-4 py-1.5 rounded-full shadow-lg flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Pencil className="w-3 h-3" />
              <span className="font-medium">Drawing Mode: {activeDrawingTool}</span>
            </div>
            <button
              onClick={handleCancelDrawingTool}
              className="hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        
        <div className="h-full flex flex-col">
          <div 
            ref={chartContainerRef} 
            className="flex-1 min-h-0"
          />
          {showVolume && (
            <div 
              ref={volumeContainerRef} 
              className="h-[15%] border-t min-h-[60px]"
            />
          )}
        </div>
      </div>
    </div>
  );
}
