import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function ScreenerPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Stock Screener</h1>
        <p className="text-gray-600">Find stocks matching your criteria</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Market Cap</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option>All</option>
              <option>Large Cap (&gt;$10B)</option>
              <option>Mid Cap ($2B-$10B)</option>
              <option>Small Cap (&lt;$2B)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option>All</option>
              <option>Technology</option>
              <option>Healthcare</option>
              <option>Finance</option>
              <option>Energy</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">P/E Ratio</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option>Any</option>
              <option>&lt;15</option>
              <option>15-25</option>
              <option>&gt;25</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dividend Yield</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option>Any</option>
              <option>&gt;0%</option>
              <option>&gt;2%</option>
              <option>&gt;4%</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700">
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Company
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Change
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Market Cap
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                P/E
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              {
                symbol: 'AAPL',
                name: 'Apple Inc.',
                price: '178.45',
                change: '+2.34%',
                marketCap: '2.8T',
                pe: '28.5',
                positive: true,
              },
              {
                symbol: 'MSFT',
                name: 'Microsoft Corporation',
                price: '378.91',
                change: '+1.89%',
                marketCap: '2.8T',
                pe: '35.2',
                positive: true,
              },
              {
                symbol: 'GOOGL',
                name: 'Alphabet Inc.',
                price: '141.80',
                change: '+0.92%',
                marketCap: '1.8T',
                pe: '25.8',
                positive: true,
              },
              {
                symbol: 'AMZN',
                name: 'Amazon.com Inc.',
                price: '178.25',
                change: '-0.45%',
                marketCap: '1.8T',
                pe: '78.4',
                positive: false,
              },
              {
                symbol: 'NVDA',
                name: 'NVIDIA Corporation',
                price: '456.78',
                change: '+3.45%',
                marketCap: '1.1T',
                pe: '62.1',
                positive: true,
              },
            ].map(stock => (
              <tr key={stock.symbol} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {stock.symbol}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stock.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">${stock.price}</td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm text-right ${stock.positive ? 'text-green-600' : 'text-red-600'}`}
                >
                  {stock.change}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                  {stock.marketCap}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                  {stock.pe}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
