import React, { useState } from 'react';
import { useFinTrack } from '../context/FinTrackContext';
import { CATEGORY_ICONS, CategoryIcon } from '../constants/icons';
import { formatIDR } from '../utils/formatters';
import type { Transaction } from '../types';
import { Search } from 'lucide-react';

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
  const { transactions, categories, setActiveTab, metrics } = useFinTrack();
  const [search, setSearch] = useState('');
  const [filterMethod, setFilterMethod] = useState<'all' | 'cash' | 'cc'>('all');

  const catMap = new Map(categories.map((c) => [c.name, c.icon]));

  const filtered = transactions.filter((t) => {
    if (filterMethod !== 'all' && t.method !== filterMethod) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    }
    return true;
  });

  const last3 = transactions.slice(0, 3);

  const renderTxRow = (tx: Transaction, compact = false) => {
    const isCC = tx.method === 'cc';
    const ccLabel =
      tx.ccMode === 'installment' && tx.tenor
        ? `CC (${(tx.installmentPaidCount || 0) + 1}/${tx.tenor}x)`
        : 'CC (Full)';
    const iconKey = catMap.get(tx.category) || 'tag';
    const palette = CATEGORY_ICONS[iconKey] || CATEGORY_ICONS.tag;

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
        aria-label={`Edit transaction ${tx.title}`}
        className={`tx-row ${
          compact
            ? 'py-2.5 first:pt-0 last:pb-0 -mx-1 px-1 rounded-xl'
            : 'p-3.5 rounded-2xl border'
        } flex items-center justify-between gap-3 cursor-pointer`}
        style={{
          background: compact ? 'transparent' : 'var(--pk-card)',
          borderColor: 'var(--pk-border)',
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: palette.bg }}
          >
            <CategoryIcon icon={iconKey} className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate leading-snug">{tx.title}</p>
            <div className="flex items-center flex-wrap gap-1.5 mt-0.5">
              <span className="text-xs" style={{ color: 'var(--pk-muted)' }}>
                {tx.date}
              </span>
              {isCC ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab('cc', tx.id);
                  }}
                  className="text-xs font-semibold px-2 py-0.5 rounded-md transition-opacity hover:opacity-80"
                  style={{
                    background: 'var(--pk-primary-soft)',
                    color: 'var(--pk-primary-text)',
                  }}
                >
                  {ccLabel}
                </button>
              ) : (
                <span
                  className="text-xs px-2 py-0.5 rounded-md font-medium"
                  style={{
                    background: 'var(--pk-soft)',
                    color: 'var(--pk-muted)',
                  }}
                >
                  {tx.category}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span
            className="block text-sm font-bold tabular-nums"
            style={{ color: 'var(--pk-text)' }}
          >
            {formatIDR(tx.amount)}
          </span>
          {isCC && tx.ccMode === 'installment' && tx.tenor && (
            <span
              className="block text-xs tabular-nums"
              style={{ color: 'var(--pk-muted)' }}
            >
              {formatIDR(Math.round(tx.amount / tx.tenor))}/mo
            </span>
          )}
        </div>
      </div>
    );
  };

  if (isDashboardPreview) {
    return (
      <section
        aria-label="Recent transactions"
        className="rounded-2xl p-4 border space-y-3"
        style={{
          background: 'var(--pk-card)',
          borderColor: 'var(--pk-border)',
        }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Recent Transactions</h3>
          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-semibold min-h-[44px] px-3 rounded-xl flex items-center"
            style={{ color: 'var(--pk-primary-text)' }}
          >
            See All
          </button>
        </div>

        {last3.length > 0 ? (
          <div className="divide-y" style={{ borderColor: 'var(--pk-border)' }}>
            {last3.map((tx) => renderTxRow(tx, true))}
          </div>
        ) : (
          <div className="py-6 text-center space-y-2">
            <p className="text-xs" style={{ color: 'var(--pk-muted)' }}>
              No transactions yet.
            </p>
            <button
              type="button"
              onClick={onOpenAddModal}
              className="btn-primary min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold"
            >
              Add Transaction
            </button>
          </div>
        )}
      </section>
    );
  }

  // Full Transactions History Page
  return (
    <div className="space-y-4">
      <div className="pt-3">
        <p className="text-xs font-medium" style={{ color: 'var(--pk-muted)' }}>
          History
        </p>
        <h2 className="text-xl font-bold tracking-tight leading-tight">Transactions</h2>
      </div>

      <div className="space-y-2.5">
        <div>
          <label htmlFor="tx-search-input" className="sr-only">
            Search transactions
          </label>
          <div
            className="flex items-center gap-2 px-3.5 min-h-[44px] rounded-xl border"
            style={{
              background: 'var(--pk-card)',
              borderColor: 'var(--pk-border-strong)',
            }}
          >
            <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--pk-muted)' }} />
            <input
              id="tx-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search merchant or category..."
              className="w-full bg-transparent text-xs py-2 rounded-lg focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {[
            { id: 'all', label: `All (${transactions.length})` },
            { id: 'cash', label: 'Cash / Debit' },
            { id: 'cc', label: `Credit Card (${metrics.ccItems.length})` },
          ].map((f) => {
            const active = filterMethod === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterMethod(f.id as any)}
                className={`${
                  active ? 'btn-primary' : 'btn-surface'
                } min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 border`}
                style={{
                  background: active ? undefined : 'var(--pk-card)',
                  color: active ? '#ffffff' : 'var(--pk-muted)',
                  borderColor: active ? undefined : 'var(--pk-border-strong)',
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2.5">
        {filtered.length > 0 ? (
          filtered.map((tx) => renderTxRow(tx, false))
        ) : (
          <div
            className="text-center py-8 px-4 rounded-2xl border space-y-2.5"
            style={{
              background: 'var(--pk-card)',
              borderColor: 'var(--pk-border)',
            }}
          >
            <p className="text-xs font-medium" style={{ color: 'var(--pk-muted)' }}>
              No matching transactions.
            </p>
            <button
              type="button"
              onClick={() => {
                setFilterMethod('all');
                setSearch('');
              }}
              className="btn-surface min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold border"
              style={{
                background: 'var(--pk-primary-soft)',
                color: 'var(--pk-primary-text)',
                borderColor: '#e6acc5',
              }}
            >
              Show All
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
