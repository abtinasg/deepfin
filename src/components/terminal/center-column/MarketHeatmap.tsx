'use client';

import { useQuery } from '@tanstack/react-query';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { TerminalModule } from '../TerminalModule';

interface HeatmapStock {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  marketCap: number;
  changePercent: number;
  price: number;
  change: number;
  volume: number;
}

interface TreemapNode {
  name: string;
  size: number;
  changePercent: number;
  symbol: string;
  price: number;
  children?: TreemapNode[];
}

/**
 * Get color based on change percentage
 */
function getColor(changePercent: number): string {
  if (changePercent > 3) return '#10b981'; // emerald-500
  if (changePercent > 1) return '#34d399'; // emerald-400
  if (changePercent > 0) return '#6ee7b7'; // emerald-300
  if (changePercent === 0) return '#64748b'; // slate-500
  if (changePercent > -1) return '#fca5a5'; // rose-300
  if (changePercent > -3) return '#f87171'; // rose-400
  return '#ef4444'; // rose-500
}

/**
 * Custom treemap content renderer
 */
const CustomTreemapContent = (props: any) => {
  const { x, y, width, height, name, changePercent, symbol, price } = props;

  // Only show label if cell is large enough
  const showLabel = width > 60 && height > 40;
  const showDetails = width > 100 && height > 60;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: getColor(changePercent),
          stroke: 'rgba(0, 0, 0, 0.3)',
          strokeWidth: 1,
        }}
      />
      {showLabel && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#ffffff"
          fontSize={showDetails ? 12 : 10}
          fontWeight="600"
          fontFamily="'Inter', sans-serif"
        >
          <tspan x={x + width / 2} dy={showDetails ? -8 : 0}>
            {symbol}
          </tspan>
          {showDetails && (
            <>
              <tspan x={x + width / 2} dy={14} fontSize={10} opacity={0.9}>
                ${price.toFixed(2)}
              </tspan>
              <tspan x={x + width / 2} dy={14} fontSize={11} fontWeight="700">
                {changePercent >= 0 ? '+' : ''}
                {changePercent.toFixed(2)}%
              </tspan>
            </>
          )}
        </text>
      )}
    </g>
  );
};

/**
 * Custom tooltip
 */
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-layer-2 border border-white/10 rounded-lg p-3 shadow-2xl">
      <div className="text-terminal-sm font-mono font-semibold text-white mb-1">
        {data.symbol}
      </div>
      <div className="text-terminal-xs text-slate-400 mb-2">{data.name}</div>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-terminal-xs text-slate-500">Price:</span>
          <span className="text-terminal-xs font-mono text-white">
            ${data.price?.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-terminal-xs text-slate-500">Change:</span>
          <span
            className={`text-terminal-xs font-mono font-semibold ${
              data.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {data.changePercent >= 0 ? '+' : ''}
            {data.changePercent?.toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-terminal-xs text-slate-500">Market Cap:</span>
          <span className="text-terminal-xs font-mono text-white">
            ${(data.size / 1e9).toFixed(1)}B
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * MarketHeatmap - Treemap visualization of market sectors
 */
export function MarketHeatmap() {
  const { data, isLoading } = useQuery<{ data: HeatmapStock[] }>({
    queryKey: ['market-heatmap'],
    queryFn: async () => {
      const response = await fetch('/api/markets/heatmap');
      if (!response.ok) {
        throw new Error('Failed to fetch heatmap data');
      }
      return response.json();
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 60000,
  });

  // Transform data for treemap
  const treemapData: TreemapNode[] | undefined = data?.data.map((stock) => ({
    name: stock.name,
    symbol: stock.symbol,
    size: stock.marketCap,
    changePercent: stock.changePercent,
    price: stock.price,
  }));

  return (
    <TerminalModule
      title="Market Heatmap"
      subtitle="S&P 500 by Market Cap"
      height="480px"
      isLive={!isLoading}
    >
      {isLoading ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-terminal-sm text-slate-400">Loading heatmap...</div>
        </div>
      ) : !treemapData || treemapData.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-terminal-base text-slate-400">No data available</div>
            <div className="text-terminal-sm text-slate-600 mt-1">
              Try again in a moment
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treemapData}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="rgba(0, 0, 0, 0.3)"
              fill="#10b981"
              content={<CustomTreemapContent />}
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="absolute bottom-2 right-2 bg-layer-2/90 backdrop-blur-sm border border-white/10 rounded px-3 py-2">
            <div className="flex items-center gap-4 text-terminal-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }} />
                <span className="text-slate-400">+3%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#6ee7b7' }} />
                <span className="text-slate-400">+1%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#64748b' }} />
                <span className="text-slate-400">0%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#fca5a5' }} />
                <span className="text-slate-400">-1%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }} />
                <span className="text-slate-400">-3%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </TerminalModule>
  );
}
