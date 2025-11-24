'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { Portfolio } from '@/types/portfolio';
import { HoldingsTable } from './holdings-table';
import { AllocationChart } from './allocation-chart';
import { PerformanceChart } from './performance-chart';

interface PortfolioDashboardProps {
  portfolio: Portfolio;
  onAddTransaction?: () => void;
}

export function PortfolioDashboard({ portfolio, onAddTransaction }: PortfolioDashboardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{portfolio.name}</h1>
          {portfolio.description && (
            <p className="text-muted-foreground mt-1">{portfolio.description}</p>
          )}
        </div>
        <Button onClick={onAddTransaction}>
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(portfolio.totalValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Cost: {formatCurrency(portfolio.totalCost)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                portfolio.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(portfolio.totalGainLoss)}
            </div>
            <p
              className={`text-xs mt-1 ${
                portfolio.totalGainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatPercent(portfolio.totalGainLossPercent)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Day Change</CardTitle>
            {portfolio.dayChangePercent >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                portfolio.dayChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(portfolio.dayChange)}
            </div>
            <p
              className={`text-xs mt-1 ${
                portfolio.dayChangePercent >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatPercent(portfolio.dayChangePercent)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolio.holdings.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active positions</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <AllocationChart portfolioId={portfolio.id} />
        <PerformanceChart portfolioId={portfolio.id} />
      </div>

      {/* Holdings Table */}
      <HoldingsTable holdings={portfolio.holdings} />
    </div>
  );
}
