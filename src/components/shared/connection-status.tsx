'use client';

import React, { memo } from 'react';
import { ConnectionStatus } from '@/types/market-data';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface ConnectionStatusIndicatorProps {
  status: ConnectionStatus;
  className?: string;
}

export const ConnectionStatusIndicator = memo(function ConnectionStatusIndicator({
  status,
  className = '',
}: ConnectionStatusIndicatorProps) {
  const getStatusInfo = () => {
    if (status.connected) {
      return {
        icon: Wifi,
        color: 'text-green-500',
        label: 'Connected',
        bgColor: 'bg-green-500/10',
      };
    }

    if (status.reconnecting) {
      return {
        icon: RefreshCw,
        color: 'text-yellow-500',
        label: `Reconnecting (${status.reconnectAttempts})`,
        bgColor: 'bg-yellow-500/10',
        animate: true,
      };
    }

    return {
      icon: WifiOff,
      color: 'text-red-500',
      label: status.error || 'Disconnected',
      bgColor: 'bg-red-500/10',
    };
  };

  const info = getStatusInfo();
  const Icon = info.icon;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${info.bgColor} ${className}`}
      title={info.label}
    >
      <Icon
        className={`h-4 w-4 ${info.color} ${info.animate ? 'animate-spin' : ''}`}
      />
      <span className={`text-sm font-medium ${info.color}`}>
        {info.label}
      </span>
    </div>
  );
});
