'use client';

import { motion } from 'framer-motion';

const logos = ['Sequoia Scouts', 'Polychain Labs', 'Havenridge', 'Lattice Macro'];

export function TrustedBy() {
  return (
    <section className="py-12 px-6 border-y border-white/5 bg-white/[0.02]">
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.4em] text-white/30">Trusted by teams at</p>
        <div className="mt-8 flex flex-wrap justify-center gap-8 md:gap-16">
          {logos.map((logo, i) => (
            <motion.div
              key={logo}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-lg font-semibold text-white/40 hover:text-white/60 transition-colors cursor-default"
            >
              {logo}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
