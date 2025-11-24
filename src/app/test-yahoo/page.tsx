'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestYahooPage() {
  const [indices, setIndices] = useState<any[]>([]);
  const [movers, setMovers] = useState<any[]>([]);
  const [yahooTest, setYahooTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testYahooIntegration() {
      try {
        // Test Yahoo Finance directly through API
        const yahooRes = await fetch('/api/markets/test-yahoo?symbol=AAPL');
        const yahooData = await yahooRes.json();
        console.log('Yahoo Finance test:', yahooData);
        setYahooTest(yahooData);

        // Test through our API endpoints (server-side only)
        const indicesRes = await fetch('/api/markets/indices');
        const indicesData = await indicesRes.json();
        console.log('Indices from API:', indicesData);
        setIndices(indicesData.indices || []);

        const moversRes = await fetch('/api/markets/movers?type=gainers');
        const moversData = await moversRes.json();
        console.log('Movers from API:', moversData);
        setMovers(moversData.movers || []);

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    testYahooIntegration();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Testing Yahoo Finance Integration</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Testing Yahoo Finance Integration</h1>
        <Card className="bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Yahoo Finance Integration Test</h1>
      
      <div className="grid gap-6 mb-8">
        {yahooTest && (
          <Card className={yahooTest.success ? 'bg-green-50' : 'bg-red-50'}>
            <CardHeader>
              <CardTitle>Direct Yahoo Finance Test (AAPL)</CardTitle>
            </CardHeader>
            <CardContent>
              {yahooTest.success ? (
                <div className="space-y-2">
                  <p className="font-medium text-green-600">✅ Yahoo Finance API Working!</p>
                  <div className="bg-white p-4 rounded border">
                    <p><strong>Symbol:</strong> {yahooTest.data.symbol}</p>
                    <p><strong>Price:</strong> ${yahooTest.data.regularMarketPrice?.toFixed(2)}</p>
                    <p><strong>Change:</strong> {yahooTest.data.regularMarketChange?.toFixed(2)} ({yahooTest.data.regularMarketChangePercent?.toFixed(2)}%)</p>
                    <p><strong>Volume:</strong> {yahooTest.data.regularMarketVolume?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-2">Source: {yahooTest.source}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-red-600">❌ Yahoo Finance API Failed</p>
                  <p className="text-sm text-gray-600 mt-2">{yahooTest.error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>US Market Indices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {indices.length > 0 ? (
                indices.map((index, i) => (
                  <div key={i} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{index.symbol}</p>
                      <p className="text-sm text-gray-500">{index.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${index.current?.toFixed(2) || 'N/A'}</p>
                      <p className={`text-sm ${(index.changePercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(index.changePercent || 0) >= 0 ? '+' : ''}{index.changePercent?.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No indices data</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Movers (Gainers)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {movers.length > 0 ? (
                movers.map((mover, i) => (
                  <div key={i} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{mover.ticker}</p>
                      <p className="text-sm text-gray-500">{mover.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${mover.price?.toFixed(2) || 'N/A'}</p>
                      <p className={`text-sm ${(mover.changePercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(mover.changePercent || 0) >= 0 ? '+' : ''}{mover.changePercent?.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No movers data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>✅ Yahoo Finance API (server-side)</p>
            <p>✅ markets-service.ts using Yahoo as primary</p>
            <p>✅ Finnhub available as fallback</p>
            <p className="text-sm text-gray-600 mt-4">
              <strong>Note:</strong> Yahoo Finance API calls are made server-side only to avoid CORS issues.
              Client-side components use our Next.js API routes (/api/markets/*).
            </p>
            <p className="text-sm text-gray-600">
              Check browser console for API response logs.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
