import {
  createChart,
  IChartApi,
  ISeriesApi,
  ColorType,
  LineStyle,
  CrosshairMode,
} from 'lightweight-charts';
import {
  ChartConfig,
  ChartType,
  OHLCVData,
  LineData,
  IndicatorConfig,
  IndicatorResult,
  Drawing,
  ComparisonStock,
  ChartState,
} from '@/types/chart';
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateStochastic,
  calculateATR,
  calculateOBV,
  calculateVWAP,
} from './indicators';

export class ChartManager {
  private state: ChartState = {
    chart: null,
    candlestickSeries: null,
    volumeSeries: null,
    lineSeries: null,
    areaSeries: null,
    indicators: new Map(),
    drawings: [],
    comparisons: new Map(),
  };

  private container: HTMLElement | null = null;
  private volumeContainer: HTMLElement | null = null;
  private volumeChart: IChartApi | null = null;
  private currentData: OHLCVData[] = [];

  /**
   * Initialize the chart
   */
  initialize(container: HTMLElement, volumeContainer?: HTMLElement, theme: 'light' | 'dark' = 'dark'): void {
    if (!container) {
      console.error('Chart container is required');
      return;
    }

    this.container = container;
    this.volumeContainer = volumeContainer || null;

    // Ensure container has dimensions
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    const isDark = theme === 'dark';
    const backgroundColor = isDark ? '#1e1e1e' : '#FFFFFF';
    const textColor = isDark ? '#d1d5db' : '#191919';
    const gridColor = isDark ? '#2B2B43' : '#F0F0F0';
    const borderColor = isDark ? '#2B2B43' : '#D1D4DC';

    // Create main chart
    this.state.chart = createChart(container, {
      width,
      height,
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor: textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          width: 1,
          color: isDark ? '#555' : '#9598A1',
          style: LineStyle.Dashed,
        },
        horzLine: {
          width: 1,
          color: isDark ? '#555' : '#9598A1',
          style: LineStyle.Dashed,
        },
      },
      rightPriceScale: {
        borderColor: borderColor,
      },
      timeScale: {
        borderColor: borderColor,
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Create volume chart if container provided
    if (volumeContainer) {
      this.volumeChart = createChart(volumeContainer, {
        width: volumeContainer.clientWidth,
        height: volumeContainer.clientHeight,
        layout: {
          background: { type: ColorType.Solid, color: backgroundColor },
          textColor: textColor,
        },
        grid: {
          vertLines: { color: gridColor },
          horzLines: { color: gridColor },
        },
        rightPriceScale: {
          borderColor: borderColor,
        },
        timeScale: {
          borderColor: borderColor,
          visible: false,
        },
      });

      // Sync time scales
      this.state.chart.timeScale().subscribeVisibleLogicalRangeChange((timeRange) => {
        if (this.volumeChart && timeRange) {
          this.volumeChart.timeScale().setVisibleLogicalRange(timeRange);
        }
      });
    }

    // Handle resize
    const resizeObserver = new ResizeObserver((entries) => {
      if (this.state.chart && this.container) {
        this.state.chart.applyOptions({
          width: this.container.clientWidth,
          height: this.container.clientHeight,
        });
      }
      if (this.volumeChart && this.volumeContainer) {
        this.volumeChart.applyOptions({
          width: this.volumeContainer.clientWidth,
          height: this.volumeContainer.clientHeight,
        });
      }
    });

    resizeObserver.observe(container);
    if (volumeContainer) {
      resizeObserver.observe(volumeContainer);
    }
  }

  /**
   * Load data and display chart
   */
  loadData(data: OHLCVData[], chartType: ChartType = 'candlestick'): void {
    if (!this.state.chart) {
      console.error('Chart not initialized');
      return;
    }

    if (!data || data.length === 0) {
      console.warn('No data to load');
      return;
    }

    this.currentData = data;
    this.clearSeries();

    switch (chartType) {
      case 'candlestick':
        this.state.candlestickSeries = this.state.chart.addCandlestickSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
        });
        this.state.candlestickSeries.setData(data);
        break;

      case 'line':
        this.state.lineSeries = this.state.chart.addLineSeries({
          color: '#2196F3',
          lineWidth: 2,
        });
        const lineData = data.map((d) => ({ time: d.time, value: d.close }));
        this.state.lineSeries.setData(lineData);
        break;

      case 'area':
        this.state.areaSeries = this.state.chart.addAreaSeries({
          topColor: 'rgba(33, 150, 243, 0.56)',
          bottomColor: 'rgba(33, 150, 243, 0.04)',
          lineColor: 'rgba(33, 150, 243, 1)',
          lineWidth: 2,
        });
        const areaData = data.map((d) => ({ time: d.time, value: d.close }));
        this.state.areaSeries.setData(areaData);
        break;

      case 'bar':
        this.state.candlestickSeries = this.state.chart.addCandlestickSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: true,
          wickVisible: false,
        });
        this.state.candlestickSeries.setData(data);
        break;

      case 'heikin-ashi':
        // Import and use the calculateHeikinAshi function
        const { calculateHeikinAshi } = require('./indicators');
        const haData = calculateHeikinAshi(data);
        this.state.candlestickSeries = this.state.chart.addCandlestickSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
        });
        this.state.candlestickSeries.setData(haData);
        break;
    }

    // Load volume
    this.loadVolume(data);

    // Fit content
    this.state.chart.timeScale().fitContent();
  }

  /**
   * Load volume chart
   */
  private loadVolume(data: OHLCVData[]): void {
    if (!this.volumeChart) return;

    const volumeData = data.map((d, i) => ({
      time: d.time,
      value: d.volume,
      color: i > 0 && d.close >= data[i - 1].close ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)',
    }));

    this.state.volumeSeries = this.volumeChart.addHistogramSeries({
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });

    this.state.volumeSeries.setData(volumeData);
  }

  /**
   * Add technical indicator
   */
  addIndicator(config: IndicatorConfig): void {
    if (!this.state.chart) {
      console.error('Chart not initialized');
      return;
    }
    
    if (this.currentData.length === 0) {
      console.warn('No data available for indicator');
      return;
    }

    let data: LineData[] = [];
    let series: ISeriesApi<'Line'> | null = null;

    try {
      switch (config.type) {
        case 'SMA':
          data = calculateSMA(this.currentData, config.params.period || 20, config.params.source || 'close');
          if (data.length > 0) {
            series = this.state.chart.addLineSeries({
              color: config.color || '#2196F3',
              lineWidth: 2,
              title: `SMA(${config.params.period || 20})`,
            });
            series.setData(data);
          }
          break;

        case 'EMA':
          data = calculateEMA(this.currentData, config.params.period || 20, config.params.source || 'close');
          if (data.length > 0) {
            series = this.state.chart.addLineSeries({
              color: config.color || '#FF9800',
              lineWidth: 2,
              title: `EMA(${config.params.period || 20})`,
            });
            series.setData(data);
          }
          break;

      case 'RSI':
        data = calculateRSI(this.currentData, config.params.period);
        // RSI needs a separate pane - for now, we'll skip the series creation
        // In a full implementation, you'd create a separate chart panel
        break;

      case 'MACD':
        const macd = calculateMACD(
          this.currentData,
          config.params.fastPeriod,
          config.params.slowPeriod,
          config.params.signalPeriod
        );
        // MACD needs a separate pane
        break;

      case 'BollingerBands':
        const bb = calculateBollingerBands(
          this.currentData,
          config.params.period,
          config.params.stdDev,
          config.params.source
        );
        
        // Add three lines
        const upperSeries = this.state.chart.addLineSeries({
          color: config.color || '#2196F3',
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          title: 'BB Upper',
        });
        upperSeries.setData(bb.upper);

        const middleSeries = this.state.chart.addLineSeries({
          color: config.color || '#2196F3',
          lineWidth: 2,
          title: `BB(${config.params.period})`,
        });
        middleSeries.setData(bb.middle);

        const lowerSeries = this.state.chart.addLineSeries({
          color: config.color || '#2196F3',
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          title: 'BB Lower',
        });
        lowerSeries.setData(bb.lower);
        
        series = middleSeries;
        data = bb.middle;
        break;

      case 'ATR':
        data = calculateATR(this.currentData, config.params.period);
        break;

      case 'OBV':
        data = calculateOBV(this.currentData);
        break;

        case 'VWAP':
          data = calculateVWAP(this.currentData);
          if (data.length > 0) {
            series = this.state.chart.addLineSeries({
              color: config.color || '#9C27B0',
              lineWidth: 2,
              title: 'VWAP',
            });
            series.setData(data);
          }
          break;
          
        default:
          console.warn(`Indicator type ${config.type} not yet implemented`);
          return;
      }

      if (series || data.length > 0) {
        this.state.indicators.set(config.id, {
          id: config.id,
          type: config.type,
          data,
          series: series || undefined,
        });
        console.log(`Added indicator: ${config.type}`);
      }
    } catch (error) {
      console.error(`Error adding indicator ${config.type}:`, error);
    }
  }

  /**
   * Remove indicator
   */
  removeIndicator(id: string): void {
    const indicator = this.state.indicators.get(id);
    if (indicator && indicator.series && this.state.chart) {
      this.state.chart.removeSeries(indicator.series);
    }
    this.state.indicators.delete(id);
  }

  /**
   * Add comparison stock
   */
  addComparison(ticker: string, data: OHLCVData[], color: string): void {
    if (!this.state.chart) return;

    // Normalize data to percentage change from first price
    const firstPrice = data[0].close;
    const normalizedData: LineData[] = data.map((d) => ({
      time: d.time,
      value: ((d.close - firstPrice) / firstPrice) * 100,
    }));

    const series = this.state.chart.addLineSeries({
      color,
      lineWidth: 2,
      title: ticker,
    });
    series.setData(normalizedData);

    const currentPrice = data[data.length - 1].close;
    const change = currentPrice - firstPrice;
    const changePercent = (change / firstPrice) * 100;

    this.state.comparisons.set(ticker, {
      ticker,
      color,
      data: normalizedData,
      currentPrice,
      change,
      changePercent,
    });
  }

  /**
   * Remove comparison
   */
  removeComparison(ticker: string): void {
    this.state.comparisons.delete(ticker);
    // Note: In a full implementation, track and remove the series
  }

  /**
   * Clear all series
   */
  private clearSeries(): void {
    if (!this.state.chart) return;

    if (this.state.candlestickSeries) {
      this.state.chart.removeSeries(this.state.candlestickSeries);
      this.state.candlestickSeries = null;
    }
    if (this.state.lineSeries) {
      this.state.chart.removeSeries(this.state.lineSeries);
      this.state.lineSeries = null;
    }
    if (this.state.areaSeries) {
      this.state.chart.removeSeries(this.state.areaSeries);
      this.state.areaSeries = null;
    }

    // Clear indicators
    this.state.indicators.forEach((indicator) => {
      if (indicator.series) {
        this.state.chart!.removeSeries(indicator.series);
      }
    });
    this.state.indicators.clear();
  }

  /**
   * Update chart theme
   */
  setTheme(darkMode: boolean): void {
    if (!this.state.chart) return;

    const backgroundColor = darkMode ? '#1E1E1E' : '#FFFFFF';
    const textColor = darkMode ? '#D1D4DC' : '#191919';
    const gridColor = darkMode ? '#2B2B2B' : '#F0F0F0';

    this.state.chart.applyOptions({
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
    });

    if (this.volumeChart) {
      this.volumeChart.applyOptions({
        layout: {
          background: { type: ColorType.Solid, color: backgroundColor },
          textColor,
        },
        grid: {
          vertLines: { color: gridColor },
          horzLines: { color: gridColor },
        },
      });
    }
  }

  /**
   * Get current state
   */
  getState(): ChartState {
    return this.state;
  }

  /**
   * Destroy chart
   */
  destroy(): void {
    if (this.state.chart) {
      this.state.chart.remove();
      this.state.chart = null;
    }
    if (this.volumeChart) {
      this.volumeChart.remove();
      this.volumeChart = null;
    }
  }
}
