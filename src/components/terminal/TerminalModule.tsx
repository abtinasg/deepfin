'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TerminalModuleProps {
  title: string;
  subtitle?: string;
  height?: string;
  className?: string;
  children: ReactNode;
  actions?: ReactNode;
  isLive?: boolean;
  headerless?: boolean;
}

/**
 * TerminalModule - Bloomberg-style card component
 * Compact, dense, professional look with optional live indicator
 */
export function TerminalModule({
  title,
  subtitle,
  height = 'auto',
  className,
  children,
  actions,
  isLive = false,
  headerless = false,
}: TerminalModuleProps) {
  return (
    <div
      className={cn(
        // Bloomberg-style card
        'rounded-lg border border-white/[0.06] bg-[#0B1121]/80',
        'backdrop-blur-sm shadow-soft',
        'overflow-hidden',
        'transition-all duration-200',
        'hover:border-white/[0.1]',
        className
      )}
      style={{ height }}
    >
      {/* Module Header */}
      {!headerless && (
        <div className="flex items-center justify-between px-terminal-4 py-terminal-3 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            {isLive && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-glow-positive" />
            )}
            <h3 className="text-terminal-lg font-semibold text-white tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <span className="text-terminal-xs text-slate-500 ml-2">
                {subtitle}
              </span>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Module Body */}
      <div className={cn(
        headerless ? 'p-terminal-4' : 'p-terminal-4',
        'overflow-auto terminal-scrollbar'
      )}>
        {children}
      </div>
    </div>
  );
}

/**
 * TerminalModuleStat - Individual stat display within module
 */
interface TerminalModuleStatProps {
  label: string;
  value: string | number;
  change?: number;
  subtitle?: string;
  icon?: ReactNode;
}

export function TerminalModuleStat({ label, value, change, subtitle, icon }: TerminalModuleStatProps) {
  const isPositive = change !== undefined && change >= 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div className="flex items-center justify-between py-terminal-2 group">
      <div className="flex items-center gap-2 flex-1">
        {icon && <span className="text-base opacity-80">{icon}</span>}
        <div className="flex-1">
          <div className="terminal-label">{label}</div>
          {subtitle && (
            <div className="text-terminal-xs text-slate-600 mt-0.5">{subtitle}</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="terminal-value">{value}</span>
        {change !== undefined && (
          <span
            className={cn(
              'text-terminal-sm font-medium tabular-nums',
              isPositive && 'text-emerald-400',
              isNegative && 'text-rose-400'
            )}
          >
            {isPositive && '+'}{change.toFixed(2)}%
          </span>
        )}
      </div>
    </div>
  );
}
