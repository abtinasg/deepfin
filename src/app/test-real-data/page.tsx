'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

export default function RealDataTestPage() {
  const [quote, setQuote] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testAPI() {
      try {
        setLoading(true);
        
        // Test direct Finnhub API call
        const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
        if (!apiKey) {
          setError('❌ NEXT_PUBLIC_FINNHUB_API_KEY not found in environment');
          setLoading(false);
          return;
        }

        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=AAPL&token=${apiKey}`
        );

        if (!response.ok) {
          setError(`❌ API Error: ${response.status} ${response.statusText}`);
          setLoading(false);
          return;
        }

        const data = await response.json();
        
        if (data.error) {
          setError(`❌ Finnhub Error: ${data.error}`);
        } else {
          setQuote(data);
          setError(null);
        }
      } catch (err) {
        setError(`❌ Network Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }

    testAPI();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">🧪 Real Data Test</h1>
        
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Finnhub API Test (AAPL)</h2>
          
          {loading && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading...</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-mono text-sm">{error}</p>
            </div>
          )}

          {quote && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-bold">✅ API Connected Successfully!</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white border rounded-lg">
                  <div className="text-sm text-gray-500">Current Price</div>
                  <div className="text-2xl font-bold">${quote.c}</div>
                </div>

                <div className="p-4 bg-white border rounded-lg">
                  <div className="text-sm text-gray-500">Change</div>
                  <div className={`text-2xl font-bold ${quote.d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {quote.d >= 0 ? '+' : ''}{quote.d} ({quote.dp >= 0 ? '+' : ''}{quote.dp}%)
                  </div>
                </div>

                <div className="p-4 bg-white border rounded-lg">
                  <div className="text-sm text-gray-500">High</div>
                  <div className="text-xl font-bold">${quote.h}</div>
                </div>

                <div className="p-4 bg-white border rounded-lg">
                  <div className="text-sm text-gray-500">Low</div>
                  <div className="text-xl font-bold">${quote.l}</div>
                </div>

                <div className="p-4 bg-white border rounded-lg">
                  <div className="text-sm text-gray-500">Open</div>
                  <div className="text-xl font-bold">${quote.o}</div>
                </div>

                <div className="p-4 bg-white border rounded-lg">
                  <div className="text-sm text-gray-500">Previous Close</div>
                  <div className="text-xl font-bold">${quote.pc}</div>
                </div>
              </div>

              <details className="p-4 bg-gray-50 border rounded-lg">
                <summary className="cursor-pointer font-medium">Raw API Response</summary>
                <pre className="mt-4 text-xs overflow-x-auto">
                  {JSON.stringify(quote, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Environment Variables</h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex items-center gap-2">
              <span className={process.env.NEXT_PUBLIC_FINNHUB_API_KEY ? '✅' : '❌'}>
                {process.env.NEXT_PUBLIC_FINNHUB_API_KEY ? '✅' : '❌'}
              </span>
              <span>NEXT_PUBLIC_FINNHUB_API_KEY</span>
              {process.env.NEXT_PUBLIC_FINNHUB_API_KEY && (
                <span className="text-gray-500">
                  ({process.env.NEXT_PUBLIC_FINNHUB_API_KEY.substring(0, 10)}...)
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className={process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY ? '✅' : '❌'}>
                {process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY ? '✅' : '❌'}
              </span>
              <span>NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY</span>
              {process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY && (
                <span className="text-gray-500">
                  ({process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY.substring(0, 10)}...)
                </span>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-bold mb-2">📝 Notes:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Finnhub free tier: 60 API calls/minute</li>
            <li>Data updates every 60 seconds in markets-service.ts</li>
            <li>WebSocket connections require browser refresh</li>
            <li>Check browser console for detailed logs</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
