'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AllocationData } from '@/types/portfolio';

interface AllocationChartProps {
  portfolioId: string;
}

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7c7c',
];

export function AllocationChart({ portfolioId }: AllocationChartProps) {
  const [allocation, setAllocation] = useState<AllocationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllocation = async () => {
      try {
        const response = await fetch(`/api/portfolio/${portfolioId}/allocation`);
        if (!response.ok) throw new Error('Failed to fetch allocation');
        const data = await response.json();
        setAllocation(data);
      } catch (error) {
        console.error('Error fetching allocation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllocation();
  }, [portfolioId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!allocation || allocation.bySector.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = allocation.bySector.map((item, index) => ({
    name: item.name,
    value: item.value,
    percentage: item.percentage,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Allocation by Sector</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(1)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) =>
                new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(value)
              }
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-6 space-y-2">
          <h4 className="font-semibold text-sm">Concentration Metrics</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Top 5</p>
              <p className="font-medium">{allocation.concentration.top5.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Top 10</p>
              <p className="font-medium">{allocation.concentration.top10.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Herfindahl</p>
              <p className="font-medium">{allocation.concentration.herfindahlIndex.toFixed(3)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
