import React from 'react';
import { useFinTrack } from '../context/FinTrackContext';
import { formatIDR } from '../utils/formatters';
import { TrendingUp, Wallet } from 'lucide-react';

interface SummaryCardsProps {
  onOpenCashModal: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ onOpenCashModal }) => {
  const { metrics, cashBalance, setActiveTab } = useFinTrack();

  const isPositivePL = metrics.totalAssetPL >= 0;
  const cashAfterCc = cashBalance - metrics.ccDueUnpaid;

  return (
    <div className="grid grid-cols-1 gap-3 px-5 mb-5">
      {/* Total Assets Card */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setActiveTab('assets')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setActiveTab('assets');
          }
        }}
        className="w-full text-left bg-gradient-to-br from-rose-500 via-rose-600 to-pink-700 text-white p-5 rounded-3xl shadow-sm relative overflow-hidden transition-all duration-150 active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-rose-600 cursor-pointer"
      >
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-white/15 text-white">
              <TrendingUp className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold tracking-wider text-rose-100 uppercase">
              Total Assets
            </span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-xs">
            <span>{isPositivePL ? '+' : ''}{metrics.totalAssetPLPct.toFixed(1)}%</span>
          </div>
        </div>

        <div className="text-2xl font-black tracking-tight mb-3">
          {formatIDR(metrics.totalAsset)}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/15 text-xs text-rose-100">
          <div>
            <span className="opacity-75">Stocks: </span>
            <span className="font-semibold text-white">{formatIDR(metrics.stockValue)}</span>
          </div>
          <div>
            <span className="opacity-75">Gold: </span>
            <span className="font-semibold text-white">{formatIDR(metrics.totalGoldVal)}</span>
          </div>
        </div>
      </div>

      {/* Total Cash Card (Clickable to Edit Cash) */}
      <div
        role="button"
        tabIndex={0}
        onClick={onOpenCashModal}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenCashModal();
          }
        }}
        className="w-full text-left bg-white p-5 rounded-3xl border border-rose-200/80 shadow-xs relative overflow-hidden transition-all duration-150 active:scale-[0.985] hover:border-rose-300 focus-visible:outline-2 focus-visible:outline-rose-500 cursor-pointer"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <Wallet className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Total Cash
            </span>
          </div>

          {metrics.ccDueUnpaid > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
              <span>After CC:</span>
              <span className="font-bold">{formatIDR(cashAfterCc)}</span>
            </div>
          )}
        </div>

        <div className="text-2xl font-black text-slate-800 tracking-tight">
          {formatIDR(cashBalance)}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
          <span className="text-slate-400">Available bank & cash balance</span>
          <span className="text-rose-600 font-medium hover:underline">Tap to adjust</span>
        </div>
      </div>
    </div>
  );
};
