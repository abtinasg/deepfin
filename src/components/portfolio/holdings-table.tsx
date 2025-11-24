'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Holding } from '@/types/portfolio';

interface HoldingsTableProps {
  holdings: Holding[];
}

export function HoldingsTable({ holdings }: HoldingsTableProps) {
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

  const formatNumber = (value: number, decimals: number = 2) => {
    return value.toFixed(decimals);
  };

  const sortedHoldings = [...holdings].sort((a, b) => b.currentValue - a.currentValue);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Holdings</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead className="text-right">Shares</TableHead>
              <TableHead className="text-right">Avg Cost</TableHead>
              <TableHead className="text-right">Current Price</TableHead>
              <TableHead className="text-right">Market Value</TableHead>
              <TableHead className="text-right">Gain/Loss</TableHead>
              <TableHead className="text-right">Day Change</TableHead>
              <TableHead className="text-right">Allocation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedHoldings.map((holding) => (
              <TableRow key={holding.id}>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-bold">{holding.ticker}</div>
                    {holding.name !== holding.ticker && (
                      <div className="text-xs text-muted-foreground">{holding.name}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">{formatNumber(holding.shares)}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(holding.costBasis)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(holding.currentPrice)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(holding.currentValue)}
                </TableCell>
                <TableCell className="text-right">
                  <div
                    className={
                      holding.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    <div className="font-medium">{formatCurrency(holding.gainLoss)}</div>
                    <div className="text-xs">{formatPercent(holding.gainLossPercent)}</div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div
                    className={`flex items-center justify-end gap-1 ${
                      holding.dayChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {holding.dayChange >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <div>
                      <div className="text-sm font-medium">
                        {formatCurrency(holding.dayChange)}
                      </div>
                      <div className="text-xs">{formatPercent(holding.dayChangePercent)}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">{formatNumber(holding.allocation, 1)}%</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {holdings.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No holdings yet. Add a transaction to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
