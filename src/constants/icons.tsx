import React from 'react';
import type { CategoryItem, GoldHolding, StockItem, Transaction } from '../types';

export interface IconDefinition {
  bg: string;
  stroke: string;
  svgInner: React.ReactNode;
}

export const CATEGORY_ICONS: Record<string, IconDefinition> = {
  utensils: {
    bg: '#fff1eb',
    stroke: '#c2410c',
    svgInner: (
      <>
        <circle cx="12" cy="12" r="9" fill="#fed7aa" fillOpacity="0.72" stroke="none" />
        <path d="M7.5 4.5v5a2 2 0 0 0 4 0v-5M9.5 4.5v15" stroke="#c2410c" />
        <path d="M16.5 4.5v15M16.5 4.5c2 0 2.8 2 2.8 4.2s-.8 3.8-2.8 3.8" stroke="#c2410c" />
      </>
    ),
  },
  coffee: {
    bg: '#fef3e2',
    stroke: '#92400e',
    svgInner: (
      <>
        <path d="M4 9.5h11.5v6.5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9.5Z" fill="#fcd34d" fillOpacity="0.68" stroke="#92400e" />
        <path d="M15.5 10.5H17a2.5 2.5 0 0 1 0 5h-1.5" stroke="#92400e" />
        <path d="M7.2 4.5v2M10 3.5v3M12.8 4.5v2" stroke="#d97706" />
      </>
    ),
  },
  droplet: {
    bg: '#fde8f0',
    stroke: '#9d174d',
    svgInner: (
      <>
        <path d="M12 2.8 17.5 8.4a7.8 7.8 0 1 1-11 0L12 2.8Z" fill="#f9a8d4" fillOpacity="0.72" stroke="#9d174d" />
        <path d="M9.5 14.5a3 3 0 0 0 2.5 2.5" stroke="#be185d" />
      </>
    ),
  },
  bag: {
    bg: '#f5ebff',
    stroke: '#6b21a8',
    svgInner: (
      <>
        <path d="M5.8 7.5h12.4l1.1 11.8a1.5 1.5 0 0 1-1.5 1.7H6.2a1.5 1.5 0 0 1-1.5-1.7L5.8 7.5Z" fill="#d8b4fe" fillOpacity="0.72" stroke="#6b21a8" />
        <path d="M9 7.5V6a3 3 0 0 1 6 0v1.5" stroke="#6b21a8" />
        <path d="M9.5 11.5a2.5 2.5 0 0 0 5 0" stroke="#7e22ce" />
      </>
    ),
  },
  scissors: {
    bg: '#f3e8ff',
    stroke: '#701a75',
    svgInner: (
      <>
        <circle cx="6.5" cy="7" r="2.7" fill="#f0abfc" fillOpacity="0.75" stroke="#701a75" />
        <circle cx="6.5" cy="17" r="2.7" fill="#f0abfc" fillOpacity="0.75" stroke="#701a75" />
        <path d="M8.6 9 19 4.5M8.6 15l10.4 4.5" stroke="#701a75" />
        <path d="M18 10.5l1.2 1-1.2 1-.6 1.2-.6-1.2-1.2-1 1.2-1 .6-1.2.6 1.2Z" fill="#d946ef" stroke="none" />
      </>
    ),
  },
  cart: {
    bg: '#e7f8ef',
    stroke: '#065f46',
    svgInner: (
      <>
        <path d="M5 9.5h15l-1.5 6.8a2 2 0 0 1-2 1.7H8.2a2 2 0 0 1-2-1.7L4.4 5.5H2.2" fill="#6ee7b7" fillOpacity="0.58" stroke="#065f46" />
        <circle cx="9" cy="20.5" r="1.4" fill="#065f46" stroke="none" />
        <circle cx="17" cy="20.5" r="1.4" fill="#065f46" stroke="none" />
      </>
    ),
  },
  car: {
    bg: '#e8f3ff',
    stroke: '#1e40af',
    svgInner: (
      <>
        <path d="M3.8 11.5 5.6 7a2 2 0 0 1 1.9-1.2h9a2 2 0 0 1 1.9 1.2l1.8 4.5v5.2a1 1 0 0 1-1 1h-1.4v-1a1.5 1.5 0 0 0-3 0v1H9.2v-1a1.5 1.5 0 0 0-3 0v1H4.8a1 1 0 0 1-1-1v-5.2Z" fill="#93c5fd" fillOpacity="0.68" stroke="#1e40af" />
        <circle cx="7.5" cy="16.7" r="1.7" fill="#ffffff" stroke="#1e40af" />
        <circle cx="16.5" cy="16.7" r="1.7" fill="#ffffff" stroke="#1e40af" />
        <path d="M4.5 11.5h15" stroke="#1e40af" />
      </>
    ),
  },
  receipt: {
    bg: '#eef2ff',
    stroke: '#3730a3',
    svgInner: (
      <>
        <path d="M5 3v18l2.3-1.4L9.7 21l2.3-1.4L14.3 21l2.4-1.4L19 21V3l-2.3 1.4L14.3 3 12 4.4 9.7 3 7.3 4.4 5 3Z" fill="#a5b4fc" fillOpacity="0.58" stroke="#3730a3" />
        <path d="M8.5 9.5h7M8.5 13.5h4.5" stroke="#3730a3" />
      </>
    ),
  },
  heart: {
    bg: '#ffe9ed',
    stroke: '#9f1239',
    svgInner: (
      <>
        <path d="M12 20.4s-7.4-4.6-9.1-9C1.5 7.8 4 4.3 7.6 4.3c2 0 3.5 1 4.4 2.3.9-1.3 2.4-2.3 4.4-2.3 3.6 0 6.1 3.5 4.7 7.1-1.7 4.4-9.1 9-9.1 9Z" fill="#fda4af" fillOpacity="0.72" stroke="#9f1239" />
      </>
    ),
  },
  ticket: {
    bg: '#fef9e3',
    stroke: '#854d0e',
    svgInner: (
      <>
        <path d="M3 9.2a2 2 0 0 1 0 4v3.3A1.5 1.5 0 0 0 4.5 18h15a1.5 1.5 0 0 0 1.5-1.5v-3.3a2 2 0 0 1 0-4V5.9A1.5 1.5 0 0 0 19.5 4.4h-15A1.5 1.5 0 0 0 3 5.9v3.3Z" fill="#fde047" fillOpacity="0.62" stroke="#854d0e" />
        <path d="M14 5.5v2M14 10.5v2M14 15.5v2" stroke="#a16207" />
      </>
    ),
  },
  gift: {
    bg: '#fff0ea',
    stroke: '#9d174d',
    svgInner: (
      <>
        <rect x="3.8" y="8" width="16.4" height="3.5" rx="1" fill="#fbcfe8" stroke="#9d174d" />
        <path d="M5.5 11.5h13v7a1.5 1.5 0 0 1-1.5 1.5H7a1.5 1.5 0 0 1-1.5-1.7v-6.8Z" fill="#fed7aa" fillOpacity="0.68" stroke="#9d174d" />
        <path d="M12 8v12M8.5 8C7 8 6.5 6.8 6.5 5.8A2 2 0 0 1 8.5 4c2 0 3.5 2 3.5 4 0-2 1.5-4 3.5-4a2 2 0 0 1 2 1.8c0 1-.5 2.2-2 2.2" stroke="#be185d" />
      </>
    ),
  },
  tag: {
    bg: '#e6f7f7',
    stroke: '#115e59',
    svgInner: (
      <>
        <path d="M11.6 3.2H4.7a1.5 1.5 0 0 0-1.5 1.5v6.9l8.6 8.6a2 2 0 0 0 2.8 0l5.6-5.6a2 2 0 0 0 0-2.8l-8.6-8.6Z" fill="#99f6e4" fillOpacity="0.65" stroke="#115e59" />
        <circle cx="7.7" cy="7.7" r="1.3" fill="#115e59" stroke="none" />
      </>
    ),
  },
};

export const CategoryIcon: React.FC<{ icon: string; className?: string }> = ({
  icon,
  className = 'w-4 h-4',
}) => {
  const item = CATEGORY_ICONS[icon] || CATEGORY_ICONS.tag;
  return (
    <svg
      className={`${className} shrink-0`}
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke={item.stroke}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {item.svgInner}
    </svg>
  );
};

export const MARKET_STOCK_PRICES: Record<string, number> = {
  BBCA: 10250,
  BBRI: 4680,
  BMRI: 6750,
  TLKM: 2980,
  ASII: 5150,
  AMMN: 9300,
  BREN: 7100,
  GOTO: 68,
  ICBP: 11400,
  UNVR: 2150,
};

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cat-1', name: 'Food & Dining', icon: 'utensils', suggestions: ['Lunch', 'Dinner', 'Breakfast'] },
  { id: 'cat-2', name: 'Coffee & Cafe', icon: 'coffee', suggestions: ['Matcha latte', 'Iced coffee', 'Pastry'] },
  { id: 'cat-3', name: 'Skincare & Makeup', icon: 'droplet', suggestions: ['Sunscreen', 'Serum', 'Lip tint', 'Cushion'] },
  { id: 'cat-4', name: 'Fashion & OOTD', icon: 'bag', suggestions: ['Dress', 'Bag', 'Shoes', 'Scarf'] },
  { id: 'cat-5', name: 'Salon & Self-Care', icon: 'scissors', suggestions: ['Nail art', 'Hair spa', 'Facial', 'Pilates'] },
  { id: 'cat-6', name: 'Groceries', icon: 'cart', suggestions: ['Fruit & veg', 'Essentials', 'Snacks'] },
  { id: 'cat-7', name: 'Transport', icon: 'car', suggestions: ['Grab / Gojek', 'Fuel', 'Parking'] },
  { id: 'cat-8', name: 'Bills', icon: 'receipt', suggestions: ['Electricity', 'Internet', 'Subscriptions'] },
  { id: 'cat-9', name: 'Health', icon: 'heart', suggestions: ['Vitamins', 'Pharmacy', 'Doctor'] },
  { id: 'cat-10', name: 'Leisure', icon: 'ticket', suggestions: ['Cinema', 'Concert', 'Staycation'] },
  { id: 'cat-11', name: 'Gifts', icon: 'gift', suggestions: ['Birthday gift', 'Hampers', 'Treat'] },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-6',
    title: 'Nail Art & Hair Spa',
    category: 'Salon & Self-Care',
    amount: 580000,
    date: '24 Nov',
    weekIdx: 3,
    method: 'cash',
  },
  {
    id: 'tx-1',
    title: 'Running Shoes & Activewear',
    category: 'Fashion & OOTD',
    amount: 1450000,
    date: '19 Nov',
    weekIdx: 2,
    method: 'cc',
    ccMode: 'installment',
    tenor: 6,
    installmentPaidCount: 1,
    paidThisMonth: false,
  },
  {
    id: 'tx-2',
    title: 'Matcha Latte & Pastry',
    category: 'Coffee & Cafe',
    amount: 185000,
    date: '14 Nov',
    weekIdx: 1,
    method: 'cash',
  },
  {
    id: 'tx-3',
    title: 'Fresh Groceries & Fruit',
    category: 'Groceries',
    amount: 640000,
    date: '11 Nov',
    weekIdx: 1,
    method: 'cc',
    ccMode: 'full',
    tenor: 1,
    installmentPaidCount: 0,
    paidThisMonth: false,
  },
  {
    id: 'tx-4',
    title: 'Serum & Sunscreen',
    category: 'Skincare & Makeup',
    amount: 1120000,
    date: '06 Nov',
    weekIdx: 0,
    method: 'cc',
    ccMode: 'installment',
    tenor: 3,
    installmentPaidCount: 2,
    paidThisMonth: false,
  },
  {
    id: 'tx-5',
    title: 'Electricity & Home WiFi',
    category: 'Bills',
    amount: 845000,
    date: '03 Nov',
    weekIdx: 0,
    method: 'cash',
  },
];

export const INITIAL_STOCKS: StockItem[] = [
  { id: 'st-1', code: 'BBCA', lots: 15, avgBuy: 9200, currentPrice: 10250 },
  { id: 'st-2', code: 'TLKM', lots: 40, avgBuy: 3250, currentPrice: 2980 },
  { id: 'st-3', code: 'BMRI', lots: 20, avgBuy: 6100, currentPrice: 6750 },
];

export const INITIAL_GOLD_HOLDINGS: GoldHolding[] = [
  { id: 'gd-1', type: 'spot', grams: 12.5, avgBuy: 1280000, label: 'Digital Gold Savings' },
  { id: 'gd-2', type: 'antam', grams: 20, avgBuy: 1360000, label: 'Antam Bars 2x10g' },
];
