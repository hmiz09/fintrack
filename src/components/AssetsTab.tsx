import React, { useState } from 'react';
import { useFinTrack } from '../context/FinTrackContext';
import { formatIDR } from '../utils/formatters';

interface AssetsTabProps {
  onOpenAddAsset: () => void;
}

export const AssetsTab: React.FC<AssetsTabProps> = ({ onOpenAddAsset }) => {
  const { metrics, stocks, goldHoldings, goldPrices } = useFinTrack();
  const [assetSubTab, setAssetSubTab] = useState<'all' | 'stocks' | 'gold'>('all');

  const showStocks = assetSubTab === 'all' || assetSubTab === 'stocks';
  const showGold = assetSubTab === 'all' || assetSubTab === 'gold';

  const spotList = goldHoldings.filter((g) => g.type === 'spot');
  const antamList = goldHoldings.filter((g) => g.type === 'antam');

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="pt-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--pk-muted)' }}>
            Portfolio
          </p>
          <h2 className="text-xl font-bold tracking-tight leading-tight">Stocks &amp; Gold</h2>
        </div>
        <button
          type="button"
          onClick={onOpenAddAsset}
          className="btn-primary min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold border"
        >
          + Asset
        </button>
      </div>

      {/* Total Asset & P/L Card */}
      <div
        className="rounded-2xl p-4 border space-y-2.5"
        style={{
          background: 'var(--pk-card)',
          borderColor: 'var(--pk-border)',
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--pk-muted)' }}>
              Total Asset Value
            </p>
            <p className="text-2xl font-bold tabular-nums tracking-tight mt-0.5">
              {formatIDR(metrics.totalAsset)}
            </p>
          </div>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-lg tabular-nums"
            style={{
              background:
                metrics.totalAssetPL >= 0
                  ? 'var(--pk-success-soft)'
                  : 'var(--pk-error-soft)',
              color:
                metrics.totalAssetPL >= 0
                  ? 'var(--pk-success-text)'
                  : 'var(--pk-error-text)',
            }}
          >
            {metrics.totalAssetPL >= 0 ? '+' : ''}
            {metrics.totalAssetPLPct.toFixed(1)}%
          </span>
        </div>

        <div
          className="flex items-center justify-between flex-wrap gap-x-3 gap-y-1 text-xs pt-2 border-t"
          style={{ borderColor: 'var(--pk-border)' }}
        >
          <span style={{ color: 'var(--pk-muted)' }}>
            Cost:{' '}
            <strong className="tabular-nums" style={{ color: 'var(--pk-text)' }}>
              {formatIDR(metrics.totalAssetCost)}
            </strong>
          </span>
          <span
            className="font-semibold tabular-nums"
            style={{
              color:
                metrics.totalAssetPL >= 0
                  ? 'var(--pk-success-text)'
                  : 'var(--pk-error-text)',
            }}
          >
            P/L: {metrics.totalAssetPL >= 0 ? '+' : ''}
            {formatIDR(metrics.totalAssetPL)}
          </span>
        </div>
      </div>

      {/* Sub-Tab Toggle */}
      <div
        className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl border"
        style={{
          background: 'var(--pk-card)',
          borderColor: 'var(--pk-border)',
        }}
      >
        {[
          { id: 'all', label: 'All' },
          { id: 'stocks', label: 'Stocks' },
          { id: 'gold', label: 'Gold' },
        ].map((t) => {
          const active = assetSubTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setAssetSubTab(t.id as any)}
              className={`${active ? 'btn-primary' : ''} min-h-[44px] py-1.5 rounded-xl text-xs font-semibold`}
              style={{
                color: active ? '#ffffff' : 'var(--pk-muted)',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* STOCKS SECTION */}
      {showStocks && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Stocks (IDX)</h3>
            <button
              type="button"
              onClick={onOpenAddAsset}
              className="min-h-[44px] px-2 text-xs font-semibold"
              style={{ color: 'var(--pk-primary-text)' }}
            >
              + Add Stock
            </button>
          </div>

          <div className="space-y-2">
            {stocks.length > 0 ? (
              stocks.map((s) => {
                const shares = s.lots * 100;
                const val = shares * s.currentPrice;
                const cost = shares * s.avgBuy;
                const pl = val - cost;
                const plPct = cost > 0 ? (pl / cost) * 100 : 0;
                const isUp = pl >= 0;

                return (
                  <div
                    key={s.id}
                    className="rounded-2xl p-3.5 border space-y-1.5"
                    style={{
                      background: 'var(--pk-card)',
                      borderColor: 'var(--pk-border)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-bold">{s.code}</span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-md tabular-nums font-medium shrink-0"
                          style={{
                            background: 'var(--pk-soft)',
                            color: 'var(--pk-muted)',
                          }}
                        >
                          {s.lots} lot
                        </span>
                      </div>
                      <span className="text-sm font-bold tabular-nums shrink-0">
                        {formatIDR(val)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-x-2 gap-y-0.5 text-xs tabular-nums">
                      <span style={{ color: 'var(--pk-muted)' }}>
                        Avg {formatIDR(s.avgBuy)} · Now {formatIDR(s.currentPrice)}
                      </span>
                      <span
                        className="font-semibold shrink-0"
                        style={{
                          color: isUp ? 'var(--pk-success-text)' : 'var(--pk-error-text)',
                        }}
                      >
                        {isUp ? '+' : ''}
                        {formatIDR(pl)} ({isUp ? '+' : ''}
                        {plPct.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                className="rounded-2xl p-4 border text-center text-xs"
                style={{
                  background: 'var(--pk-card)',
                  borderColor: 'var(--pk-border)',
                  color: 'var(--pk-muted)',
                }}
              >
                No stocks yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* GOLD SECTION */}
      {showGold && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Gold (Spot &amp; Antam)</h3>
            <button
              type="button"
              onClick={onOpenAddAsset}
              className="min-h-[44px] px-2 text-xs font-semibold"
              style={{ color: 'var(--pk-primary-text)' }}
            >
              + Add Gold
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div
              className="rounded-2xl p-3 border"
              style={{
                background: 'var(--pk-card)',
                borderColor: 'var(--pk-border)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: 'var(--pk-muted)' }}>
                  Spot Price
                </span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                  style={{
                    background: 'var(--pk-primary-soft)',
                    color: 'var(--pk-primary-text)',
                  }}
                >
                  /g
                </span>
              </div>
              <p className="text-sm font-bold tabular-nums mt-1">
                {formatIDR(goldPrices.spot)}
              </p>
              <div className="flex items-center justify-between flex-wrap gap-1 text-xs mt-1 font-semibold tabular-nums">
                <span style={{ color: 'var(--pk-muted)' }}>{metrics.goldSpotGrams} g</span>
                <span
                  style={{
                    color:
                      metrics.goldSpotPL >= 0
                        ? 'var(--pk-success-text)'
                        : 'var(--pk-error-text)',
                  }}
                >
                  {metrics.goldSpotPL >= 0 ? '+' : ''}
                  {formatIDR(metrics.goldSpotPL)}
                </span>
              </div>
            </div>

            <div
              className="rounded-2xl p-3 border"
              style={{
                background: 'var(--pk-card)',
                borderColor: 'var(--pk-border)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: 'var(--pk-muted)' }}>
                  Antam Sell
                </span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                  style={{
                    background: 'var(--pk-amber-soft)',
                    color: 'var(--pk-amber-text)',
                  }}
                >
                  /g
                </span>
              </div>
              <p className="text-sm font-bold tabular-nums mt-1">
                {formatIDR(goldPrices.antam)}
              </p>
              <div className="flex items-center justify-between flex-wrap gap-1 text-xs mt-1 font-semibold tabular-nums">
                <span style={{ color: 'var(--pk-muted)' }}>{metrics.goldAntamGrams} g</span>
                <span
                  style={{
                    color:
                      metrics.goldAntamPL >= 0
                        ? 'var(--pk-success-text)'
                        : 'var(--pk-error-text)',
                  }}
                >
                  {metrics.goldAntamPL >= 0 ? '+' : ''}
                  {formatIDR(metrics.goldAntamPL)}
                </span>
              </div>
            </div>
          </div>

          {/* Spot Gold List */}
          <div
            className="rounded-2xl p-3.5 border space-y-2.5"
            style={{
              background: 'var(--pk-card)',
              borderColor: 'var(--pk-border)',
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--pk-primary-text)' }}
              >
                Spot Gold
              </span>
              <span className="text-xs font-bold tabular-nums">
                {formatIDR(metrics.goldSpotVal)}
              </span>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--pk-border)' }}>
              {spotList.map((g) => {
                const val = g.grams * goldPrices.spot;
                const cost = g.grams * g.avgBuy;
                const pl = val - cost;
                return (
                  <div key={g.id} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold">{g.label}</p>
                      <p style={{ color: 'var(--pk-muted)' }}>{g.grams} grams</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatIDR(val)}</p>
                      <p
                        style={{
                          color: pl >= 0 ? 'var(--pk-success-text)' : 'var(--pk-error-text)',
                        }}
                      >
                        {pl >= 0 ? '+' : ''}
                        {formatIDR(pl)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Antam Gold List */}
          <div
            className="rounded-2xl p-3.5 border space-y-2.5"
            style={{
              background: 'var(--pk-card)',
              borderColor: 'var(--pk-border)',
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--pk-amber-text)' }}
              >
                Antam Gold (Sell)
              </span>
              <span className="text-xs font-bold tabular-nums">
                {formatIDR(metrics.goldAntamVal)}
              </span>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--pk-border)' }}>
              {antamList.map((g) => {
                const val = g.grams * goldPrices.antam;
                const cost = g.grams * g.avgBuy;
                const pl = val - cost;
                return (
                  <div key={g.id} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold">{g.label}</p>
                      <p style={{ color: 'var(--pk-muted)' }}>{g.grams} grams</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatIDR(val)}</p>
                      <p
                        style={{
                          color: pl >= 0 ? 'var(--pk-success-text)' : 'var(--pk-error-text)',
                        }}
                      >
                        {pl >= 0 ? '+' : ''}
                        {formatIDR(pl)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
