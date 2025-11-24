"use client";

import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const timeframeOptions = ['1D', '1W', '1M', '3M', '1Y', '5Y'] as const;
const chartModes = ['area', 'line'] as const;

type Timeframe = (typeof timeframeOptions)[number];
type ChartMode = (typeof chartModes)[number];

interface ChartPoint {
  label: string;
  price: number;
  volume: number;
}

const timeframeConfig: Record<Timeframe, { points: number; labels: string[] }> = {
  '1D': { points: 12, labels: Array.from({ length: 12 }, (_, i) => `${9 + i}:00`) },
  '1W': { points: 7, labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  '1M': { points: 30, labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`) },
  '3M': { points: 12, labels: Array.from({ length: 12 }, (_, i) => `W${i + 1}`) },
  '1Y': { points: 12, labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
  '5Y': { points: 20, labels: Array.from({ length: 20 }, (_, i) => `FY${i + 1}`) },
};

const watchlist = [
  { symbol: 'NVDA', change: 2.83, price: 134.28 },
  { symbol: 'AAPL', change: -0.64, price: 181.92 },
  { symbol: 'TSLA', change: 1.72, price: 253.11 },
  { symbol: 'BTC', change: 3.41, price: 38_420.18 },
];

const signals = [
  { label: 'Liquidity stress easing · US IG', impact: 'Positive', time: '2m ago' },
  { label: 'AI macro brief ready · Desk', impact: 'Neutral', time: '12m ago' },
  { label: 'China PMI miss · APAC', impact: 'Watch', time: '28m ago' },
  { label: 'Crude inventory draw · EIA', impact: 'Positive', time: '52m ago' },
];

function buildSeries(timeframe: Timeframe): ChartPoint[] {
  const { points, labels } = timeframeConfig[timeframe];

  return Array.from({ length: points }, (_, index) => {
    const progress = index / points;
    const base = 412 + progress * 18;
    const sine = Math.sin(index * 0.8) * 6;
    const price = Number((base + sine).toFixed(2));
    const volume = Math.round(1200 + Math.cos(index * 0.6) * 300 + index * 35);

    return {
      label: labels[index] ?? `Pt ${index + 1}`,
      price,
      volume,
    };
  });
}

function Sparkline({ positive }: { positive: boolean }) {
  const data = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        label: i,
        price: Number(((positive ? 1 : -1) * Math.sin(i * 0.6) + i * 0.08 + 5).toFixed(2)),
      })),
    [positive]
  );

  return (
    <div className="h-10">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="price"
            stroke={positive ? '#059669' : '#dc2626'}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ChartDashboard() {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [chartMode, setChartMode] = useState<ChartMode>('area');

  const series = useMemo(() => buildSeries(timeframe), [timeframe]);

  const renderMainChart = () => {
    if (chartMode === 'line') {
      return (
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={series} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} />
            <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={360}>
        <AreaChart data={series} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
            tickLine={false}
            axisLine={false}
            width={60}
          />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#3b82f6"
            strokeWidth={3}
            fill="url(#colorPrice)"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Charts</h1>
        <p className="text-gray-600">Visualize trends, risk, and liquidity from a single console.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2.2fr_1fr]">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              {timeframeOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    timeframe === option
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setTimeframe(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {chartModes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={chartMode === mode}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium capitalize transition ${
                    chartMode === mode
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                  onClick={() => setChartMode(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">{renderMainChart()}</div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Last Price</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">$412.84</p>
              <p className="text-sm text-emerald-600">+1.93% today</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Day Range</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">$404 · $417</p>
              <p className="text-sm text-gray-500">Vs 52w range</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Volume</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">3.1M</p>
              <p className="text-sm text-gray-500">+12% vs avg</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Signal Monitor</p>
                <p className="text-2xl font-semibold text-gray-900">Neutral / 65%</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                AI Guardrails
              </span>
            </div>
            <div className="mt-6 space-y-3 text-sm">
              {signals.map((signal) => (
                <div key={signal.label} className="rounded-xl border border-gray-100 p-3">
                  <p className="font-medium text-gray-900">{signal.label}</p>
                  <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                    <span>{signal.time}</span>
                    <span>{signal.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Watchlist</p>
              <button type="button" className="text-xs font-semibold text-blue-600">
                Manage
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {watchlist.map((asset) => (
                <div key={asset.symbol} className="flex items-center gap-4">
                  <div className="w-16">
                    <p className="font-semibold text-gray-900">{asset.symbol}</p>
                    <p className="text-xs text-gray-500">${asset.price.toLocaleString()}</p>
                  </div>
                  <div className="w-28">
                    <Sparkline positive={asset.change >= 0} />
                  </div>
                  <div className={`text-sm font-semibold ${asset.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {asset.change >= 0 ? '+' : ''}
                    {asset.change}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Volume Profile</p>
              <h3 className="text-xl font-semibold text-gray-900">Institutional participation</h3>
            </div>
            <span className="text-sm text-gray-500">Updated 45s ago</span>
          </div>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} hide />
                <YAxis tickLine={false} axisLine={false} hide />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} />
                <Bar dataKey="volume" fill="#a855f7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Strategy Notes</p>
              <h3 className="text-xl font-semibold text-gray-900">Desk annotations</h3>
            </div>
            <button type="button" className="text-xs font-semibold text-blue-600">
              Export
            </button>
          </div>
          <div className="mt-4 space-y-4 text-sm">
            {[
              'Gamma neutral triggers if SPX < 4100 (hedge via put spread).',
              'Monitor NVDA earnings drift; implied vol rich vs realized.',
              'Crude curve backwardation steepening—consider calendar spread.',
              'BTC dominance climbing; keep 4% cap on crypto sleeve.',
            ].map((note) => (
              <div key={note} className="rounded-xl border border-dashed border-gray-200 p-4 text-gray-700">
                {note}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
