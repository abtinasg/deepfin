'use client';

import { useState, useEffect } from 'react';
import { usePortfolios, usePortfolioRealtime } from '@/hooks/use-portfolio-realtime';
import { PortfolioDashboard } from '@/components/portfolio/portfolio-dashboard';
import { Button } from '@/components/ui/button';
import { useAIContext } from '@/hooks/use-ai-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2 } from 'lucide-react';

export function PortfolioPageClient() {
  const { portfolios, loading: portfoliosLoading, createPortfolio } = usePortfolios();
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | undefined>();
  const { portfolio, loading: portfolioLoading } = usePortfolioRealtime(selectedPortfolioId);
  const { updateContext } = useAIContext();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [newPortfolioDescription, setNewPortfolioDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreatePortfolio = async () => {
    if (!newPortfolioName.trim()) return;

    setCreating(true);
    try {
      const created = await createPortfolio(newPortfolioName, newPortfolioDescription);
      setSelectedPortfolioId(created.id);
      setCreateDialogOpen(false);
      setNewPortfolioName('');
      setNewPortfolioDescription('');
    } catch (error) {
      console.error('Failed to create portfolio:', error);
    } finally {
      setCreating(false);
    }
  };

  // Update AI context when portfolio loads
  useEffect(() => {
    if (portfolio) {
      updateContext({
        portfolioSummary: {
          totalValue: portfolio.totalValue || 0,
          totalGainLoss: portfolio.totalGainLoss || 0,
          totalGainLossPercent: portfolio.totalGainLossPercent || 0,
          topHoldings: (portfolio.holdings || [])
            .sort((a, b) => (b.allocation || 0) - (a.allocation || 0))
            .slice(0, 5)
            .map(h => ({
              ticker: h.ticker,
              allocation: h.allocation || 0,
            })),
        },
      });
    }
  }, [portfolio, updateContext]);

  // Auto-select first portfolio if none selected
  if (!selectedPortfolioId && portfolios.length > 0 && !portfoliosLoading) {
    setSelectedPortfolioId(portfolios[0].id);
  }

  if (portfoliosLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (portfolios.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Portfolios Yet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Create your first portfolio to start tracking your investments.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Create Portfolio
            </Button>
          </CardContent>
        </Card>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Portfolio</DialogTitle>
              <DialogDescription>
                Add a new portfolio to track your investments separately.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Portfolio Name</Label>
                <Input
                  id="name"
                  value={newPortfolioName}
                  onChange={(e) => setNewPortfolioName(e.target.value)}
                  placeholder="My Investment Portfolio"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newPortfolioDescription}
                  onChange={(e) => setNewPortfolioDescription(e.target.value)}
                  placeholder="Long-term growth portfolio..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePortfolio} disabled={creating || !newPortfolioName.trim()}>
                {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Selector */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {portfolios.map((p) => (
            <Button
              key={p.id}
              variant={selectedPortfolioId === p.id ? 'default' : 'outline'}
              onClick={() => setSelectedPortfolioId(p.id)}
            >
              {p.name}
            </Button>
          ))}
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          New Portfolio
        </Button>
      </div>

      {/* Portfolio Dashboard */}
      {portfolioLoading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : portfolio ? (
        <PortfolioDashboard portfolio={portfolio} />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Select a portfolio to view details
        </div>
      )}

      {/* Create Portfolio Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Portfolio</DialogTitle>
            <DialogDescription>
              Add a new portfolio to track your investments separately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Portfolio Name</Label>
              <Input
                id="name"
                value={newPortfolioName}
                onChange={(e) => setNewPortfolioName(e.target.value)}
                placeholder="My Investment Portfolio"
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newPortfolioDescription}
                onChange={(e) => setNewPortfolioDescription(e.target.value)}
                placeholder="Long-term growth portfolio..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePortfolio} disabled={creating || !newPortfolioName.trim()}>
              {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
