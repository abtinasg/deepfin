import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Portfolio {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  holdings: Holding[];
}

interface Holding {
  id: string;
  portfolioId: string;
  ticker: string;
  shares: number;
  costBasis: number;
  purchaseDate: string;
  notes: string | null;
  createdAt: string;
}

/**
 * Hook to fetch all portfolios for the current user
 */
export function usePortfolios() {
  return useQuery<Portfolio[]>({
    queryKey: ['portfolios'],
    queryFn: async () => {
      const response = await fetch('/api/portfolio');
      if (!response.ok) throw new Error('Failed to fetch portfolios');
      return response.json();
    },
  });
}

/**
 * Hook to fetch a single portfolio
 */
export function usePortfolio(id: string | null) {
  return useQuery<Portfolio>({
    queryKey: ['portfolio', id],
    queryFn: async () => {
      if (!id) throw new Error('Portfolio ID is required');
      const response = await fetch(`/api/portfolio/${id}`);
      if (!response.ok) throw new Error('Failed to fetch portfolio');
      return response.json();
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new portfolio
 */
export function useCreatePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create portfolio');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
  });
}

/**
 * Hook to update a portfolio
 */
export function useUpdatePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
    }: {
      id: string;
      name?: string;
      description?: string;
    }) => {
      const response = await fetch(`/api/portfolio/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      if (!response.ok) throw new Error('Failed to update portfolio');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio', variables.id] });
    },
  });
}

/**
 * Hook to delete a portfolio
 */
export function useDeletePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/portfolio/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete portfolio');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
  });
}

/**
 * Hook to add a holding to portfolio
 */
export function useAddHolding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      portfolioId,
      ticker,
      shares,
      costBasis,
      purchaseDate,
      notes,
    }: {
      portfolioId: string;
      ticker: string;
      shares: number;
      costBasis: number;
      purchaseDate: string;
      notes?: string;
    }) => {
      const response = await fetch(`/api/portfolio/${portfolioId}/holdings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, shares, costBasis, purchaseDate, notes }),
      });
      if (!response.ok) throw new Error('Failed to add holding');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio', variables.portfolioId] });
    },
  });
}

/**
 * Hook to update a holding
 */
export function useUpdateHolding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      portfolioId,
      holdingId,
      shares,
      costBasis,
      purchaseDate,
      notes,
    }: {
      portfolioId: string;
      holdingId: string;
      shares?: number;
      costBasis?: number;
      purchaseDate?: string;
      notes?: string;
    }) => {
      const response = await fetch(`/api/portfolio/${portfolioId}/holdings/${holdingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shares, costBasis, purchaseDate, notes }),
      });
      if (!response.ok) throw new Error('Failed to update holding');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio', variables.portfolioId] });
    },
  });
}

/**
 * Hook to delete a holding
 */
export function useDeleteHolding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ portfolioId, holdingId }: { portfolioId: string; holdingId: string }) => {
      const response = await fetch(`/api/portfolio/${portfolioId}/holdings/${holdingId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete holding');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio', variables.portfolioId] });
    },
  });
}
