'use client';

import { motion } from 'framer-motion';
import { BarChart3, Bird, Brain, Calculator } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface AiModel {
  name: string;
  Icon: LucideIcon;
  gradient: string;
  latency: string;
  description: string;
  badges: string[];
}

const aiModels: AiModel[] = [
  {
    name: 'Claude 4.5 Sonnet',
    Icon: Brain,
    gradient: 'from-purple-500/30 to-indigo-500/20',
    latency: '2.1s median',
    description: 'Deep research, policy memos, and counter-theses grounded on transcripts.',
    badges: ['Deep research', 'Compliance ready'],
  },
  {
    name: 'GPT-5 Quant',
    Icon: Calculator,
    gradient: 'from-emerald-500/30 to-teal-500/10',
    latency: '1.8s median',
    description: 'Math-heavy reasoning, live pricing lookups, and on-chart callouts.',
    badges: ['Valuations', 'On-chart context'],
  },
  {
    name: 'Gemini 2.5 Pro',
    Icon: BarChart3,
    gradient: 'from-sky-500/30 to-cyan-500/10',
    latency: '2.4s median',
    description: 'Understands screenshots, indicators, and portfolio widgets for instant annotations.',
    badges: ['Vision ready', 'Chart markup'],
  },
  {
    name: 'Grok 4 Fast',
    Icon: Bird,
    gradient: 'from-orange-500/30 to-yellow-500/10',
    latency: '1.2s median',
    description: 'Social + options flow pulse with sarcasm filter removed.',
    badges: ['Social pulse', 'Flow alerts'],
  },
];

const aiAdvantages = [
  {
    title: 'Smart router',
    detail: 'Auto-selects the cheapest model that still meets accuracy SLAs, or blend everything with Ensemble mode.',
  },
  {
    title: 'Desk permissions',
    detail: 'Map research teams to model clusters and log every prompt for audit + MiFID retention.',
  },
  {
    title: 'Inline actions',
    detail: 'Push AI output straight into scanners, chart annotations, or alert rules without leaving the thread.',
  },
];

const threadSample = [
  {
    label: 'Claude 4.5',
    accent: 'border-purple-400',
    text: 'NVDA gross margin expands 230 bps q/q. Biggest risk is hyperscaler lock-in, not demand. Suggest pair trade long NVDA / short AMD at 0.72 beta.',
  },
  {
    label: 'Gemini Vision',
    accent: 'border-sky-400',
    text: 'Detected triple-touch trendline on the H4 chart plus VWAP reclaim. Momentum stays intact while price > $134.60.',
  },
  {
    label: 'Grok Flow',
    accent: 'border-amber-400',
    text: 'Social skew neutral. Watching $5.2B of weekly call premium, mostly short-dated. Crowd is not euphoric yet.',
  },
  {
    label: 'Synthesis',
    accent: 'border-emerald-400',
    text: 'Route: 55% Claude, 25% Gemini, 20% Grok. Execute starter position with tight delta hedge; set AI monitor to auto-escalate if Grok sentiment flips.',
  },
];

export function MultiAIShowcase() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-black py-24 px-6">
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold tracking-[0.3em] text-cyan-200/80">
            Multi AI Fabric
          </p>
          <h2 className="mt-6 text-4xl font-semibold text-white sm:text-5xl">
            Orchestrate every frontier model inside one prompt line
          </h2>
          <p className="mt-4 text-lg text-white/70">
            DeepFin pipes OpenRouter, Vertex, and enterprise LLMs through a single policy engine. Spin up Claude for macro, Gemini for chart vision, GPT-5 for math, or let Ensemble blend them automatically.
          </p>

          <div className="mt-10 space-y-4">
            {aiAdvantages.map((adv) => (
              <div key={adv.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">{adv.title}</p>
                <p className="mt-3 text-base text-white/70">{adv.detail}</p>
              </div>
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
          <div className="absolute -inset-4 rounded-[40px] bg-gradient-to-r from-cyan-500 to-purple-600 opacity-30 blur-3xl" />
          <div className="relative rounded-[32px] border border-white/10 bg-slate-950/90 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Routing Mode</p>
                <p className="text-lg font-semibold text-white">Ensemble (Auto)</p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold text-white/80">
                Cost: $0.016 / query
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {aiModels.map((model) => {
                const Icon = model.Icon;
                return (
                <div
                  key={model.name}
                  className={`rounded-2xl border border-white/5 bg-gradient-to-br ${model.gradient} p-4 text-white/90`}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-white/60">{model.latency}</span>
                  </div>
                  <p className="mt-3 text-lg font-semibold text-white">{model.name}</p>
                  <p className="mt-2 text-sm text-white/80">{model.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {model.badges.map((badge) => (
                      <span key={badge} className="rounded-full border border-white/30 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/70">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
                );
              })}
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Example Multi-AI Thread</p>
              <div className="mt-4 space-y-4">
                {threadSample.map((thread) => (
                  <div key={thread.label} className={`rounded-2xl border-l-4 ${thread.accent} bg-slate-900/80 p-4`}>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">{thread.label}</p>
                    <p className="mt-2 text-white/80">{thread.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
