import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Market Dashboard</h1>
        <p className="text-gray-600">Real-time market overview and analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">S&P 500</div>
          <div className="text-2xl font-bold">4,567.89</div>
          <div className="text-sm text-green-600">+1.23%</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">NASDAQ</div>
          <div className="text-2xl font-bold">14,234.56</div>
          <div className="text-sm text-green-600">+0.89%</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">DOW</div>
          <div className="text-2xl font-bold">35,678.90</div>
          <div className="text-sm text-red-600">-0.45%</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">VIX</div>
          <div className="text-2xl font-bold">18.45</div>
          <div className="text-sm text-red-600">+2.34%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Market Movers</h2>
          <div className="space-y-3">
            {[
              {
                ticker: 'AAPL',
                name: 'Apple Inc.',
                price: '178.45',
                change: '+2.34%',
                positive: true,
              },
              {
                ticker: 'MSFT',
                name: 'Microsoft',
                price: '378.91',
                change: '+1.89%',
                positive: true,
              },
              { ticker: 'NVDA', name: 'NVIDIA', price: '456.78', change: '+3.45%', positive: true },
              { ticker: 'TSLA', name: 'Tesla', price: '234.56', change: '-1.23%', positive: false },
              { ticker: 'META', name: 'Meta', price: '334.12', change: '+0.78%', positive: true },
            ].map(stock => (
              <div
                key={stock.ticker}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <div className="font-medium">{stock.ticker}</div>
                  <div className="text-sm text-gray-500">{stock.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${stock.price}</div>
                  <div className={`text-sm ${stock.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {stock.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">AI Insights</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900 mb-1">Market Sentiment</div>
              <div className="text-sm text-blue-700">
                Overall market sentiment is bullish with strong momentum in tech sector.
              </div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="text-sm font-medium text-yellow-900 mb-1">Watch Alert</div>
              <div className="text-sm text-yellow-700">
                VIX approaching resistance level. Consider hedging positions.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
