"use client";

import { ReactNode } from 'react';
import { motion, Transition } from 'framer-motion';
import { cn } from '@/lib/utils';

export type DataStateProps = {
  isLoading: boolean;
  isError?: boolean;
  empty?: boolean;
  skeleton?: ReactNode;
  emptyState?: ReactNode;
  errorState?: ReactNode;
  children: ReactNode;
  className?: string;
};

const fadeConfig: Transition = {
  duration: 0.3,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

export function DataState({
  isLoading,
  isError,
  empty,
  skeleton,
  emptyState,
  errorState,
  children,
  className,
}: DataStateProps) {
  if (isLoading) {
    return <div className={cn('animate-fade-in text-textTone-muted', className)}>{skeleton}</div>;
  }

  if (isError) {
    return (
      errorState || (
        <div className="flex flex-col items-center justify-center gap-2 text-sm text-negative">
          <span>Unable to load data</span>
          <p className="text-textTone-muted">Please retry shortly.</p>
        </div>
      )
    );
  }

  if (empty) {
    return (
      emptyState || (
        <div className="flex flex-col items-center justify-center text-sm text-textTone-muted">
          <p>No data available</p>
        </div>
      )
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={fadeConfig} className={className}>
      {children}
    </motion.div>
  );
}
