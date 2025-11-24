import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Landmark,
  Monitor,
  LineChart,
  Cpu,
  HeartPulse,
  Banknote,
  ShoppingBag,
  Utensils,
  Zap,
  Factory,
  Hammer,
  Building2,
  Lightbulb,
  Radio,
  Coins,
  Bitcoin,
  FileText,
  Flame
} from 'lucide-react';

const indexIconMap: Record<string, LucideIcon> = {
  '^GSPC': BarChart3,
  '^IXIC': Monitor,
  '^DJI': Landmark,
  '^RUT': LineChart
};

export function getIndexIcon(symbol: string): LucideIcon {
  return indexIconMap[symbol] || LineChart;
}

const sectorIconMap: Record<string, LucideIcon> = {
  technology: Cpu,
  healthcare: HeartPulse,
  financials: Banknote,
  'consumer discretionary': ShoppingBag,
  'consumer staples': Utensils,
  energy: Zap,
  industrials: Factory,
  materials: Hammer,
  'real estate': Building2,
  utilities: Lightbulb,
  telecom: Radio,
  'communication services': Radio,
  consumer: ShoppingBag
};

export function getSectorIcon(name: string): LucideIcon {
  return sectorIconMap[name.toLowerCase()] || BarChart3;
}

const futureIconMap: Record<string, LucideIcon> = {
  CL: Flame,
  GC: Coins,
  BTC: Bitcoin,
  ZN: FileText
};

export function getFutureIcon(symbol: string): LucideIcon {
  return futureIconMap[symbol.toUpperCase()] || LineChart;
}
