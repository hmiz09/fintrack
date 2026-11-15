import React from 'react';
import { useFinTrack, getTxMonthlyBill } from '../context/FinTrackContext';
import { CATEGORY_ICONS, CategoryIcon } from '../constants/icons';
import { formatIDR, getOrdinalDay } from '../utils/formatters';
import type { Transaction } from '../types';
import { ChevronDown } from 'lucide-react';

interface CreditCardTabProps {
  onOpenLimitModal: () => void;
  onOpenDueDateModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onOpenAddModal: () => void;
}

export const CreditCardTab: React.FC<CreditCardTabProps> = ({
  onOpenLimitModal,
  onOpenDueDateModal,
  onEditTransaction,
  onOpenAddModal,
}) => {
  const {
    metrics,
    ccLimit,
    ccDueDate,
    categories,
    expandedCcId,
    setExpandedCcId,
    highlightedCcId,
    payAllCcDue,
    updateCcItem,
    setActiveTab,
  } = useFinTrack();

  const catMap = new Map(categories.map((c) => [c.name, c.icon]));

  const paidCount = metrics.ccItems.filter((t) => t.paidThisMonth).length;
  const activeCcItems = metrics.ccItems.filter((t) => !(t.ccMode === 'full' && t.paidThisMonth));
  const settledFullCount = metrics.ccItems.length - activeCcItems.length;

  const toggleCcExpand = (id: string) => {
    setExpandedCcId(expandedCcId === id ? null : id);
  };

  const setCcScheme = (id: string, mode: 'full' | 'installment', tenor: number) => {
    updateCcItem(id, { ccMode: mode, tenor });
  };

  const toggleCcPaid = (id: string) => {
    const tx = metrics.ccItems.find((t) => t.id === id);
    if (!tx) return;
    updateCcItem(id, { paidThisMonth: !tx.paidThisMonth });
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="pt-3">
        <p className="text-xs font-medium" style={{ color: 'var(--pk-muted)' }}>
          Credit Card
        </p>
        <h2 className="text-xl font-bold tracking-tight leading-tight">Limit &amp; Bills</h2>
      </div>

      {/* Credit Card Limit Card (Tap Card to Set Limit) */}
      <div
        role="button"
        tabIndex={0}
        onClick={onOpenLimitModal}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenLimitModal();
          }
        }}
        aria-label={`Credit Card Available Limit ${formatIDR(metrics.ccAvailableLimit)}, tap to set limit`}
        className="cc-plum-card btn-tactile text-left rounded-2xl p-4 shadow-md space-y-3.5 cursor-pointer"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium" style={{ color: '#f9d6e5' }}>
              Available Limit
            </p>
            <p className="text-2xl font-bold tabular-nums tracking-tight mt-0.5">
              {formatIDR(metrics.ccAvailableLimit)}
            </p>
          </div>
          <div className="text-right text-xs tabular-nums" style={{ color: '#f9d6e5' }}>
            <span className="block">Total Limit</span>
            <strong className="text-sm font-bold text-white">{formatIDR(ccLimit)}</strong>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, metrics.ccLimitPct).toFixed(1)}%`,
                background: '#ffffff',
              }}
            />
          </div>
          <div className="flex items-center justify-between text-xs tabular-nums" style={{ color: '#f9d6e5' }}>
            <span>
              Used: <strong className="text-white">{formatIDR(metrics.ccUsedLimit)}</strong>
            </span>
            <span>
              Available: <strong className="text-white">{(100 - metrics.ccLimitPct).toFixed(0)}%</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Due This Month Summary (Monthly Statement Payment - Tappable Card) */}
      <div
        role="button"
        tabIndex={0}
        onClick={onOpenDueDateModal}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenDueDateModal();
          }
        }}
        aria-label={`Due Date ${getOrdinalDay(ccDueDate)}, tap to change`}
        className="btn-tactile btn-surface text-left rounded-2xl p-4 border space-y-3 cursor-pointer"
        style={{
          background: 'var(--pk-card)',
          borderColor: 'var(--pk-border)',
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--pk-muted)' }}>
              Due Date ({getOrdinalDay(ccDueDate)})
            </p>
            <p className="text-xl font-bold tabular-nums tracking-tight mt-0.5">
              {formatIDR(metrics.ccDueUnpaid)}
            </p>
          </div>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-lg"
            style={{
              background:
                metrics.ccDueUnpaid === 0
                  ? 'var(--pk-success-soft)'
                  : 'var(--pk-primary-soft)',
              color:
                metrics.ccDueUnpaid === 0
                  ? 'var(--pk-success-text)'
                  : 'var(--pk-primary-text)',
            }}
          >
            {metrics.ccDueUnpaid === 0 ? 'All Paid' : `${paidCount}/${metrics.ccItems.length} Paid`}
          </span>
        </div>

        {metrics.ccDueUnpaid > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              payAllCcDue();
            }}
            className="btn-primary w-full min-h-[44px] py-2.5 px-4 rounded-xl text-xs font-bold border"
          >
            Pay Statement ({formatIDR(metrics.ccDueUnpaid)})
          </button>
        )}
      </div>

      {/* Compact Expandable Payment List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Upcoming Payments</h3>
          {activeCcItems.length > 0 && (
            <span className="text-xs" style={{ color: 'var(--pk-muted)' }}>
              Tap item for tenor
            </span>
          )}
        </div>

        {activeCcItems.length > 0 ? (
          activeCcItems.map((tx) => {
            const isInst = tx.ccMode === 'installment';
            const monthlyAmt = getTxMonthlyBill(tx);
            const isExpanded = expandedCcId === tx.id;
            const isHighlighted = highlightedCcId === tx.id;
            const iconKey = catMap.get(tx.category) || 'tag';
            const palette = CATEGORY_ICONS[iconKey] || CATEGORY_ICONS.tag;
            const schemeLabel =
              isInst && tx.tenor
                ? `${(tx.installmentPaidCount || 0) + 1}/${tx.tenor} mo`
                : 'Full';

            return (
              <div
                key={tx.id}
                id={`cc-item-${tx.id}`}
                className="rounded-2xl border overflow-hidden transition-colors"
                style={{
                  background: 'var(--pk-card)',
                  borderColor:
                    isExpanded || isHighlighted
                      ? 'var(--pk-primary)'
                      : 'var(--pk-border)',
                  boxShadow: isHighlighted ? '0 0 0 2px var(--pk-primary)' : 'none',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleCcExpand(tx.id)}
                  aria-expanded={isExpanded}
                  className="btn-plain w-full text-left px-3.5 py-3 flex items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: palette.bg }}
                    >
                      <CategoryIcon icon={iconKey} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold truncate leading-snug ${
                          tx.paidThisMonth ? 'line-through opacity-60' : ''
                        }`}
                      >
                        {tx.title}
                      </p>
                      <div
                        className="flex items-center flex-wrap gap-1.5 mt-0.5 text-xs tabular-nums"
                        style={{ color: 'var(--pk-muted)' }}
                      >
                        <span
                          className="px-1.5 py-0.5 rounded-md font-semibold"
                          style={{
                            background: tx.paidThisMonth
                              ? 'var(--pk-success-soft)'
                              : 'var(--pk-soft)',
                            color: tx.paidThisMonth
                              ? 'var(--pk-success-text)'
                              : 'var(--pk-primary-text)',
                          }}
                        >
                          {tx.paidThisMonth ? 'Paid' : schemeLabel}
                        </span>
                        <span>{tx.date}</span>
                        {isInst && <span>· {formatIDR(tx.amount)}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right tabular-nums">
                      <p
                        className="text-sm font-bold leading-snug"
                        style={{ color: 'var(--pk-text)' }}
                      >
                        {formatIDR(monthlyAmt)}
                      </p>
                      {isInst && (
                        <p className="text-xs leading-none" style={{ color: 'var(--pk-muted)' }}>
                          /mo
                        </p>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform duration-150 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      style={{ color: 'var(--pk-muted)' }}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div
                    className="px-3.5 pb-3.5 pt-2.5 border-t space-y-2.5"
                    style={{
                      borderColor: 'var(--pk-border)',
                      background: 'var(--pk-bg)',
                    }}
                  >
                    <div className="flex items-center justify-between text-xs tabular-nums">
                      <span style={{ color: 'var(--pk-muted)' }}>
                        Plan · Total {formatIDR(tx.amount)}
                      </span>
                      <span className="font-semibold" style={{ color: 'var(--pk-text)' }}>
                        {isInst && tx.tenor
                          ? `Installment ${(tx.installmentPaidCount || 0) + 1}/${tx.tenor}`
                          : 'Full payment (1x)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCcScheme(tx.id, 'full', 1)}
                        className={`${
                          !isInst ? 'btn-primary' : 'btn-surface'
                        } min-h-[44px] py-1.5 rounded-xl text-xs font-semibold border`}
                        style={{
                          background: !isInst ? undefined : 'var(--pk-soft)',
                          color: !isInst ? '#ffffff' : 'var(--pk-muted)',
                          borderColor: !isInst ? undefined : 'var(--pk-border)',
                        }}
                      >
                        Full
                      </button>
                      {[3, 6, 12].map((tenor) => {
                        const active = isInst && tx.tenor === tenor;
                        return (
                          <button
                            key={tenor}
                            type="button"
                            onClick={() => setCcScheme(tx.id, 'installment', tenor)}
                            className={`${
                              active ? 'btn-primary' : 'btn-surface'
                            } min-h-[44px] py-1.5 rounded-xl text-xs font-semibold border`}
                            style={{
                              background: active ? undefined : 'var(--pk-soft)',
                              color: active ? '#ffffff' : 'var(--pk-muted)',
                              borderColor: active ? undefined : 'var(--pk-border)',
                            }}
                          >
                            {tenor} mo
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => onEditTransaction(tx)}
                        className="btn-plain text-xs font-semibold min-h-[44px] px-2.5 rounded-xl"
                        style={{ color: 'var(--pk-muted)' }}
                      >
                        Edit Tx
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleCcPaid(tx.id)}
                        className={`${
                          tx.paidThisMonth ? 'btn-surface' : 'btn-primary'
                        } min-h-[44px] px-4 rounded-xl text-xs font-semibold border`}
                        style={{
                          background: tx.paidThisMonth
                            ? 'var(--pk-success-soft)'
                            : undefined,
                          color: tx.paidThisMonth
                            ? 'var(--pk-success-text)'
                            : '#ffffff',
                          borderColor: tx.paidThisMonth ? '#a7dfca' : undefined,
                        }}
                      >
                        {tx.paidThisMonth
                          ? 'Mark Unpaid'
                          : `Pay (${formatIDR(monthlyAmt)})`}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : settledFullCount > 0 ? (
          <div
            className="text-center py-6 px-4 rounded-2xl border space-y-2"
            style={{
              background: 'var(--pk-card)',
              borderColor: 'var(--pk-border)',
            }}
          >
            <p className="text-xs font-medium" style={{ color: 'var(--pk-muted)' }}>
              All full bills settled ({settledFullCount} in Activity).
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('transactions')}
              className="btn-surface min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold border"
              style={{
                background: 'var(--pk-primary-soft)',
                color: 'var(--pk-primary-text)',
                borderColor: '#e6acc5',
              }}
            >
              View Activity
            </button>
          </div>
        ) : (
          <div
            className="text-center py-8 px-4 rounded-2xl border space-y-2.5"
            style={{
              background: 'var(--pk-card)',
              borderColor: 'var(--pk-border)',
            }}
          >
            <p className="text-xs" style={{ color: 'var(--pk-muted)' }}>
              No CC bills yet.
            </p>
            <button
              type="button"
              onClick={onOpenAddModal}
              className="btn-primary min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold"
            >
              Add CC Bill
            </button>
          </div>
        )}

        {activeCcItems.length > 0 && settledFullCount > 0 && (
          <p className="text-xs text-center pt-1" style={{ color: 'var(--pk-muted)' }}>
            {settledFullCount} paid full bill{settledFullCount > 1 ? 's' : ''} moved to Activity
          </p>
        )}
      </div>
    </div>
  );
};
