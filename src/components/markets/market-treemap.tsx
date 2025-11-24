'use client';

import React, { useMemo } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

export interface MarketData {
  symbol: string;
  sector: string;
  industry: string;
  marketCap: number;
  changePercent: number;
  name?: string; // Optional company name
}

interface MarketTreemapProps {
  data: MarketData[];
}

const COLORS = {
  positive: '#10B981', // emerald-500
  negative: '#EF4444', // red-500
  neutral: '#6B7280',  // gray-500
};

const getColor = (change: number) => {
  if (change > 0) return COLORS.positive;
  if (change < 0) return COLORS.negative;
  return COLORS.neutral;
};

// Custom content renderer for the Treemap cells
const CustomizedContent = (props: any) => {
  const { depth, x, y, width, height, name, changePercent, symbol } = props;

  // Ignore root node
  if (depth === 0) return null;

  const isLeaf = !props.children || props.children.length === 0;
  
  if (!isLeaf) {
    // Render group borders or labels if needed
    // For a clean look, we might just want the leaves, 
    // but maybe a border for sectors.
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: 'none',
            stroke: '#fff',
            strokeWidth: 2 / depth,
            strokeOpacity: 0.5,
            zIndex: 1
          }}
        />
        {depth === 1 && width > 50 && height > 20 && (
             <text
             x={x + 4}
             y={y + 14}
             fill="#fff"
             fontSize={12}
             fontWeight="bold"
             fillOpacity={0.7}
           >
             {name}
           </text>
        )}
      </g>
    );
  }

  const color = getColor(changePercent || 0);
  // Calculate opacity based on magnitude? 
  // Or just solid colors as requested "green for positive, red for negative".
  // Let's use opacity for magnitude to make it "modern" and "dense".
  const opacity = Math.min(Math.abs(changePercent || 0) / 3 + 0.4, 1); 

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: color,
          fillOpacity: opacity,
          stroke: '#fff',
          strokeWidth: 1,
          strokeOpacity: 0.2,
        }}
      />
      {width > 30 && height > 20 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          fill="#fff"
          fontSize={Math.min(width / 4, height / 2, 14)}
          fontWeight="bold"
          dominantBaseline="central"
        >
          {symbol || name}
        </text>
      )}
      {width > 40 && height > 35 && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 14}
          textAnchor="middle"
          fill="#fff"
          fillOpacity={0.8}
          fontSize={Math.min(width / 5, 10)}
          dominantBaseline="central"
        >
          {(changePercent || 0).toFixed(2)}%
        </text>
      )}
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    // Only show tooltip for stocks
    if (!data.symbol) return null;

    return (
      <div className="rounded-lg border border-white/10 bg-slate-900/90 p-3 text-xs text-white shadow-xl backdrop-blur-md">
        <div className="mb-1 font-bold text-sm">{data.symbol}</div>
        <div className="mb-2 text-slate-400">{data.name}</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <span className="text-slate-400">Price</span>
          <span className="text-right font-mono">--</span> {/* We might not have price in the minimal data */}
          
          <span className="text-slate-400">Change</span>
          <span className={`text-right font-mono ${data.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {data.changePercent > 0 ? '+' : ''}{data.changePercent}%
          </span>
          
          <span className="text-slate-400">Market Cap</span>
          <span className="text-right font-mono">
            ${(data.marketCap / 1e9).toFixed(1)}B
          </span>
          
          <span className="text-slate-400">Sector</span>
          <span className="text-right text-slate-300">{data.sector}</span>
          
          <span className="text-slate-400">Industry</span>
          <span className="text-right text-slate-300">{data.industry}</span>
        </div>
      </div>
    );
  }
  return null;
};

export function MarketTreemap({ data }: MarketTreemapProps) {
  const treeData = useMemo(() => {
    // Group by Sector -> Industry
    const sectors: Record<string, any> = {};

    data.forEach(stock => {
      if (!sectors[stock.sector]) {
        sectors[stock.sector] = {
          name: stock.sector,
          children: {}
        };
      }
      
      if (!sectors[stock.sector].children[stock.industry]) {
        sectors[stock.sector].children[stock.industry] = {
          name: stock.industry,
          children: []
        };
      }

      sectors[stock.sector].children[stock.industry].children.push({
        ...stock,
        name: stock.symbol, // Recharts uses 'name' for display
        size: stock.marketCap, // Recharts uses 'size' or 'value'
        value: stock.marketCap // Use value for sizing
      });
    });

    // Convert objects to arrays
    const sectorsArray = Object.values(sectors).map(sector => ({
      ...sector,
      children: Object.values(sector.children).map((industry: any) => ({
        ...industry,
        children: industry.children
      }))
    }));

    // Wrap in a root node to ensure consistent depth
    return [{
      name: 'Market',
      children: sectorsArray
    }];
  }, [data]);

  return (
    <div className="h-[600px] w-full rounded-3xl border border-white/10 bg-slate-950 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={treeData}
          dataKey="value"
          aspectRatio={4 / 3}
          stroke="#fff"
          fill="#8884d8"
          content={<CustomizedContent />}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
