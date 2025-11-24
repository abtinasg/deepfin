'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AIResponse {
  model: string;
  response: string;
  cost: number;
  usage?: {
    total_tokens: number;
    prompt_tokens: number;
    completion_tokens: number;
  };
  individual?: {
    grok: string | null;
    claude: string | null;
    gpt5: string | null;
  };
  synthesis?: string;
}

export default function AIChat() {
  const [query, setQuery] = useState('');
  const [ticker, setTicker] = useState('');
  const [mode, setMode] = useState<'auto' | 'grok' | 'gemini' | 'gpt5' | 'claude' | 'ensemble'>('auto');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState('');
  const [includeHistorical, setIncludeHistorical] = useState(false);
  const [historicalPeriod, setHistoricalPeriod] = useState('1mo');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query, 
          ticker: ticker || undefined, 
          mode,
          includeHistorical,
          historicalPeriod
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'AI request failed');
      }

      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const modelDescriptions = {
    auto: '🤖 Auto (Smart routing)',
    grok: '🐦 Grok 4 Fast (Twitter/Social)',
    gemini: '📊 Gemini 2.5 Pro (Charts/Vision)',
    gpt5: '🧮 GPT-5 (Math/Calculations)',
    claude: '🧠 Claude 4.5 (Deep Analysis)',
    ensemble: '🎯 Ensemble (All Models)',
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Deep Terminal AI</h1>
        <p className="text-muted-foreground">
          Multi-AI system powered by OpenRouter (Claude 4.5, GPT-5, Gemini 2.5 Pro, Grok 4 Fast)
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Query</label>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about any stock..."
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Ticker (optional)
                {ticker && <span className="text-green-600 ml-2">✓ Live Yahoo Finance data will be used</span>}
              </label>
              <Input
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="AAPL, TSLA, etc."
                disabled={loading}
              />
            </div>
          </div>

          {ticker && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2 mb-3">
                <div className="text-blue-600 dark:text-blue-400 mt-0.5">📊</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Live Yahoo Finance Data
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    AI will analyze ONLY the live Yahoo Finance data for {ticker}, not its pre-trained knowledge.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeHistorical}
                    onChange={(e) => setIncludeHistorical(e.target.checked)}
                    disabled={loading}
                    className="rounded"
                  />
                  <span className="text-sm text-blue-900 dark:text-blue-100">
                    Include Historical Data
                  </span>
                </label>

                {includeHistorical && (
                  <select
                    value={historicalPeriod}
                    onChange={(e) => setHistoricalPeriod(e.target.value)}
                    disabled={loading}
                    className="text-sm border rounded px-2 py-1 bg-white dark:bg-gray-800"
                  >
                    <option value="1d">1 Day</option>
                    <option value="5d">5 Days</option>
                    <option value="1mo">1 Month</option>
                    <option value="3mo">3 Months</option>
                    <option value="6mo">6 Months</option>
                    <option value="1y">1 Year</option>
                  </select>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">AI Model</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(modelDescriptions).map(([key, label]) => (
                <Button
                  key={key}
                  type="button"
                  variant={mode === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode(key as any)}
                  disabled={loading}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={loading || !query.trim()} className="w-full">
            {loading ? 'Thinking...' : 'Ask AI'}
          </Button>
        </form>
      </Card>

      {error && (
        <Card className="p-4 border-red-500 bg-red-50 dark:bg-red-950">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </Card>
      )}

      {response && (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Response</h3>
                <p className="text-sm text-muted-foreground">
                  Model: {response.model} • Cost: ${response.cost.toFixed(6)}
                  {response.usage && ` • Tokens: ${response.usage.total_tokens}`}
                </p>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              {response.model === 'ensemble' ? (
                <div className="space-y-6">
                  {response.individual && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm text-muted-foreground">Individual Perspectives:</h4>
                      
                      {response.individual.grok && (
                        <div className="border-l-4 border-blue-500 pl-4">
                          <p className="font-semibold text-sm mb-2">🐦 Grok 4 Fast (Social):</p>
                          <p className="text-sm whitespace-pre-wrap">{response.individual.grok}</p>
                        </div>
                      )}

                      {response.individual.claude && (
                        <div className="border-l-4 border-purple-500 pl-4">
                          <p className="font-semibold text-sm mb-2">🧠 Claude 4.5 (Analysis):</p>
                          <p className="text-sm whitespace-pre-wrap">{response.individual.claude}</p>
                        </div>
                      )}

                      {response.individual.gpt5 && (
                        <div className="border-l-4 border-green-500 pl-4">
                          <p className="font-semibold text-sm mb-2">🧮 GPT-5 (Quantitative):</p>
                          <p className="text-sm whitespace-pre-wrap">{response.individual.gpt5}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {response.synthesis && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">🎯 Synthesis:</h4>
                      <p className="whitespace-pre-wrap">{response.synthesis}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{response.response}</p>
              )}
            </div>
          </Card>

          <Card className="p-4 bg-muted">
            <h4 className="text-sm font-semibold mb-2">💡 Example Queries with Live Data:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• "Analyze the current price movement" + Ticker: TSLA</li>
              <li>• "Compare today's volume to average" + Ticker: AAPL</li>
              <li>• "Is the stock near 52-week high?" + Ticker: NVDA</li>
              <li>• "What do the moving averages indicate?" + Ticker: MSFT</li>
              <li>• "Analyze the recent trend" + Ticker + Historical Data</li>
            </ul>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 flex items-center gap-1">
              <span>⚠️</span>
              <span>AI uses ONLY the live Yahoo Finance data you provide, not pre-trained knowledge</span>
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
