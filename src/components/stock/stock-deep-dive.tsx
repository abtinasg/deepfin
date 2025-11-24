'use client';

import { StockPageClient } from './stock-page-client';

interface StockDeepDiveProps {
  ticker: string;
}

export function StockDeepDive({ ticker }: StockDeepDiveProps) {
  return <StockPageClient ticker={ticker} />;
}
