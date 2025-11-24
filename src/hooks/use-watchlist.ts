import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Watchlist {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  items: WatchlistItem[];
}

interface WatchlistItem {
  id: string;
  watchlistId: string;
  ticker: string;
  addedAt: string;
}

/**
 * Hook to fetch all watchlists for the current user
 */
export function useWatchlists() {
  return useQuery<Watchlist[]>({
    queryKey: ['watchlists'],
    queryFn: async () => {
      const response = await fetch('/api/watchlist');
      if (!response.ok) throw new Error('Failed to fetch watchlists');
      return response.json();
    },
  });
}

/**
 * Hook to fetch a single watchlist
 */
export function useWatchlist(id: string | null) {
  return useQuery<Watchlist>({
    queryKey: ['watchlist', id],
    queryFn: async () => {
      if (!id) throw new Error('Watchlist ID is required');
      const response = await fetch(`/api/watchlist/${id}`);
      if (!response.ok) throw new Error('Failed to fetch watchlist');
      return response.json();
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new watchlist
 */
export function useCreateWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create watchlist');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
    },
  });
}

/**
 * Hook to update a watchlist name
 */
export function useUpdateWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const response = await fetch(`/api/watchlist/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error('Failed to update watchlist');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      queryClient.invalidateQueries({ queryKey: ['watchlist', variables.id] });
    },
  });
}

/**
 * Hook to delete a watchlist
 */
export function useDeleteWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/watchlist/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete watchlist');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
    },
  });
}

/**
 * Hook to add a stock to watchlist
 */
export function useAddToWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ watchlistId, ticker }: { watchlistId: string; ticker: string }) => {
      const response = await fetch(`/api/watchlist/${watchlistId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add to watchlist');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      queryClient.invalidateQueries({ queryKey: ['watchlist', variables.watchlistId] });
    },
  });
}

/**
 * Hook to remove a stock from watchlist
 */
export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ watchlistId, ticker }: { watchlistId: string; ticker: string }) => {
      const response = await fetch(
        `/api/watchlist/${watchlistId}/items?ticker=${encodeURIComponent(ticker)}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) throw new Error('Failed to remove from watchlist');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      queryClient.invalidateQueries({ queryKey: ['watchlist', variables.watchlistId] });
    },
  });
}
