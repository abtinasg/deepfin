import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Alert {
  id: string;
  userId: string;
  ticker: string;
  condition: string;
  threshold: number;
  active: boolean;
  createdAt: string;
}

type AlertCondition =
  | 'price_above'
  | 'price_below'
  | 'volume_spike'
  | 'percent_change_up'
  | 'percent_change_down';

/**
 * Hook to fetch all alerts for the current user
 */
export function useAlerts(activeOnly = false) {
  return useQuery<Alert[]>({
    queryKey: ['alerts', activeOnly],
    queryFn: async () => {
      const url = activeOnly ? '/api/alerts?active=true' : '/api/alerts';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch alerts');
      return response.json();
    },
  });
}

/**
 * Hook to fetch a single alert
 */
export function useAlert(id: string | null) {
  return useQuery<Alert>({
    queryKey: ['alert', id],
    queryFn: async () => {
      if (!id) throw new Error('Alert ID is required');
      const response = await fetch(`/api/alerts/${id}`);
      if (!response.ok) throw new Error('Failed to fetch alert');
      return response.json();
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new alert
 */
export function useCreateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { ticker: string; condition: AlertCondition; threshold: number }) => {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create alert');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

/**
 * Hook to update an alert
 */
export function useUpdateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      active,
      threshold,
      condition,
    }: {
      id: string;
      active?: boolean;
      threshold?: number;
      condition?: AlertCondition;
    }) => {
      const response = await fetch(`/api/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active, threshold, condition }),
      });
      if (!response.ok) throw new Error('Failed to update alert');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert', variables.id] });
    },
  });
}

/**
 * Hook to toggle alert active status
 */
export function useToggleAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const response = await fetch(`/api/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      });
      if (!response.ok) throw new Error('Failed to toggle alert');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

/**
 * Hook to delete an alert
 */
export function useDeleteAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/alerts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete alert');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}
