'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAIContextBuilder } from '@/hooks/use-ai-context';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  TrendingUp, 
  PieChart, 
  AlertTriangle,
  MessageSquare,
  RefreshCw,
  Settings,
  Plus
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  cost?: number;
  tokensUsed?: number;
}

interface AIChatPanelProps {
  sessionId?: string;
  compact?: boolean;
  showContext?: boolean;
}

export default function AIChatPanel({ sessionId, compact = false, showContext = true }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [mode, setMode] = useState<'auto' | 'grok' | 'gemini' | 'gpt5' | 'claude' | 'ensemble'>('auto');
  const [currentSessionId, setCurrentSessionId] = useState(sessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { context, buildContextString } = useAIContextBuilder();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load session messages if sessionId provided
  useEffect(() => {
    if (sessionId) {
      loadSessionMessages(sessionId);
    }
  }, [sessionId]);

  const loadSessionMessages = async (sid: string) => {
    try {
      const res = await fetch(`/api/ai/sessions/${sid}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.createdAt),
          model: m.model,
          cost: m.cost,
          tokensUsed: m.tokensUsed,
        })));
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const createNewSession = async () => {
    try {
      const contextString = buildContextString();
      const res = await fetch('/api/ai/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Chat',
          context: contextString || undefined,
        }),
      });
      
      if (res.ok) {
        const session = await res.json();
        setCurrentSessionId(session.id);
        return session.id;
      }
    } catch (error) {
      console.error('Failed to create session:', error);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setStreaming(true);

    try {
      // Create session if not exists
      let sid = currentSessionId;
      if (!sid) {
        sid = await createNewSession();
      }

      const contextString = buildContextString();
      
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: input,
          mode,
          sessionId: sid || undefined,
          context: contextString || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('AI request failed');
      }

      const data = await res.json();

      const assistantMessage: Message = {
        id: Date.now().toString() + '-ai',
        role: 'assistant',
        content: data.response || data.synthesis || 'No response',
        timestamp: new Date(),
        model: data.model,
        cost: data.cost,
        tokensUsed: data.usage?.total_tokens,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        role: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentSessionId(undefined);
  };

  const quickActions = [
    { icon: TrendingUp, label: 'Analyze Portfolio', prompt: 'Give me a comprehensive analysis of my current portfolio performance and risk exposure.' },
    { icon: PieChart, label: 'Top Holdings', prompt: 'What are my top holdings and should I rebalance?' },
    { icon: AlertTriangle, label: 'Risk Check', prompt: 'What are the biggest risks in my portfolio right now?' },
  ];

  if (compact) {
    return (
      <div className="flex flex-col h-full bg-slate-950/50 border-l border-white/5">
        {/* Compact Header */}
        <div className="flex items-center justify-between p-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-white">AI Copilot</span>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0"
              onClick={handleNewChat}
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Context Badge */}
        {showContext && (context.currentSymbol || context.portfolioSummary) && (
          <div className="px-3 py-2 bg-blue-500/10 border-b border-blue-500/20">
            <div className="flex items-center gap-2 text-xs text-blue-300">
              <MessageSquare className="w-3 h-3" />
              <span>
                {context.currentSymbol && `Viewing ${context.currentSymbol}`}
                {context.portfolioSummary && !context.currentSymbol && `Portfolio: $${context.portfolioSummary.totalValue.toLocaleString()}`}
              </span>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8 text-white/40 text-sm">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Ask me anything about your portfolio or the market</p>
            </div>
          )}
          
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/5 text-white/90 border border-white/10'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.model && (
                  <div className="text-[10px] mt-1 opacity-60">
                    {msg.model.split('/').pop()} • ${msg.cost?.toFixed(4)}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {streaming && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length === 0 && (
          <div className="px-3 py-2 border-t border-white/5 space-y-1">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(action.prompt);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded transition-colors"
              >
                <action.icon className="w-3 h-3" />
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-white/5">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI..."
              disabled={loading}
              className="flex-1 bg-white/5 border-white/10 text-white text-sm placeholder:text-white/40"
            />
            <Button
              type="submit"
              size="sm"
              disabled={loading || !input.trim()}
              className="px-3"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <div className="mt-2">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="w-full text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-white"
            >
              <option value="auto">Auto</option>
              <option value="claude">Claude 4.5</option>
              <option value="gpt5">GPT-5</option>
              <option value="gemini">Gemini 2.5</option>
              <option value="grok">Grok 4</option>
              <option value="ensemble">Ensemble</option>
            </select>
          </div>
        </form>
      </div>
    );
  }

  // Full size version
  return (
    <Card className="flex flex-col h-full bg-slate-950/80 border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Copilot</h2>
            <p className="text-xs text-white/60">Powered by Claude, GPT-5, Gemini & Grok</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as any)}
            className="text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white"
          >
            <option value="auto">Auto</option>
            <option value="claude">Claude 4.5</option>
            <option value="gpt5">GPT-5</option>
            <option value="gemini">Gemini 2.5</option>
            <option value="grok">Grok 4</option>
            <option value="ensemble">Ensemble</option>
          </select>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewChat}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Context Display */}
      {showContext && (context.currentSymbol || context.portfolioSummary) && (
        <div className="px-4 py-3 bg-blue-500/10 border-b border-blue-500/20">
          <div className="text-sm text-blue-300">
            <div className="font-semibold mb-1">Context</div>
            <div className="text-xs space-y-0.5 text-blue-200/80">
              {context.currentSymbol && <div>Symbol: {context.currentSymbol}</div>}
              {context.portfolioSummary && (
                <>
                  <div>Portfolio Value: ${context.portfolioSummary.totalValue.toLocaleString()}</div>
                  <div>P/L: {context.portfolioSummary.totalGainLoss >= 0 ? '+' : ''}${context.portfolioSummary.totalGainLoss.toLocaleString()}</div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-blue-400/50" />
            <h3 className="text-lg font-semibold text-white mb-2">Start a Conversation</h3>
            <p className="text-sm text-white/60 mb-6">Ask about your portfolio, market trends, or any stock</p>
            
            <div className="grid grid-cols-1 gap-2 max-w-md mx-auto">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(action.prompt)}
                  className="flex items-center gap-3 px-4 py-3 text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                >
                  <action.icon className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-sm font-medium text-white">{action.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white'
                  : 'bg-white/5 border border-white/10 text-white/90'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
              {msg.model && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10 text-xs opacity-60">
                  <span>{msg.model.split('/').pop()}</span>
                  {msg.cost && <span>• ${msg.cost.toFixed(4)}</span>}
                  {msg.tokensUsed && <span>• {msg.tokensUsed} tokens</span>}
                </div>
              )}
            </div>
          </div>
        ))}

        {streaming && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <span className="text-sm text-white/60">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/5">
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your portfolio, markets, or any stock..."
            disabled={loading}
            className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
