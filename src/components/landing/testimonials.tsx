'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    quote:
      'Deep Terminal replaced three legacy systems and shaved six hours off our daily research cycle. The AI briefings feel like having another analyst on the desk.',
    name: 'Sophia Nguyen',
    title: 'Director of Research, Arcadia Capital',
  },
  {
    quote:
      'Latency numbers rival our Bloomberg feeds and the automation is better. We pipe their websocket data straight into our execution stack.',
    name: 'Marcus Hill',
    title: 'Head of Trading Tech, Lumen Street',
  },
];

export function Testimonials() {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-2">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-sm"
            >
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
              
              <svg className="mb-6 h-8 w-8 text-blue-400/50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" />
              </svg>
              
              <p className="text-xl font-medium leading-relaxed text-white/90">
                “{testimonial.quote}”
              </p>
              
              <div className="mt-8 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
                <div>
                  <p className="font-bold text-white">{testimonial.name}</p>
                  <p className="text-sm text-white/50">{testimonial.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
