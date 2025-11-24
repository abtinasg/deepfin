'use client';

import { motion } from 'framer-motion';

const features = [
  {
    title: 'AI Copilot Research',
    description: 'Ask natural-language questions, surface anomalies, and summarize reports in seconds.',
    badge: 'New in v2.4',
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    title: 'Streaming Macro Desk',
    description: 'Macro calendars, central bank transcripts, and liquidity alerts in one unified stream.',
    badge: 'Enterprise',
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    title: 'Portfolio OS',
    description: 'Risk dashboards, VaR estimates, and automated hedging suggestions powered by DeepFin AI.',
    badge: 'Pro',
    gradient: 'from-emerald-500/20 to-teal-500/20',
  },
];

export function Features() {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400"
          >
            Edge Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-4xl font-bold text-white md:text-5xl"
          >
            Built for modern market desks
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 max-w-2xl mx-auto text-lg text-white/60"
          >
            Every surface is tuned for institutional research, from instant transcript tagging to AI-generated counterparty briefs.
          </motion.p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 transition-colors hover:border-white/20 hover:bg-white/10"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity group-hover:opacity-100`} />
              
              <div className="relative z-10">
                <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/80 backdrop-blur-sm">
                  {feature.badge}
                </span>
                <h3 className="mt-6 text-2xl font-bold text-white">{feature.title}</h3>
                <p className="mt-4 text-base leading-relaxed text-white/60 group-hover:text-white/80 transition-colors">
                  {feature.description}
                </p>
                
                <div className="mt-8 h-32 w-full rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
