"use client";

import { cn } from '@/lib/utils';

export type SkeletonProps = {
  className?: string;
  shimmer?: boolean;
};

export function SkeletonBlock({ className, shimmer = true }: SkeletonProps) {
  return (
    <div className={cn('relative overflow-hidden rounded-xl bg-layer-3/70', className)}>
      {shimmer && (
        <span className="absolute inset-0 block animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      )}
    </div>
  );
}

export function SkeletonLine({ className, shimmer = false }: SkeletonProps) {
  return <SkeletonBlock className={cn('h-3 w-full', className)} shimmer={shimmer} />;
}

export function SkeletonCircle({ className, shimmer = true }: SkeletonProps) {
  return <SkeletonBlock className={cn('h-10 w-10 rounded-full', className)} shimmer={shimmer} />;
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="flex flex-col gap-3">
      <SkeletonLine className="h-4 w-1/3" shimmer={false} />
      {Array.from({ length: lines }).map((_, idx) => (
        <SkeletonLine key={idx} className="h-3" shimmer={idx % 2 === 0} />
      ))}
    </div>
  );
}
