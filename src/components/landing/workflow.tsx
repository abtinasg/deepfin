'use client';

import { motion } from 'framer-motion';

export function Workflow() {
  return (
    <section className="py-24 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-6xl gap-16 rounded-[40px] border border-white/5 bg-gradient-to-br from-white/5 via-white/0 to-white/5 p-10 lg:flex lg:items-center lg:p-16"
      >
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            New Workflow Engine
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white md:text-4xl">
            Stream macro, equities, and crypto in a single notebook.
          </h2>
          <p className="mt-6 text-lg text-white/60 leading-relaxed">
            Drag-and-drop pipelines combine macro calendars with intraday liquidity signals. Ship AI briefings directly into Slack, Notion, or the Deep Terminal dashboard.
          </p>
          
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-white/5 p-5">
              <p className="text-3xl font-bold text-white">45+</p>
              <p className="mt-1 text-sm text-white/50">Data integrations live</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/5 p-5">
              <p className="text-3xl font-bold text-white">8m</p>
              <p className="mt-1 text-sm text-white/50">Alerts delivered weekly</p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex-1 lg:mt-0">
          <div className="relative rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between text-sm text-white/60 border-b border-white/5 pb-4 mb-4">
              <p>Strategy Canvas</p>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Auto-sync · Enabled</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {['AI Macro Briefing', 'Liquidity Stress Test', 'Options Flow Scanner', 'FX Hedge Script'].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ x: 20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 transition-all hover:bg-white/10 hover:border-white/10 hover:translate-x-1"
                >
                  <div>
                    <p className="font-medium text-white group-hover:text-blue-400 transition-colors">{item}</p>
                    <p className="text-xs text-white/40">Runs every {index + 1}h</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                    Online
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
