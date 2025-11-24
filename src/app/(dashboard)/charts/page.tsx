import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function ChartsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Charts</h1>
        <p className="text-gray-600">Advanced charting and technical analysis</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search symbol..."
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-48"
            />
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option>1D</option>
              <option>1W</option>
              <option>1M</option>
              <option>3M</option>
              <option>1Y</option>
              <option>5Y</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              Candlestick
            </button>
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              Line
            </button>
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              Area
            </button>
          </div>
        </div>

        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
            <p className="text-sm">Chart will be rendered here</p>
            <p className="text-xs mt-1">Using TradingView Lightweight Charts</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Technical Indicators</h2>
          <div className="space-y-3">
            {['RSI (14)', 'MACD', 'Bollinger Bands', 'Moving Averages', 'Volume'].map(indicator => (
              <div key={indicator} className="flex items-center justify-between py-2">
                <span className="text-sm">{indicator}</span>
                <button className="text-xs text-blue-600 hover:text-blue-700">Add</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Drawing Tools</h2>
          <div className="grid grid-cols-4 gap-2">
            {['Line', 'Ray', 'Trend', 'Fib', 'Rect', 'Circle', 'Text', 'Arrow'].map(tool => (
              <button
                key={tool}
                className="px-3 py-2 text-xs border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                {tool}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
