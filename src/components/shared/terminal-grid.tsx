import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type TerminalGridProps = {
  children: ReactNode;
  className?: string;
};

export function TerminalGrid({ children, className }: TerminalGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 md:grid-cols-12 md:auto-rows-[minmax(220px,_auto)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export type TerminalGridItemProps = {
  children: ReactNode;
  className?: string;
  span?: number;
  spanLg?: number;
};

const spanClass = (prefix: string, span?: number) => {
  if (!span) return '';
  return `${prefix}:col-span-${span}`;
};

export function TerminalGridItem({ children, className, span = 12, spanLg }: TerminalGridItemProps) {
  return (
    <div className={cn('col-span-12', spanClass('md', span), spanLg && spanClass('lg', spanLg), className)}>
      {children}
    </div>
  );
}
