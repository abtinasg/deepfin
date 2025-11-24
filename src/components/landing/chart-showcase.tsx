'use client';

import { motion } from 'framer-motion';

const chartPoints = [12, 18, 14, 20, 24, 21, 28, 32, 27, 35, 38];

const chartFeatures = [
  {
    title: 'Professional chart surfaces',
    description: 'Candles, DOM ladder, footprint view, and depth heatmaps share one layout system with keyboard macros.',
    badge: 'Surfaces',
  },
  {
    title: '65+ indicators & scripts',
    description: 'Built-in institutional indicators plus custom math + Pine-compatible scripting for desk-specific overlays.',
    badge: 'Indicators',
  },
  {
    title: 'Multi-screen layouts',
    description: 'Save tiled workspaces, sync crosshairs, and broadcast watchlists across desks in real time.',
    badge: 'Layouts',
  },
  {
    title: 'AI-assisted strategy tests',
    description: 'Export prompts straight into ensemble AI to generate scanners, backtests, and hedging ideas in seconds.',
    badge: 'AI Assist',
  },
];

const timeframePresets = ['1H', '4H', '1D', '1W', '1M'];

const buildSparklinePath = (points: number[]) => {
  if (!points.length) return '';
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  return points
    .map((value, index) => {
      const x = points.length === 1 ? 0 : (index / (points.length - 1)) * 100;
      const normalized = (value - min) / range;
      const y = 100 - (normalized * 70 + 15);
      const command = index === 0 ? 'M' : 'L';
      return `${command} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
};

const sparklinePath = buildSparklinePath(chartPoints);
const sparklineArea = sparklinePath ? `${sparklinePath} L 100 100 L 0 100 Z` : '';

export function ChartShowcase() {
  return (
    <section className="relative overflow-hidden border-y border-white/5 bg-gradient-to-b from-[#030712] via-slate-950 to-slate-900 py-24 px-6">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold tracking-[0.3em] text-blue-300/80">
            Deep Charts
          </p>
          <h2 className="text-4xl font-semibold text-white sm:text-5xl">
            Charts engineered for quant desks
          </h2>
          <p className="text-lg text-white/70">
            The DeepFin charting stack ships out of the box with institution-grade surfaces, real-time market depth, and AI-connected workflows. Replace stacks of browser tabs with a single synchronized layout.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {chartFeatures.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-blue-200/80">
                  {feature.badge}
                </p>
                <p className="mt-3 text-lg font-semibold text-white">{feature.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            {timeframePresets.map((preset, index) => (
              <button
                key={preset}
                className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition-colors ${
                  index === 2
                    ? 'border-blue-400/70 bg-blue-500/10 text-white'
                    : 'border-white/10 bg-white/5 text-white/70 hover:text-white'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -inset-4 rounded-[40px] bg-gradient-to-r from-blue-500 to-purple-600 opacity-30 blur-3xl" />
          <div className="relative rounded-[32px] border border-white/10 bg-slate-950/90 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4 text-sm text-white/70">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Workspace</p>
                <p className="text-lg font-semibold text-white">Multi-Asset Macro Deck</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                Live 65 ms
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-6">
              <div className="flex items-center justify-between text-sm text-white/70">
                <p className="font-semibold text-white">NVDA / USD</p>
                <p className="text-emerald-400 font-semibold">+3.48%</p>
              </div>
              <div className="mt-6 h-48 w-full">
                <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
                  {sparklineArea && (
                    <path d={sparklineArea} fill="url(#chartGradient)" opacity={0.3} />
                  )}
                  {sparklinePath && (
                    <path d={sparklinePath} fill="none" stroke="url(#chartStroke)" strokeWidth={2} strokeLinecap="round" />
                  )}
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="chartStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#60A5FA" />
                      <stop offset="100%" stopColor="#A855F7" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/40">Depth</p>
                  <p className="text-lg font-semibold text-white">x1.7 liquidity</p>
                  <p className="text-xs text-white/60">Top of book vs CME</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/40">Indicator Stack</p>
                  <p className="text-lg font-semibold text-white">Delta Clouds + VWAP</p>
                  <p className="text-xs text-white/60">Synced to Gemini vision</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">Scanner</p>
                <p className="mt-2 text-lg font-semibold text-white">Flow Surge</p>
                <p className="text-sm text-white/70">AI shares unusual block trades straight into the chart workspace.</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-purple-500/20 to-pink-500/10 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">Playbooks</p>
                <p className="mt-2 text-lg font-semibold text-white">One-click layouts</p>
                <p className="text-sm text-white/70">Load options, macro, or crypto templates with compliance notes baked in.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
