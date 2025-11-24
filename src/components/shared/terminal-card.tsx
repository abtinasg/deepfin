"use client";

import { motion, Transition } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type TerminalCardProps = {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  toolbar?: ReactNode;
  footer?: ReactNode;
  isInteractive?: boolean;
};

export function TerminalCard({
  title,
  subtitle,
  actions,
  children,
  className,
  toolbar,
  footer,
  isInteractive = true,
}: TerminalCardProps) {
  const Wrapper = isInteractive ? motion.section : 'section';

  const transitionConfig: Transition = {
    duration: 0.4,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  };

  return (
    <Wrapper
      className={cn(
        'group flex flex-col gap-4 rounded-2xl border border-surface-2/60 bg-surface-1/95 p-5 text-textTone-primary shadow-soft transition duration-200',
        'bg-[linear-gradient(135deg,rgba(255,255,255,0.02),rgba(4,10,20,0.35))] backdrop-blur-xl',
        isInteractive && 'hover:-translate-y-0.5 hover:border-accentTone-1/80 hover:shadow-glow',
        className,
      )}
      initial={isInteractive ? { opacity: 0, y: 12 } : undefined}
      animate={isInteractive ? { opacity: 1, y: 0 } : undefined}
      transition={isInteractive ? transitionConfig : undefined}
    >
      {(title || subtitle || actions) && (
        <header className="flex flex-col gap-1 sm:flex-row sm:items-center">
          <div className="flex-1">
            {title && <p className="text-sm font-semibold uppercase tracking-[0.2em] text-textTone-muted">{title}</p>}
            {subtitle && <p className="text-lg font-semibold text-textTone-primary">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 text-textTone-secondary">{actions}</div>}
        </header>
      )}
      {toolbar && <div className="flex flex-wrap gap-2 text-xs text-textTone-muted">{toolbar}</div>}
      <div className="flex-1">{children}</div>
      {footer && <footer className="text-xs text-textTone-muted">{footer}</footer>}
    </Wrapper>
  );
}

export function TerminalCardToolbar({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2 text-xs text-textTone-muted">{children}</div>;
}

export function TerminalCardKpi({ label, value, change }: { label: string; value: string; change?: string }) {
  return (
    <div className="min-w-[120px] flex-1">
      <p className="text-xs uppercase tracking-wide text-textTone-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-textTone-primary">{value}</p>
      {change && <p className="text-xs text-textTone-secondary">{change}</p>}
    </div>
  );
}
