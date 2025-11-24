import { Drawing, DrawingType, Point } from '@/types/chart';
import { IChartApi, ISeriesApi, LineStyle, Time } from 'lightweight-charts';

/**
 * Drawing Tools Manager
 * Handles interactive drawing tools on charts
 */
export class DrawingToolsManager {
  private chart: IChartApi;
  private drawings: Map<string, Drawing> = new Map();
  private currentTool: DrawingType | null = null;
  private tempPoints: Point[] = [];
  private drawingEnabled = false;

  constructor(chart: IChartApi) {
    this.chart = chart;
  }

  /**
   * Set active drawing tool
   */
  setTool(tool: DrawingType | null): void {
    this.currentTool = tool;
    this.tempPoints = [];
    this.drawingEnabled = tool !== null;
  }

  /**
   * Add a drawing
   */
  addDrawing(drawing: Drawing): void {
    this.drawings.set(drawing.id, drawing);
    this.renderDrawing(drawing);
  }

  /**
   * Remove a drawing
   */
  removeDrawing(id: string): void {
    this.drawings.delete(id);
    // In a full implementation, you'd track and remove the series/shape
  }

  /**
   * Render a drawing on the chart
   */
  private renderDrawing(drawing: Drawing): void {
    switch (drawing.type) {
      case 'horizontal-line':
        this.drawHorizontalLine(drawing);
        break;
      case 'vertical-line':
        this.drawVerticalLine(drawing);
        break;
      case 'trend-line':
        this.drawTrendLine(drawing);
        break;
      case 'fibonacci-retracement':
        this.drawFibonacciRetracement(drawing);
        break;
      case 'fibonacci-extension':
        this.drawFibonacciExtension(drawing);
        break;
      case 'rectangle':
        this.drawRectangle(drawing);
        break;
      case 'triangle':
        this.drawTriangle(drawing);
        break;
      case 'text':
        this.drawText(drawing);
        break;
    }
  }

  /**
   * Draw horizontal line
   */
  private drawHorizontalLine(drawing: Drawing): void {
    if (drawing.points.length === 0) return;

    try {
      const price = drawing.points[0].price;
      console.log(`Drawing horizontal line at price: ${price}`);
      
      // Create a line series that spans the visible range
      const lineSeries = this.chart.addLineSeries({
        color: drawing.color || '#2196F3',
        lineStyle: LineStyle.Solid,
        priceLineVisible: true,
        lastValueVisible: false,
      });

      // Get time scale range
      const timeScale = this.chart.timeScale();
      const visibleRange = timeScale.getVisibleRange();
      
      if (visibleRange) {
        // Draw line across visible range
        const points = [
          { time: visibleRange.from as Time, value: price },
          { time: visibleRange.to as Time, value: price },
        ].sort((a, b) => (a.time as number) - (b.time as number));
        lineSeries.setData(points);
      }
      
      console.log('Horizontal line drawn successfully');
    } catch (error) {
      console.error('Error drawing horizontal line:', error);
    }
  }

  /**
   * Draw vertical line
   */
  private drawVerticalLine(drawing: Drawing): void {
    if (drawing.points.length === 0) return;

    // Note: Lightweight Charts doesn't support vertical lines directly
    // You would need to implement custom rendering
  }

  /**
   * Draw trend line
   */
  private drawTrendLine(drawing: Drawing): void {
    if (drawing.points.length < 2) {
      console.warn('Not enough points for trend line');
      return;
    }

    try {
      const [start, end] = drawing.points;
      console.log(`Drawing trend line from ${start.time} (${start.price}) to ${end.time} (${end.price})`);

      // Create line series for trend line
      const lineSeries = this.chart.addLineSeries({
        color: drawing.color || '#2196F3',
        lineStyle: LineStyle.Solid,
        priceLineVisible: false,
        lastValueVisible: false,
      });

      // Sort points by time (ascending) - required by TradingView
      const sortedPoints = [
        { time: start.time, value: start.price },
        { time: end.time, value: end.price },
      ].sort((a, b) => (a.time as number) - (b.time as number));

      lineSeries.setData(sortedPoints);
      
      console.log('Trend line drawn successfully');
    } catch (error) {
      console.error('Error drawing trend line:', error);
    }
  }

  /**
   * Draw Fibonacci retracement
   */
  private drawFibonacciRetracement(drawing: Drawing): void {
    if (drawing.points.length < 2) return;

    const [start, end] = drawing.points;
    const diff = end.price - start.price;
    
    const fibLevels = [
      { level: 0, label: '0%' },
      { level: 0.236, label: '23.6%' },
      { level: 0.382, label: '38.2%' },
      { level: 0.5, label: '50%' },
      { level: 0.618, label: '61.8%' },
      { level: 0.786, label: '78.6%' },
      { level: 1, label: '100%' },
    ];

    const colors = [
      '#F44336',
      '#FF9800',
      '#FFC107',
      '#4CAF50',
      '#2196F3',
      '#9C27B0',
      '#E91E63',
    ];

    fibLevels.forEach((fib, index) => {
      const price = start.price + diff * fib.level;
      
      // Draw horizontal line for each Fibonacci level
      const lineSeries = this.chart.addLineSeries({
        color: colors[index],
        lineStyle: LineStyle.Dashed,
        priceLineVisible: false,
        lastValueVisible: false,
      });

      const points = [
        { time: start.time, value: price },
        { time: end.time, value: price },
      ].sort((a, b) => (a.time as number) - (b.time as number));
      lineSeries.setData(points);
    });
  }

  /**
   * Draw Fibonacci extension
   */
  private drawFibonacciExtension(drawing: Drawing): void {
    if (drawing.points.length < 3) return;

    // Similar to retracement but uses 3 points for projection
    // Implementation would calculate extensions beyond 100%
  }

  /**
   * Draw rectangle
   */
  private drawRectangle(drawing: Drawing): void {
    if (drawing.points.length < 2) return;

    const [topLeft, bottomRight] = drawing.points;

    // Draw top line
    const topSeries = this.chart.addLineSeries({
      color: drawing.color || '#2196F3',
      lineStyle: LineStyle.Solid,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    const topPoints = [
      { time: topLeft.time, value: topLeft.price },
      { time: bottomRight.time, value: topLeft.price },
    ].sort((a, b) => (a.time as number) - (b.time as number));
    topSeries.setData(topPoints);

    // Draw bottom line
    const bottomSeries = this.chart.addLineSeries({
      color: drawing.color || '#2196F3',
      lineStyle: LineStyle.Solid,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    const bottomPoints = [
      { time: topLeft.time, value: bottomRight.price },
      { time: bottomRight.time, value: bottomRight.price },
    ].sort((a, b) => (a.time as number) - (b.time as number));
    bottomSeries.setData(bottomPoints);

    // Note: Vertical lines would need custom rendering
  }

  /**
   * Draw triangle
   */
  private drawTriangle(drawing: Drawing): void {
    if (drawing.points.length < 3) return;

    // Connect the three points
    const [p1, p2, p3] = drawing.points;

    // Draw three lines to form a triangle
    const lines = [
      [p1, p2],
      [p2, p3],
      [p3, p1],
    ];

    lines.forEach(([start, end]) => {
      const lineSeries = this.chart.addLineSeries({
        color: drawing.color || '#2196F3',
        lineStyle: LineStyle.Solid,
        priceLineVisible: false,
        lastValueVisible: false,
      });

      const points = [
        { time: start.time, value: start.price },
        { time: end.time, value: end.price },
      ].sort((a, b) => (a.time as number) - (b.time as number));
      lineSeries.setData(points);
    });
  }

  /**
   * Draw text annotation
   */
  private drawText(drawing: Drawing): void {
    if (drawing.points.length === 0 || !drawing.text) return;

    // Note: Lightweight Charts doesn't support text annotations directly
    // You would need to implement this with DOM overlays
    // positioned absolutely over the chart
  }

  /**
   * Handle click event
   */
  handleClick(time: Time, price: number): void {
    if (!this.drawingEnabled || !this.currentTool) {
      console.log('Drawing disabled or no tool selected');
      return;
    }

    const point: Point = { time, price };
    this.tempPoints.push(point);
    console.log(`Drawing point added: ${this.tempPoints.length}/${this.getRequiredPoints(this.currentTool)} - Price: ${price}`);

    // Determine if we have enough points for the current tool
    const requiredPoints = this.getRequiredPoints(this.currentTool);
    
    if (this.tempPoints.length === requiredPoints) {
      // Create the drawing
      const drawing: Drawing = {
        id: `drawing-${Date.now()}`,
        type: this.currentTool,
        points: [...this.tempPoints],
        color: '#2196F3',
        lineWidth: 2,
      };

      console.log(`Drawing completed: ${this.currentTool}`, drawing);
      this.addDrawing(drawing);
      this.tempPoints = [];
    }
  }

  /**
   * Get required number of points for a drawing tool
   */
  private getRequiredPoints(tool: DrawingType): number {
    switch (tool) {
      case 'horizontal-line':
      case 'vertical-line':
      case 'text':
        return 1;
      case 'trend-line':
      case 'rectangle':
      case 'fibonacci-retracement':
        return 2;
      case 'triangle':
      case 'fibonacci-extension':
        return 3;
      default:
        return 1;
    }
  }

  /**
   * Get all drawings
   */
  getDrawings(): Drawing[] {
    return Array.from(this.drawings.values());
  }

  /**
   * Clear all drawings
   */
  clearAll(): void {
    this.drawings.clear();
    // In a full implementation, remove all drawing series
  }

  /**
   * Export drawings
   */
  exportDrawings(): Drawing[] {
    return this.getDrawings();
  }

  /**
   * Import drawings
   */
  importDrawings(drawings: Drawing[]): void {
    drawings.forEach((drawing) => {
      this.addDrawing(drawing);
    });
  }
}
