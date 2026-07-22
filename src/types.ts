export type BandarStatus = 'Big Accumulation' | 'Accumulation' | 'Neutral' | 'Distribution' | 'Big Distribution';

export interface Stock {
  code: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number; // in lots
  marketCap: number; // in IDR
  bandarStatus: BandarStatus;
  signalStrength: number; // 0 - 100
  foreignNetBuy: number; // in IDR
  volumeBreakoutRatio: number; // e.g. 1.5x average
}

export interface PriceHistory {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number; // in lots
  bandarInventory: number; // accumulated net lots
}

export interface StockDetail extends Stock {
  history: PriceHistory[];
  summaryText: string;
}

export interface WatchlistItem {
  code: string;
  addedAt: string;
  alertEnabled: boolean;
}

export interface UserProfile {
  email: string;
  isPremium: boolean;
  premiumUntil: string | null;
  subscriptionPlan: 'Free' | 'Pro Monthly' | 'Pro Yearly' | 'Akses Pribadi';
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  readTime: string;
  date: string;
}

export interface MAScreenerItem {
  code: string;
  name: string;
  sector: string;
  price: number;
  ma20: number;
  ma50: number;
  ma200: number;
  ma50Slope: string;
  ma50SlopeType: 'up' | 'flat' | 'down';
  signalName: string;
  strategyCategory: 'golden_cross' | 'death_cross' | 'trend_stacking' | 'pullback' | 'ma200_breakout' | 'squeeze';
  volumeConfirm: string;
  isVolumeConfirmed: boolean;
  signalRating: '🟢 Kuat' | '🟡 Sedang' | '🔴 Lemah';
  rsi14: number;
  rsiStatus: 'Netral' | 'Zona Ekstrem / Overbought (>75)' | 'Zona Ekstrem / Oversold (<25)';
  whipsawStatus: 'Stabil' | 'Choppy / Whipsaw (<5 Hari)';
  isWhipsaw: boolean;
  marketCap: number;
  volume: number;
  timeframe: 'Daily' | 'Weekly';
  entryLevel: string;
  targetPrice: number;
  stopLoss: number;
  riskRewardRatio: string;
  actionNote: string;
  isEarlyWarning: boolean;
  isFalseSignalRisk: boolean;
  falseSignalReason?: string;
}
