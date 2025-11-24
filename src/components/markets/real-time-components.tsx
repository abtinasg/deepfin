'use client';

import React, { memo } from 'react';
import { useMarketData } from '@/hooks/use-market-data';
import { ConnectionStatusIndicator } from '@/components/shared/connection-status';
import { IndexCard } from '@/components/markets/index-card';
import { MarketIndex } from '@/types/market';

interface RealTimeIndexProps {
  symbol: string;
  name: string;
  icon?: string;
}

export const RealTimeIndex = memo(function RealTimeIndex({ 
  symbol, 
  name, 
  icon 
}: RealTimeIndexProps) {
  const { data, isLoading, connectionStatus } = useMarketData([symbol]);
  const stockData = data[0];

  if (isLoading || !stockData) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const indexData: MarketIndex = {
    symbol: stockData.symbol,
    name,
    price: stockData.price,
    change: stockData.change,
    changePercent: stockData.changePercent,
    isLive: connectionStatus.connected,
    icon,
  };

  return <IndexCard index={indexData} />;
});

interface RealTimeMarketsHeaderProps {
  symbols: string[];
  title?: string;
}

export const RealTimeMarketsHeader = memo(function RealTimeMarketsHeader({ 
  symbols,
  title = 'Real-Time Market Data'
}: RealTimeMarketsHeaderProps) {
  const { connectionStatus } = useMarketData(symbols);

  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <ConnectionStatusIndicator status={connectionStatus} />
    </div>
  );
});
