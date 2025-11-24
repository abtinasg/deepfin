'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { OHLCVData } from '@/types/chart';
import type { IndicatorType } from '@/types/indicators';
import { LineChart } from 'lucide-react';

// Import indicators library
import {
  IndicatorRegistry,
  calculateIndicators,
  IndicatorPresets,
  SignalDetector,
  getIndicatorConfig,
} from '@/lib/indicators/index';

export default function IndicatorDemoPage() {
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorType>('SMA');
  const [indicatorResult, setIndicatorResult] = useState<any>(null);
  const [sampleData, setSampleData] = useState<OHLCVData[]>([]);

  // Generate sample data
  useEffect(() => {
    const data: OHLCVData[] = [];
    let price = 100;
    
    for (let i = 0; i < 100; i++) {
      const change = (Math.random() - 0.5) * 4;
      price += change;
      
      const high = price + Math.random() * 2;
      const low = price - Math.random() * 2;
      
      data.push({
        time: (Date.now() / 1000 - (100 - i) * 3600) as any,
        open: price,
        high,
        low,
        close: price + (Math.random() - 0.5),
        volume: Math.floor(Math.random() * 100000),
      });
    }
    
    setSampleData(data);
  }, []);

  // Calculate indicator when selection changes
  useEffect(() => {
    if (sampleData.length === 0) return;

    try {
      const results = calculateIndicators(sampleData, [
        { type: selectedIndicator, params: {} },
      ]);

      const result = results.get(selectedIndicator);
      setIndicatorResult(result);
    } catch (error) {
      console.error('Error calculating indicator:', error);
    }
  }, [selectedIndicator, sampleData]);

  const allIndicators = IndicatorRegistry.getAll();
  const config = getIndicatorConfig(selectedIndicator);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Technical Indicators Library Demo
          </h1>
          <p className="text-gray-600 mt-2">
            18+ indicators with factory pattern, caching, and signal detection
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Indicator Selection */}
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Select Indicator</h2>

            {/* By Category */}
            {['overlay', 'oscillator', 'volume'].map((category) => {
              const categoryIndicators = allIndicators.filter(
                (ind) => ind.config.type === category
              );

              return (
                <div key={category} className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700 uppercase">
                    {category}
                  </h3>
                  <div className="space-y-1">
                    {categoryIndicators.map((ind) => (
                      <button
                        key={ind.type}
                        onClick={() => setSelectedIndicator(ind.type)}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          selectedIndicator === ind.type
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {ind.config.shortName} - {ind.config.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Presets</h3>
              {Object.entries(IndicatorPresets).map(([key, preset]) => (
                <button
                  key={key}
                  className="w-full text-left px-3 py-2 mb-1 rounded text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors flex items-center gap-2"
                  onClick={() => {
                    const results = calculateIndicators(sampleData, preset.indicators);
                    console.log(`${preset.name} results:`, results);
                    alert(`Calculated ${preset.indicators.length} indicators for ${preset.name}`);
                  }}
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/60 text-purple-700">
                    <LineChart className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Main Content - Indicator Details */}
          <Card className="p-6 lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">{config.name}</h2>
              <p className="text-gray-600 mt-1">{config.description}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                  {config.type}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  {config.shortName}
                </span>
              </div>
            </div>

            {/* Configuration */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.inputs.map((input) => (
                  <div key={input.name} className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      {input.name}
                    </label>
                    <div className="text-sm text-gray-600">
                      Type: {input.type} | Default: {input.default}
                      {input.min !== undefined && ` | Min: ${input.min}`}
                      {input.max !== undefined && ` | Max: ${input.max}`}
                    </div>
                    {input.description && (
                      <p className="text-xs text-gray-500">{input.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Outputs */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Outputs</h3>
              <div className="space-y-2">
                {config.outputs.map((output) => (
                  <div key={output.name} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: output.color }}
                    />
                    <span className="text-sm font-medium">{output.name}</span>
                    <span className="text-xs text-gray-500">
                      {output.lineWidth}px {output.lineStyle || 'solid'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Results */}
            {indicatorResult && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Calculation Results</h3>
                <div className="bg-gray-50 p-4 rounded space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Data Points:</span>
                      <span className="ml-2 font-medium">
                        {indicatorResult.values[0].length}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Output Lines:</span>
                      <span className="ml-2 font-medium">
                        {indicatorResult.values.length}
                      </span>
                    </div>
                  </div>

                  {/* Latest Values */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Latest Values:
                    </h4>
                    {indicatorResult.values.map((values: number[], idx: number) => {
                      const latest = values[values.length - 1];
                      const outputName = config.outputs[idx]?.name || `Line ${idx + 1}`;
                      return (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{outputName}:</span>
                          <span className="font-mono font-medium">
                            {isNaN(latest) ? 'N/A' : latest.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Metadata */}
                  {indicatorResult.metadata && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Metadata:
                      </h4>
                      <pre className="text-xs bg-white p-2 rounded overflow-auto">
                        {JSON.stringify(indicatorResult.metadata, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Signal Detection Example */}
                  {selectedIndicator === 'RSI' && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Overbought/Oversold Signals:
                      </h4>
                      <Button
                        size="sm"
                        onClick={() => {
                          const signals = SignalDetector.detectOverboughtOversold(
                            indicatorResult.values[0],
                            70,
                            30
                          );
                          alert(`Found ${signals.length} signals:\n${JSON.stringify(signals.slice(-5), null, 2)}`);
                        }}
                      >
                        Detect Signals
                      </Button>
                    </div>
                  )}

                  {selectedIndicator === 'MACD' && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        MACD Crossovers:
                      </h4>
                      <Button
                        size="sm"
                        onClick={() => {
                          const [macdLine, signalLine] = indicatorResult.values;
                          const crossovers = SignalDetector.detectCrossovers(
                            macdLine,
                            signalLine,
                            'all'
                          );
                          alert(`Found ${crossovers.length} crossovers at indices: ${crossovers.slice(-5).join(', ')}`);
                        }}
                      >
                        Detect Crossovers
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Code Example */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Usage Example</h3>
              <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-auto">
{`import { createIndicator } from '@/lib/indicators';

const ${selectedIndicator.toLowerCase()} = createIndicator('${selectedIndicator}');
const result = ${selectedIndicator.toLowerCase()}.calculate(data, {
${config.inputs.map(input => `  ${input.name}: ${JSON.stringify(input.default)},`).join('\n')}
});

console.log(result.values); // [[...values]]
console.log(result.timestamps); // [...]
${config.outputs.length > 1 ? `\n// Multi-line output:\nconst [${config.outputs.map(o => o.name.toLowerCase().replace(/[^a-z]/g, '')).join(', ')}] = result.values;` : ''}`}
              </pre>
            </div>
          </Card>
        </div>

        {/* Stats Footer */}
        <Card className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {allIndicators.length}
              </div>
              <div className="text-sm text-gray-600">Total Indicators</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">
                {IndicatorRegistry.getByCategory('overlay').length}
              </div>
              <div className="text-sm text-gray-600">Overlay</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">
                {IndicatorRegistry.getByCategory('oscillator').length}
              </div>
              <div className="text-sm text-gray-600">Oscillator</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">
                {IndicatorRegistry.getByCategory('volume').length}
              </div>
              <div className="text-sm text-gray-600">Volume</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600">
                {Object.keys(IndicatorPresets).length}
              </div>
              <div className="text-sm text-gray-600">Presets</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
