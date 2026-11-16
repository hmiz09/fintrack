export type PaymentMethod = 'cash' | 'cc';
export type CcMode = 'full' | 'installment';

export interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  weekIdx: number;
  method: PaymentMethod;
  ccMode?: CcMode;
  tenor?: number;
  installmentPaidCount?: number;
  paidThisMonth?: boolean;
}

export interface StockItem {
  id: string;
  code: string;
  lots: number;
  avgBuy: number;
  currentPrice: number;
}

export type GoldType = 'spot' | 'antam';

export interface GoldHolding {
  id: string;
  type: GoldType;
  grams: number;
  avgBuy: number;
  label: string;
}

export interface GoldPrices {
  spot: number;
  antam: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  suggestions: string[];
}

export interface MonthlyHistoryItem {
  label: string;
  total: number;
}

export type ActiveTab = 'dashboard' | 'activity' | 'cc' | 'assets';
export type ChartMode = 'week' | 'month';
export type SyncStatus = 'disconnected' | 'connecting' | 'connected' | 'syncing' | 'error';
