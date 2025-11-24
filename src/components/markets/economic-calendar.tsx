'use client';

import { motion } from 'framer-motion';
import { EconomicEvent } from '@/types/market';

interface EconomicCalendarProps {
  events: EconomicEvent[];
  onEventClick?: (event: EconomicEvent) => void;
}

export function EconomicCalendar({ events, onEventClick }: EconomicCalendarProps) {
  const importanceColors = {
    high: 'bg-rose-500/20 text-rose-100 border-rose-400/30',
    medium: 'bg-amber-500/20 text-amber-100 border-amber-400/30',
    low: 'bg-white/10 text-slate-200 border-white/20'
  };

  return (
    <div className="
      rounded-3xl
      border border-white/10
      bg-white/5
      p-6
      text-white
      shadow-[0_20px_60px_rgba(2,6,23,0.45)]
    ">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-200">
        📅 Economic Calendar
      </h3>
      
      <div className="space-y-3">
        {events.map((event, index) => (
          <motion.div
            key={`${event.time}-${event.event}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="
              cursor-pointer
              rounded-2xl
              border border-white/5
              bg-white/5
              p-3
              transition
              hover:border-white/20
            "
            onClick={() => onEventClick?.(event)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="min-w-[50px] text-sm font-bold text-slate-300">
                  {event.time}
                </div>
                <div className="flex-1">
                  <div className="mb-1 text-sm font-semibold text-white">
                    {event.event}
                  </div>
                  {(event.forecast || event.previous) && (
                    <div className="flex gap-3 text-xs text-slate-300">
                      {event.forecast && (
                        <span>Forecast: <span className="font-semibold">{event.forecast}</span></span>
                      )}
                      {event.previous && (
                        <span>Previous: <span className="font-semibold">{event.previous}</span></span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <span className={`
                rounded-md border px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em]
                ${importanceColors[event.importance]}
              `}>
                {event.importance.toUpperCase()}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
