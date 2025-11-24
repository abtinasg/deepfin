'use client';

import { useState } from 'react';
import { Send, Sparkles, Mic, Paperclip, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AICopilotPanelProps {
  className?: string;
}

/**
 * AICopilotPanel - Fixed right sidebar for AI interactions
 * Bloomberg-style always-visible copilot for instant market analysis
 */
export function AICopilotPanel({ className }: AICopilotPanelProps) {
  const [input, setInput] = useState('');

  const quickPrompts = [
    'Analyze current sector rotation',
    "What's driving today's moves?",
    'Compare tech leaders',
    'Alert me when VIX > 20',
  ];

  return (
    <div className={cn('flex h-full flex-col', className)}>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-terminal-6 py-terminal-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-terminal-lg font-semibold text-white">Ask Alpha</h3>
            <p className="text-terminal-xs text-slate-500">AI Market Copilot</p>
          </div>
        </div>
      </div>

      {/* Context Panel - Market Summary */}
      <div className="border-b border-white/[0.06] p-terminal-4 bg-white/[0.02]">
        <div className="text-terminal-xs text-slate-400 uppercase tracking-wide mb-2">
          Market Context
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-terminal-sm text-slate-300">S&P 500</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              <span className="text-terminal-sm text-emerald-400 font-medium">+0.8%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-terminal-sm text-slate-300">VIX</span>
            <div className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-rose-400" />
              <span className="text-terminal-sm text-rose-400 font-medium">-2.3%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-terminal-sm text-slate-300">Leading Sector</span>
            <span className="text-terminal-sm text-indigo-300 font-medium">Technology</span>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto terminal-scrollbar p-terminal-4 space-y-4">

        {/* Welcome Message */}
        <div className="rounded-lg bg-white/[0.04] border border-white/[0.06] p-3">
          <div className="flex items-start gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-500 flex-shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-terminal-sm text-slate-300 leading-relaxed">
                Hi! I'm your AI market analyst. I can help you analyze market data, compare stocks,
                identify trends, and answer questions about your portfolio.
              </p>
            </div>
          </div>
        </div>

        {/* Example: User message */}
        {/* <div className="flex justify-end">
          <div className="rounded-lg bg-indigo-500/20 border border-indigo-500/30 px-3 py-2 max-w-[85%]">
            <p className="text-terminal-sm text-white">
              What's causing the tech sector rally today?
            </p>
          </div>
        </div> */}

        {/* Example: AI response */}
        {/* <div className="rounded-lg bg-white/[0.04] border border-white/[0.06] p-3">
          <div className="flex items-start gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-500 flex-shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-terminal-sm text-slate-300 leading-relaxed">
                The tech sector (XLK) is up 1.4% today, driven primarily by...
              </p>
            </div>
          </div>
        </div> */}

        {/* Quick Prompts */}
        <div className="pt-4 border-t border-white/[0.06]">
          <div className="text-terminal-xs text-slate-400 uppercase tracking-wide mb-2">
            Quick Actions
          </div>
          <div className="grid grid-cols-1 gap-2">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setInput(prompt)}
                className="text-left rounded-md bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-terminal-sm text-slate-300 transition hover:bg-white/[0.08] hover:border-white/[0.12] hover:text-white"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-white/[0.06] p-terminal-4 bg-white/[0.02]">
        <div className="flex items-end gap-2">
          <div className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] transition focus-within:border-indigo-500/50 focus-within:bg-white/[0.06]">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about markets, stocks, sectors..."
              className="w-full resize-none bg-transparent px-3 py-2 text-terminal-sm text-white placeholder:text-slate-500 outline-none"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  // Send message on Cmd/Ctrl + Enter
                  console.log('Send:', input);
                  setInput('');
                }
              }}
            />
            <div className="flex items-center justify-between border-t border-white/[0.06] px-3 py-2">
              <div className="flex items-center gap-2">
                <button className="rounded-md p-1.5 text-slate-400 transition hover:bg-white/[0.08] hover:text-white">
                  <Mic className="h-3.5 w-3.5" />
                </button>
                <button className="rounded-md p-1.5 text-slate-400 transition hover:bg-white/[0.08] hover:text-white">
                  <Paperclip className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                onClick={() => {
                  console.log('Send:', input);
                  setInput('');
                }}
                disabled={!input.trim()}
                className="rounded-md bg-indigo-500 px-3 py-1.5 text-terminal-xs font-medium text-white transition hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Send className="h-3 w-3" />
                Send
              </button>
            </div>
          </div>
        </div>
        <div className="mt-2 text-terminal-xs text-slate-500 text-center">
          Press <kbd className="px-1 py-0.5 rounded bg-white/[0.05] border border-white/[0.08]">⌘</kbd> + <kbd className="px-1 py-0.5 rounded bg-white/[0.05] border border-white/[0.08]">Enter</kbd> to send
        </div>
      </div>
    </div>
  );
}
