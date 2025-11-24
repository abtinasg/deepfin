'use client';

import { useEffect, useState } from 'react';
import { ProfessionalTradingChart } from '@/components/charts/professional-trading-chart';
import { OHLCVData } from '@/types/chart';

export default function SimpleChartTest() {
  const [chartData, setChartData] = useState<OHLCVData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate simple test data
    const generateTestData = () => {
      const data: OHLCVData[] = [];
      const now = Math.floor(Date.now() / 1000);
      const dayInSeconds = 24 * 60 * 60;
      
      let price = 150;
      
      for (let i = 100; i >= 0; i--) {
        const time = now - (i * dayInSeconds);
        const change = (Math.random() - 0.5) * 5;
        const open = price;
        const close = price + change;
        const high = Math.max(open, close) + Math.random() * 3;
        const low = Math.min(open, close) - Math.random() * 3;
        
        data.push({
          time: time as any,
          open: parseFloat(open.toFixed(2)),
          high: parseFloat(high.toFixed(2)),
          low: parseFloat(low.toFixed(2)),
          close: parseFloat(close.toFixed(2)),
          volume: Math.floor(1000000 + Math.random() * 5000000),
        });
        
        price = close;
      }
      
      return data;
    };

    try {
      const data = generateTestData();
      console.log('Generated test data:', data.length, 'candles');
      setChartData(data);
    } catch (error) {
      console.error('Error generating test data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading chart...</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">No Data</h2>
          <p>Failed to generate chart data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen p-6 bg-gray-50">
      <div className="h-full">
        <ProfessionalTradingChart
          ticker="TEST"
          name="Test Stock"
          initialData={chartData}
          onTimeframeChange={(tf) => console.log('Timeframe changed:', tf)}
          onSaveLayout={() => console.log('Save layout clicked')}
        />
      </div>
    </div>
  );
}
