import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  DEFAULT_CATEGORIES,
  INITIAL_GOLD_HOLDINGS,
  INITIAL_STOCKS,
  INITIAL_TRANSACTIONS,
  MARKET_STOCK_PRICES,
} from '../constants/icons';
import type {
  ActiveTab,
  CategoryItem,
  ChartMode,
  GoldHolding,
  GoldPrices,
  MonthlyHistoryItem,
  StockItem,
  Transaction,
} from '../types';

export interface FinTrackMetrics {
  stockValue: number;
  stockCost: number;
  stockPL: number;
  goldSpotVal: number;
  goldSpotCost: number;
  goldSpotGrams: number;
  goldSpotPL: number;
  goldAntamVal: number;
  goldAntamCost: number;
  goldAntamGrams: number;
  goldAntamPL: number;
  totalGoldVal: number;
  totalGoldPL: number;
  totalAsset: number;
  totalAssetCost: number;
  totalAssetPL: number;
  totalAssetPLPct: number;
  thisMonthTotal: number;
  lastMonthTotal: number;
  thisMonthWeekly: number[];
  ccItems: Transaction[];
  ccDueUnpaid: number;
  ccDueTotal: number;
  ccUsedLimit: number;
  ccAvailableLimit: number;
  ccLimitPct: number;
}

interface FinTrackContextType {
  userName: string;
  setUserName: (name: string) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab, highlightCcId?: string | null) => void;
  chartMode: ChartMode;
  setChartMode: (mode: ChartMode) => void;
  compareOct: boolean;
  setCompareOct: (comp: boolean) => void;
  selectedWeekIdx: number;
  setSelectedWeekIdx: (idx: number) => void;
  selectedMonthIdx: number;
  setSelectedMonthIdx: (idx: number) => void;
  cashBalance: number;
  setCashBalance: (val: number) => void;
  ccLimit: number;
  setCcLimit: (val: number) => void;
  ccDueDate: number;
  setCcDueDate: (day: number) => void;
  categories: CategoryItem[];
  addCategory: (item: Omit<CategoryItem, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<CategoryItem>) => void;
  deleteCategory: (id: string) => void;
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  stocks: StockItem[];
  addStock: (code: string, lots: number, avgBuy: number) => void;
  updateStock: (id: string, updates: Partial<StockItem>) => void;
  deleteStock: (id: string) => void;
  goldPrices: GoldPrices;
  goldHoldings: GoldHolding[];
  addGoldHolding: (item: Omit<GoldHolding, 'id'>) => void;
  updateGoldHolding: (id: string, updates: Partial<GoldHolding>) => void;
  deleteGoldHolding: (id: string) => void;
  monthlyHistory: MonthlyHistoryItem[];
  lastMonthWeekly: number[];
  expandedCcId: string | null;
  setExpandedCcId: (id: string | null) => void;
  highlightedCcId: string | null;
  setHighlightedCcId: (id: string | null) => void;
  metrics: FinTrackMetrics;
  payAllCcDue: () => void;
  updateCcItem: (id: string, updates: Partial<Transaction>) => void;
  resetAllData: () => void;
  resetToZero: () => void;
  exportData: () => string;
  importData: (jsonStr: string) => boolean;
  lastMarketSync: number | null;
  isSyncingMarket: boolean;
  fetchMarketPrices: () => Promise<void>;
}

const STORAGE_KEY = 'fintrack_state_v2';

export const getTxMonthlyBill = (tx: Transaction): number => {
  if (!tx || tx.method !== 'cc') return 0;
  return tx.ccMode === 'installment' && tx.tenor && tx.tenor > 0
    ? Math.round(tx.amount / tx.tenor)
    : tx.amount;
};

export const getTxCcHold = (tx: Transaction): number => {
  if (!tx || tx.method !== 'cc') return 0;
  if (tx.ccMode === 'full') return tx.paidThisMonth ? 0 : tx.amount;
  const monthly = getTxMonthlyBill(tx);
  const paidMonths = (tx.installmentPaidCount || 0) + (tx.paidThisMonth ? 1 : 0);
  const remaining = Math.max(0, (tx.tenor || 1) - paidMonths);
  return remaining * monthly;
};

const FinTrackContext = createContext<FinTrackContextType | undefined>(undefined);

export const FinTrackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userName, setUserNameState] = useState<string>('Rose');
  const [activeTab, setActiveTabState] = useState<ActiveTab>('dashboard');
  const [chartMode, setChartMode] = useState<ChartMode>('week');
  const [compareOct, setCompareOct] = useState(false);
  const [selectedWeekIdx, setSelectedWeekIdx] = useState(3);
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(5);
  const [expandedCcId, setExpandedCcId] = useState<string | null>(null);
  const [highlightedCcId, setHighlightedCcId] = useState<string | null>(null);

  const [cashBalance, setCashBalanceState] = useState(18250000);
  const [ccLimit, setCcLimitState] = useState(20000000);
  const [ccDueDate, setCcDueDateState] = useState(25);
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [stocks, setStocks] = useState<StockItem[]>(INITIAL_STOCKS);
  const [goldPrices, setGoldPricesState] = useState<GoldPrices>({ spot: 1425000, antam: 1540000 });
  const [lastMarketSync, setLastMarketSync] = useState<number | null>(null);
  const [isSyncingMarket, setIsSyncingMarket] = useState<boolean>(false);
  const [goldHoldings, setGoldHoldings] = useState<GoldHolding[]>(INITIAL_GOLD_HOLDINGS);
  const [monthlyHistory] = useState<MonthlyHistoryItem[]>([
    { label: 'Jun', total: 4950000 },
    { label: 'Jul', total: 5380000 },
    { label: 'Aug', total: 4620000 },
    { label: 'Sep', total: 5190000 },
  ]);
  const [lastMonthWeekly] = useState<number[]>([1420000, 1280000, 1510000, 1240000]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.userName === 'string' && parsed.userName.trim()) {
          setUserNameState(parsed.userName.trim());
        }
        if (typeof parsed.cashBalance === 'number') setCashBalanceState(parsed.cashBalance);
        if (typeof parsed.ccLimit === 'number') setCcLimitState(parsed.ccLimit);
        if (typeof parsed.ccDueDate === 'number') setCcDueDateState(parsed.ccDueDate);
        if (Array.isArray(parsed.categories)) setCategories(parsed.categories);
        if (Array.isArray(parsed.transactions)) setTransactions(parsed.transactions);
        if (Array.isArray(parsed.stocks)) setStocks(parsed.stocks);
        if (Array.isArray(parsed.goldHoldings)) setGoldHoldings(parsed.goldHoldings);
        if (parsed.goldPrices && typeof parsed.goldPrices.spot === 'number' && typeof parsed.goldPrices.antam === 'number') {
          setGoldPricesState(parsed.goldPrices);
        }
      }
    } catch {
      // Keep default on parse error
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      const payload = {
        userName,
        cashBalance,
        ccLimit,
        ccDueDate,
        categories,
        transactions,
        stocks,
        goldHoldings,
        goldPrices,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Storage quota or error safe guard
    }
  }, [userName, cashBalance, ccLimit, ccDueDate, categories, transactions, stocks, goldHoldings, goldPrices]);

  const setActiveTab = (tab: ActiveTab, highlightId: string | null = null) => {
    setActiveTabState(tab);
    setHighlightedCcId(highlightId);
    setExpandedCcId(tab === 'cc' ? highlightId : null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addTransaction = (txData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    if (newTx.method === 'cash') {
      setCashBalanceState((prev) => Math.max(0, prev - newTx.amount));
    }
  };

  const updateTransaction = (updated: Transaction) => {
    const old = transactions.find((t) => t.id === updated.id);
    setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

    if (old) {
      let deltaCash = 0;
      if (old.method === 'cash') deltaCash += old.amount;
      if (updated.method === 'cash') deltaCash -= updated.amount;
      if (deltaCash !== 0) {
        setCashBalanceState((prev) => Math.max(0, prev + deltaCash));
      }
    }
  };

  const deleteTransaction = (id: string) => {
    const old = transactions.find((t) => t.id === id);
    if (old && old.method === 'cash') {
      setCashBalanceState((prev) => prev + old.amount);
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const setCashBalance = (val: number) => {
    setCashBalanceState(Math.max(0, Math.round(val)));
  };

  const setCcLimit = (val: number) => {
    setCcLimitState(Math.max(0, Math.round(val)));
  };

  const setCcDueDate = (day: number) => {
    setCcDueDateState(Math.max(1, Math.min(31, Math.round(day))));
  };

  const payAllCcDue = () => {
    let totalDeduction = 0;
    const updated = transactions.map((t) => {
      if (t.method === 'cc' && !t.paidThisMonth) {
        totalDeduction += getTxMonthlyBill(t);
        return { ...t, paidThisMonth: true };
      }
      return t;
    });

    setTransactions(updated);
    setCashBalanceState((prev) => Math.max(0, prev - totalDeduction));
  };

  const updateCcItem = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
          return updated;
        }
        return t;
      })
    );
  };

  const addCategory = (item: Omit<CategoryItem, 'id'>) => {
    const newCat: CategoryItem = {
      ...item,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const updateCategory = (id: string, updates: Partial<CategoryItem>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const fetchMarketPrices = async () => {
    try {
      setIsSyncingMarket(true);
      const stockCodes = Array.from(new Set(stocks.map((s) => s.code))).filter(Boolean);
      const queryStr = stockCodes.length > 0 ? `?symbols=${encodeURIComponent(stockCodes.join(','))}` : '';
      const resp = await fetch(`/api/market-prices${queryStr}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.success) {
          if (data.gold && typeof data.gold.spot === 'number' && typeof data.gold.antam === 'number') {
            setGoldPricesState(data.gold);
          }
          if (data.stocks && typeof data.stocks === 'object') {
            setStocks((prev) =>
              prev.map((s) => {
                const livePrice = data.stocks[s.code];
                if (typeof livePrice === 'number' && livePrice > 0) {
                  return { ...s, currentPrice: livePrice };
                }
                return s;
              })
            );
          }
          setLastMarketSync(Date.now());
        }
      }
    } catch {
      // Offline / network failure: keep current cached prices
    } finally {
      setIsSyncingMarket(false);
    }
  };

  // Background auto-sync: on mount, every 60s, and when returning to app tab
  useEffect(() => {
    fetchMarketPrices();

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchMarketPrices();
      }
    }, 60000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchMarketPrices();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [stocks.length]);

  const addStock = async (code: string, lots: number, avgBuy: number) => {
    const upper = code.trim().toUpperCase();
    const currentPrice = MARKET_STOCK_PRICES[upper] || avgBuy;
    const newStock: StockItem = {
      id: `st-${Date.now()}`,
      code: upper,
      lots: Math.max(1, lots),
      avgBuy: Math.max(1, avgBuy),
      currentPrice,
    };
    setStocks((prev) => [...prev, newStock]);

    // Live price fetch for newly added stock
    try {
      const resp = await fetch(`/api/market-prices?symbols=${encodeURIComponent(upper)}`);
      if (resp.ok) {
        const data = await resp.json();
        const livePrice = data?.stocks?.[upper];
        if (typeof livePrice === 'number' && livePrice > 0) {
          setStocks((prev) =>
            prev.map((s) => (s.id === newStock.id ? { ...s, currentPrice: livePrice } : s))
          );
        }
      }
    } catch {
      // Keep initial currentPrice
    }
  };

  const updateStock = (id: string, updates: Partial<StockItem>) => {
    setStocks((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteStock = (id: string) => {
    setStocks((prev) => prev.filter((s) => s.id !== id));
  };

  const addGoldHolding = (item: Omit<GoldHolding, 'id'>) => {
    const newGold: GoldHolding = {
      ...item,
      id: `gd-${Date.now()}`,
    };
    setGoldHoldings((prev) => [...prev, newGold]);
  };

  const updateGoldHolding = (id: string, updates: Partial<GoldHolding>) => {
    setGoldHoldings((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const deleteGoldHolding = (id: string) => {
    setGoldHoldings((prev) => prev.filter((g) => g.id !== id));
  };

  const setUserName = (name: string) => {
    const trimmed = name.trim();
    setUserNameState(trimmed || 'Rose');
  };

  const resetToZero = () => {
    setTransactions([]);
    setStocks([]);
    setGoldHoldings([]);
    setCashBalanceState(0);
    setCcLimitState(0);
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUserNameState('Rose');
    setCashBalanceState(18250000);
    setCcLimitState(20000000);
    setCcDueDateState(25);
    setCategories(DEFAULT_CATEGORIES);
    setTransactions(INITIAL_TRANSACTIONS);
    setStocks(INITIAL_STOCKS);
    setGoldHoldings(INITIAL_GOLD_HOLDINGS);
  };

  const exportData = (): string => {
    const payload = {
      version: 2,
      exportDate: new Date().toISOString(),
      userName,
      cashBalance,
      ccLimit,
      ccDueDate,
      categories,
      transactions,
      stocks,
      goldHoldings,
    };
    return JSON.stringify(payload, null, 2);
  };

  const importData = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (typeof parsed.userName === 'string') setUserNameState(parsed.userName.trim() || 'Rose');
      if (typeof parsed.cashBalance === 'number') setCashBalanceState(parsed.cashBalance);
      if (typeof parsed.ccLimit === 'number') setCcLimitState(parsed.ccLimit);
      if (typeof parsed.ccDueDate === 'number') setCcDueDateState(parsed.ccDueDate);
      if (Array.isArray(parsed.categories)) setCategories(parsed.categories);
      if (Array.isArray(parsed.transactions)) setTransactions(parsed.transactions);
      if (Array.isArray(parsed.stocks)) setStocks(parsed.stocks);
      if (Array.isArray(parsed.goldHoldings)) setGoldHoldings(parsed.goldHoldings);
      return true;
    } catch {
      return false;
    }
  };

  // Metrics computation
  let stockValue = 0;
  let stockCost = 0;
  stocks.forEach((s) => {
    stockValue += s.lots * 100 * s.currentPrice;
    stockCost += s.lots * 100 * s.avgBuy;
  });

  let goldSpotVal = 0;
  let goldSpotCost = 0;
  let goldSpotGrams = 0;
  let goldAntamVal = 0;
  let goldAntamCost = 0;
  let goldAntamGrams = 0;

  goldHoldings.forEach((g) => {
    const curPrice = g.type === 'spot' ? goldPrices.spot : goldPrices.antam;
    const val = g.grams * curPrice;
    const cost = g.grams * g.avgBuy;
    if (g.type === 'spot') {
      goldSpotVal += val;
      goldSpotCost += cost;
      goldSpotGrams += g.grams;
    } else {
      goldAntamVal += val;
      goldAntamCost += cost;
      goldAntamGrams += g.grams;
    }
  });

  const totalAsset = stockValue + goldSpotVal + goldAntamVal;
  const totalAssetCost = stockCost + goldSpotCost + goldAntamCost;
  const totalAssetPL = totalAsset - totalAssetCost;
  const totalAssetPLPct = totalAssetCost > 0 ? (totalAssetPL / totalAssetCost) * 100 : 0;

  const thisMonthTotal = transactions.reduce((sum, t) => sum + t.amount, 0);
  const lastMonthTotal = lastMonthWeekly.reduce((a, b) => a + b, 0);

  const thisMonthWeekly = [0, 0, 0, 0];
  transactions.forEach((t) => {
    const idx = Math.min(3, Math.max(0, t.weekIdx ?? 2));
    thisMonthWeekly[idx] += t.amount;
  });

  const ccItems = transactions.filter((t) => t.method === 'cc');
  let ccDueUnpaid = 0;
  let ccDueTotal = 0;
  let ccUsedLimit = 0;

  ccItems.forEach((t) => {
    const monthly = getTxMonthlyBill(t);
    ccDueTotal += monthly;
    if (!t.paidThisMonth) ccDueUnpaid += monthly;
    ccUsedLimit += getTxCcHold(t);
  });

  const ccAvailableLimit = Math.max(0, ccLimit - ccUsedLimit);
  const ccLimitPct = ccLimit > 0 ? Math.min(100, (ccUsedLimit / ccLimit) * 100) : 0;

  const metrics: FinTrackMetrics = {
    stockValue,
    stockCost,
    stockPL: stockValue - stockCost,
    goldSpotVal,
    goldSpotCost,
    goldSpotGrams,
    goldSpotPL: goldSpotVal - goldSpotCost,
    goldAntamVal,
    goldAntamCost,
    goldAntamGrams,
    goldAntamPL: goldAntamVal - goldAntamCost,
    totalGoldVal: goldSpotVal + goldAntamVal,
    totalGoldPL: goldSpotVal - goldSpotCost + (goldAntamVal - goldAntamCost),
    totalAsset,
    totalAssetCost,
    totalAssetPL,
    totalAssetPLPct,
    thisMonthTotal,
    lastMonthTotal,
    thisMonthWeekly,
    ccItems,
    ccDueUnpaid,
    ccDueTotal,
    ccUsedLimit,
    ccAvailableLimit,
    ccLimitPct,
  };

  return (
    <FinTrackContext.Provider
      value={{
        userName,
        setUserName,
        activeTab,
        setActiveTab,
        chartMode,
        setChartMode,
        compareOct,
        setCompareOct,
        selectedWeekIdx,
        setSelectedWeekIdx,
        selectedMonthIdx,
        setSelectedMonthIdx,
        cashBalance,
        setCashBalance,
        ccLimit,
        setCcLimit,
        ccDueDate,
        setCcDueDate,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        stocks,
        addStock,
        updateStock,
        deleteStock,
        goldPrices,
        goldHoldings,
        addGoldHolding,
        updateGoldHolding,
        deleteGoldHolding,
        monthlyHistory,
        lastMonthWeekly,
        expandedCcId,
        setExpandedCcId,
        highlightedCcId,
        setHighlightedCcId,
        metrics,
        payAllCcDue,
        updateCcItem,
        resetAllData,
        resetToZero,
        exportData,
        importData,
        lastMarketSync,
        isSyncingMarket,
        fetchMarketPrices,
      }}
    >
      {children}
    </FinTrackContext.Provider>
  );
};

export const useFinTrack = (): FinTrackContextType => {
  const context = useContext(FinTrackContext);
  if (!context) {
    throw new Error('useFinTrack must be used within FinTrackProvider');
  }
  return context;
};
