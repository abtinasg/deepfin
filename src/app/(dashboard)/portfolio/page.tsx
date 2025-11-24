import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function PortfolioPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
          <p className="text-gray-600">Track and manage your investments</p>
        </div>
        <button className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700">
          + Add Position
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Total Value</div>
          <div className="text-2xl font-bold">$125,430.56</div>
          <div className="text-sm text-green-600">+$2,345.67 (1.91%)</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Day Change</div>
          <div className="text-2xl font-bold text-green-600">+$1,234.56</div>
          <div className="text-sm text-gray-500">+0.99%</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Total Gain</div>
          <div className="text-2xl font-bold text-green-600">+$15,430.56</div>
          <div className="text-sm text-gray-500">+14.02%</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Cash</div>
          <div className="text-2xl font-bold">$5,234.89</div>
          <div className="text-sm text-gray-500">4.17%</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Holdings</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Symbol
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Shares
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Avg Cost
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Current
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Value
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Gain/Loss
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              {
                symbol: 'AAPL',
                shares: 50,
                avgCost: 145.0,
                current: 178.45,
                value: 8922.5,
                gain: 1672.5,
                gainPct: 23.07,
                positive: true,
              },
              {
                symbol: 'MSFT',
                shares: 25,
                avgCost: 320.0,
                current: 378.91,
                value: 9472.75,
                gain: 1472.75,
                gainPct: 18.41,
                positive: true,
              },
              {
                symbol: 'GOOGL',
                shares: 40,
                avgCost: 125.0,
                current: 141.8,
                value: 5672.0,
                gain: 672.0,
                gainPct: 13.44,
                positive: true,
              },
              {
                symbol: 'NVDA',
                shares: 15,
                avgCost: 400.0,
                current: 456.78,
                value: 6851.7,
                gain: 851.7,
                gainPct: 14.2,
                positive: true,
              },
              {
                symbol: 'TSLA',
                shares: 20,
                avgCost: 250.0,
                current: 234.56,
                value: 4691.2,
                gain: -308.8,
                gainPct: -6.18,
                positive: false,
              },
            ].map(holding => (
              <tr key={holding.symbol} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {holding.symbol}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{holding.shares}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  ${holding.avgCost.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  ${holding.current.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  ${holding.value.toFixed(2)}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm text-right ${holding.positive ? 'text-green-600' : 'text-red-600'}`}
                >
                  {holding.positive ? '+' : ''}${holding.gain.toFixed(2)} (
                  {holding.gainPct.toFixed(2)}%)
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Portfolio Allocation</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { sector: 'Technology', pct: 65, color: 'bg-blue-500' },
            { sector: 'Consumer', pct: 15, color: 'bg-purple-500' },
            { sector: 'Healthcare', pct: 10, color: 'bg-green-500' },
            { sector: 'Finance', pct: 6, color: 'bg-yellow-500' },
            { sector: 'Cash', pct: 4, color: 'bg-gray-400' },
          ].map(alloc => (
            <div key={alloc.sector} className="text-center">
              <div
                className={`w-12 h-12 ${alloc.color} rounded-full mx-auto mb-2 flex items-center justify-center text-white text-xs font-medium`}
              >
                {alloc.pct}%
              </div>
              <div className="text-sm text-gray-600">{alloc.sector}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
