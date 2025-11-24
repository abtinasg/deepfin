'use client';

import { useQuery } from '@tanstack/react-query';

export function useQuote(symbol: string) {
  return useQuery({
    queryKey: ['quote', symbol],
    queryFn: async () => {
      const response = await fetch(`/api/market/quote?symbol=${symbol}`);
      if (!response.ok) throw new Error('Failed to fetch quote');
      return response.json();
    },
    enabled: !!symbol,
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useStockSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      const response = await fetch(`/api/market/search?q=${query}`);
      if (!response.ok) throw new Error('Failed to search');
      return response.json();
    },
    enabled: query.length >= 1,
  });
}

export function useUserProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await fetch('/api/user/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    },
  });
}
