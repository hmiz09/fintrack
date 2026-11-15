import React from 'react';
import { useFinTrack } from '../context/FinTrackContext';
import { formatIDR } from '../utils/formatters';

interface SummaryCardsProps {
  onOpenCashModal: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ onOpenCashModal }) => {
  const { metrics, cashBalance, setActiveTab } = useFinTrack();

  const isPositivePL = metrics.totalAssetPL >= 0;
  const afterCc = cashBalance - metrics.ccDueUnpaid;

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Total Assets Card */}
      <button
        type="button"
        onClick={() => setActiveTab('assets')}
        className="btn-surface text-left rounded-2xl p-3.5 border transition-all"
        style={{
          background: 'var(--pk-card)',
          borderColor: 'var(--pk-border)',
        }}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-medium" style={{ color: 'var(--pk-muted)' }}>
            Total Assets
          </span>
          <span
            className="text-xs font-semibold tabular-nums"
            style={{
              color: isPositivePL ? 'var(--pk-success-text)' : 'var(--pk-error-text)',
            }}
          >
            {isPositivePL ? '+' : ''}
            {metrics.totalAssetPLPct.toFixed(1)}%
          </span>
        </div>
        <p className="text-[15px] font-bold tabular-nums tracking-tight leading-snug mt-1">
          {formatIDR(metrics.totalAsset)}
        </p>
        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--pk-muted)' }}>
          Stocks &amp; Gold
        </p>
      </button>

      {/* Total Cash Card */}
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
        aria-label={`Total Cash ${formatIDR(cashBalance)}, tap to edit`}
        className="btn-tactile btn-surface text-left rounded-2xl p-3.5 border cursor-pointer"
        style={{
          background: 'var(--pk-card)',
          borderColor: 'var(--pk-border)',
        }}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-medium" style={{ color: 'var(--pk-muted)' }}>
            Total Cash
          </span>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-lg"
            style={{
              background: 'var(--pk-soft)',
              color: 'var(--pk-primary-text)',
            }}
          >
            Edit
          </span>
        </div>

        <p className="text-[15px] font-bold tabular-nums tracking-tight leading-snug mt-1">
          {formatIDR(cashBalance)}
        </p>

        <div className="flex items-center justify-between gap-1 mt-0.5 text-xs tabular-nums leading-snug">
          <span style={{ color: 'var(--pk-muted)' }}>
            Due: {formatIDR(metrics.ccDueUnpaid)}
          </span>
          {metrics.ccDueUnpaid > 0 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('cc');
              }}
              className="btn-plain font-semibold shrink-0"
              style={{ color: 'var(--pk-primary-text)' }}
            >
              Pay
            </button>
          ) : (
            <span
              className="font-semibold shrink-0"
              style={{ color: 'var(--pk-success-text)' }}
            >
              Paid
            </span>
          )}
        </div>

        {metrics.ccDueUnpaid > 0 && (
          <p
            className="text-xs mt-0.5 tabular-nums leading-snug"
            style={{
              color: afterCc < 0 ? 'var(--pk-error-text)' : 'var(--pk-muted)',
            }}
          >
            After CC:{' '}
            <strong
              style={{
                color: afterCc < 0 ? 'var(--pk-error-text)' : 'var(--pk-text)',
              }}
            >
              {formatIDR(afterCc)}
            </strong>
          </p>
        )}
      </div>
    </div>
  );
};
