import React from 'react';
import { useFinTrack, getTxMonthlyBill } from '../context/FinTrackContext';
import { CategoryIcon } from '../constants/icons';
import { formatIDR, getOrdinalDay } from '../utils/formatters';
import type { Transaction } from '../types';
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface CreditCardTabProps {
  onOpenLimitModal: () => void;
  onOpenDueDateModal: () => void;
}

export const CreditCardTab: React.FC<CreditCardTabProps> = ({
  onOpenLimitModal,
  onOpenDueDateModal,
}) => {
  const {
    metrics,
    ccLimit,
    ccDueDate,
    categories,
    expandedCcId,
    setExpandedCcId,
    payAllCcDue,
    updateCcItem,
  } = useFinTrack();

  const catMap = new Map(categories.map((c) => [c.name, c.icon]));

  const toggleExpand = (id: string) => {
    setExpandedCcId(expandedCcId === id ? null : id);
  };

  const handleTenorChange = (tx: Transaction, tenor: number) => {
    if (tenor === 1) {
      updateCcItem(tx.id, { ccMode: 'full', tenor: 1 });
    } else {
      updateCcItem(tx.id, { ccMode: 'installment', tenor });
    }
  };

  const togglePaidStatus = (tx: Transaction) => {
    updateCcItem(tx.id, { paidThisMonth: !tx.paidThisMonth });
  };

  return (
    <div className="px-5 mb-8">
      {/* Plum Credit Card Hero */}
      <div className="bg-[#3b142b] border border-[#6b244e] text-white p-5 rounded-3xl shadow-md mb-4 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-pink-300" />
            </div>
            <div>
              <p className="text-xs font-semibold text-pink-200">Platinum Card</p>
              <p className="text-[11px] text-pink-300/70">•••• 8829</p>
            </div>
          </div>
          <span className="text-[11px] font-bold tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-pink-200">
            VISA
          </span>
        </div>

        {/* Dual Interactive Cards: Available Limit & Due Date */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Entire Card Clickable to Set Limit */}
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
            className="bg-white/10 hover:bg-white/15 active:scale-95 p-3 rounded-2xl border border-white/15 transition-all text-left cursor-pointer min-h-[70px] flex flex-col justify-center focus-visible:outline-2 focus-visible:outline-pink-400"
          >
            <span className="text-[11px] text-pink-200/80 font-medium">Available Limit</span>
            <div className="text-sm font-bold text-white mt-0.5 truncate">
              {formatIDR(metrics.ccAvailableLimit)}
            </div>
          </div>

          {/* Entire Card Clickable to Change Due Date */}
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
            className="bg-white/10 hover:bg-white/15 active:scale-95 p-3 rounded-2xl border border-white/15 transition-all text-left cursor-pointer min-h-[70px] flex flex-col justify-center focus-visible:outline-2 focus-visible:outline-pink-400"
          >
            <span className="text-[11px] text-pink-200/80 font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3 text-pink-300" />
              Due Date
            </span>
            <div className="text-sm font-bold text-white mt-0.5">
              {getOrdinalDay(ccDueDate)}
            </div>
          </div>
        </div>

        {/* Limit Usage Bar */}
        <div>
          <div className="flex justify-between text-[11px] text-pink-200/80 mb-1.5 font-medium">
            <span>Used: {formatIDR(metrics.ccUsedLimit)}</span>
            <span>Limit: {formatIDR(ccLimit)}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-black/30 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-400 to-rose-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, metrics.ccLimitPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pay Statement Banner (When bills are due) */}
      {metrics.ccDueUnpaid > 0 ? (
        <div className="mb-5 p-4 rounded-3xl bg-rose-50 border border-rose-200/80 flex items-center justify-between gap-3 shadow-2xs">
          <div className="min-w-0">
            <p className="text-xs text-rose-900 font-bold">Unpaid Statement</p>
            <p className="text-xs text-rose-700/80 mt-0.5">
              Total bill: <strong className="text-rose-900">{formatIDR(metrics.ccDueUnpaid)}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={payAllCcDue}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-2xl shadow-xs transition-all shrink-0 min-h-[44px] flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pay Statement</span>
          </button>
        </div>
      ) : (
        <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/70 flex items-center gap-2.5 text-xs text-emerald-800 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>All credit card bills for this month are fully settled!</span>
        </div>
      )}

      {/* Active CC Expenses List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-slate-800">Card Charges & Installments</h2>
          <span className="text-xs text-slate-400 font-medium">
            {metrics.ccItems.length} active
          </span>
        </div>

        <div className="space-y-2.5">
          {metrics.ccItems.length === 0 ? (
            <div className="p-6 bg-white rounded-2xl border border-rose-100 text-center">
              <p className="text-xs text-slate-500 font-medium">
                Belum ada transaksi kartu kredit aktif
              </p>
            </div>
          ) : (
            metrics.ccItems.map((tx) => {
            const isExpanded = expandedCcId === tx.id;
            const iconName = catMap.get(tx.category) || 'tag';
            const monthly = getTxMonthlyBill(tx);
            const isInstallment = tx.ccMode === 'installment' && tx.tenor && tx.tenor > 1;
            const paidCount = tx.installmentPaidCount || 0;
            const totalTenor = tx.tenor || 1;
            const isSettled = tx.paidThisMonth;

            return (
              <div
                key={tx.id}
                className="bg-white rounded-2xl border border-rose-100 overflow-hidden shadow-2xs transition-all"
              >
                {/* Header Row (Click to Expand) */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleExpand(tx.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleExpand(tx.id);
                    }
                  }}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-rose-50/40 transition-colors min-h-[58px]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                      <CategoryIcon icon={iconName} className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                        {tx.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400">
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span className="font-semibold text-rose-600">
                          {isInstallment ? `${tx.tenor} mo plan` : 'Full Payment'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-2 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-black text-slate-800">
                        {formatIDR(monthly)}
                        {isInstallment && <span className="text-[10px] text-slate-400 font-normal">/mo</span>}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Total {formatIDR(tx.amount)}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-rose-50 bg-rose-50/20 text-xs">
                    {/* Tenor Selector */}
                    <div className="mb-3">
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                        Plan Tenor:
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[1, 3, 6, 12].map((m) => {
                          const active =
                            m === 1
                              ? tx.ccMode === 'full' || tx.tenor === 1
                              : tx.ccMode === 'installment' && tx.tenor === m;
                          return (
                            <button
                              key={m}
                              type="button"
                              onClick={() => handleTenorChange(tx, m)}
                              className={`py-1.5 rounded-xl font-bold transition-all min-h-[38px] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-rose-500 ${
                                active
                                  ? 'bg-rose-500 text-white shadow-2xs'
                                  : 'bg-white border border-rose-200/60 text-slate-600 hover:bg-rose-50'
                              }`}
                            >
                              {m === 1 ? 'Full' : `${m} mo`}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Installment Progress */}
                    {isInstallment && (
                      <div className="mb-3">
                        <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                          <span>
                            Progress: {paidCount} of {totalTenor} months paid
                          </span>
                          <span>{Math.round((paidCount / totalTenor) * 100)}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-rose-500 rounded-full"
                            style={{ width: `${(paidCount / totalTenor) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Paid This Month Toggle */}
                    <div className="flex items-center justify-between pt-2 border-t border-rose-100/60">
                      <span className="text-[11px] text-slate-500">
                        Status this month:
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePaidStatus(tx)}
                        className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-colors min-h-[38px] ${
                          isSettled
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        {isSettled ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Paid</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Pending</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          }))}
        </div>
      </div>
    </div>
  );
};
