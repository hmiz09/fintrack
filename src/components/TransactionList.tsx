import React, { useState } from 'react';
import { useFinTrack } from '../context/FinTrackContext';
import { CategoryIcon } from '../constants/icons';
import { formatIDR } from '../utils/formatters';
import type { Transaction } from '../types';
import { Search, CreditCard, Plus, ChevronRight } from 'lucide-react';

interface TransactionListProps {
  onEditTransaction: (tx: Transaction) => void;
  onOpenAddModal: () => void;
  isDashboardPreview?: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  onEditTransaction,
  onOpenAddModal,
  isDashboardPreview = false,
}) => {
  const { transactions, categories, setActiveTab } = useFinTrack();
  const [search, setSearch] = useState('');
  const [filterMethod, setFilterMethod] = useState<'all' | 'cash' | 'cc'>('all');

  // Category map for quick icon lookup
  const catMap = new Map(categories.map((c) => [c.name, c.icon]));

  const filtered = transactions.filter((t) => {
    if (filterMethod !== 'all' && t.method !== filterMethod) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    }
    return true;
  });

  const displayList = isDashboardPreview ? filtered.slice(0, 3) : filtered;

  return (
    <div className="px-5 mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            {isDashboardPreview ? 'Recent Activity' : 'All Transactions'}
          </h2>
          <p className="text-xs text-slate-400">
            {isDashboardPreview
              ? 'Last 3 transactions'
              : `${filtered.length} transactions recorded`}
          </p>
        </div>

        {isDashboardPreview ? (
          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-0.5 py-1 px-2 rounded-lg hover:bg-rose-50 transition-colors min-h-[44px]"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-95 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New</span>
          </button>
        )}
      </div>

      {/* Filters (Only on Activity tab) */}
      {!isDashboardPreview && (
        <div className="mb-4 space-y-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expenses, coffee, nail art..."
              className="w-full pl-9 pr-3 py-2 bg-white rounded-2xl border border-rose-200/80 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[44px]"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5">
            {(['all', 'cash', 'cc'] as const).map((method) => {
              const active = filterMethod === method;
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => setFilterMethod(method)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors min-h-[40px] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-rose-500 ${
                    active
                      ? 'bg-rose-500 text-white'
                      : 'bg-white text-slate-600 border border-rose-200/60 hover:bg-rose-50/50'
                  }`}
                >
                  {method === 'all' ? 'All Methods' : method === 'cash' ? 'Cash' : 'Credit Card'}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="space-y-2">
        {displayList.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-rose-200/60">
            <p className="text-xs text-slate-500 font-medium">No transactions found</p>
          </div>
        ) : (
          displayList.map((tx) => {
            const iconName = catMap.get(tx.category) || 'tag';
            const isCC = tx.method === 'cc';

            return (
              <div
                key={tx.id}
                role="button"
                tabIndex={0}
                onClick={() => onEditTransaction(tx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onEditTransaction(tx);
                  }
                }}
                className="w-full flex items-center justify-between p-3.5 bg-white rounded-2xl border border-rose-100 hover:border-rose-300 shadow-2xs transition-all active:scale-[0.985] text-left cursor-pointer min-h-[58px]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-rose-50/80 border border-rose-100 flex items-center justify-center shrink-0">
                    <CategoryIcon icon={iconName} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                      {tx.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400">
                      <span>{tx.date}</span>
                      <span>•</span>
                      <span className="truncate">{tx.category}</span>
                      {isCC && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-0.5 text-rose-600 font-semibold">
                            <CreditCard className="w-3 h-3" />
                            {tx.ccMode === 'installment' && tx.tenor
                              ? `${tx.tenor} mo`
                              : 'Full'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2">
                  <div className="text-xs font-black text-slate-800">
                    {formatIDR(tx.amount)}
                  </div>
                  {isCC && tx.ccMode === 'installment' && tx.tenor ? (
                    <div className="text-[10px] text-slate-400 font-medium">
                      {formatIDR(Math.round(tx.amount / tx.tenor))}/mo
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
