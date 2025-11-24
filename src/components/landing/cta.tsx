'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function CTA() {
  return (
    <section className="py-24 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-500/20 px-6 py-20 text-center backdrop-blur-xl relative"
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-blue-500/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-purple-500/30 blur-3xl" />
        
        <div className="relative z-10">
          <p className="text-sm font-bold uppercase tracking-[0.4em] text-white/70">Launch Offer</p>
          <h2 className="mt-6 text-4xl font-bold text-white md:text-5xl">
            Deploy Deep Terminal across<br />your team in under a week.
          </h2>
          <p className="mt-6 text-lg text-white/70">
            $29 per seat · Cancel anytime · Includes onboarding concierge and a custom AI playbook.
          </p>
          
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/sign-up"
              className="rounded-2xl bg-white px-8 py-4 text-base font-bold text-slate-900 shadow-lg shadow-white/20 transition-transform hover:scale-105"
            >
              Get Started Today
            </Link>
            <Link
              href="/sign-in"
              className="rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              View Sample Workspace
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
