import React, { useState } from 'react';
import { useFinTrack } from '../context/FinTrackContext';
import { formatIDR } from '../utils/formatters';
import {
  TrendingUp,
  Coins,
  Plus,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface AssetsTabProps {
  onOpenAddAsset: () => void;
}

export const AssetsTab: React.FC<AssetsTabProps> = ({ onOpenAddAsset }) => {
  const { metrics, stocks, goldHoldings, goldPrices, deleteStock, deleteGoldHolding } =
    useFinTrack();
  const [subTab, setSubTab] = useState<'all' | 'stocks' | 'gold'>('all');

  return (
    <div className="px-5 mb-8">
      {/* Portfolio Overview Banner */}
      <div className="bg-gradient-to-br from-rose-500 via-rose-600 to-pink-700 text-white p-5 rounded-3xl shadow-sm mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-rose-100 uppercase tracking-wider">
            Total Net Assets
          </span>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/20 text-white">
            <span>
              {metrics.totalAssetPL >= 0 ? '+' : ''}
              {metrics.totalAssetPLPct.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="text-2xl font-black tracking-tight mb-3">
          {formatIDR(metrics.totalAsset)}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/20 text-xs text-rose-100">
          <div>
            <span className="opacity-75">Invested Cost: </span>
            <span className="font-semibold text-white">{formatIDR(metrics.totalAssetCost)}</span>
          </div>
          <div>
            <span className="opacity-75">Gain / Loss: </span>
            <span className="font-semibold text-white">
              {metrics.totalAssetPL >= 0 ? '+' : ''}
              {formatIDR(metrics.totalAssetPL)}
            </span>
          </div>
        </div>
      </div>

      {/* Subtab Switcher & Add Asset Action */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-rose-200/60 shadow-2xs">
          {(['all', 'stocks', 'gold'] as const).map((tab) => {
            const active = subTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setSubTab(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all min-h-[38px] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-rose-500 ${
                  active
                    ? 'bg-rose-500 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-rose-50/50'
                }`}
              >
                {tab === 'all' ? 'All Assets' : tab}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onOpenAddAsset}
          className="flex items-center gap-1.5 px-3 py-2 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-xs font-semibold rounded-2xl shadow-xs transition-all min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Asset</span>
        </button>
      </div>

      {/* Stocks Section */}
      {(subTab === 'all' || subTab === 'stocks') && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-rose-50 text-rose-600">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Indonesian Stocks (IDX)
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-800">
              {formatIDR(metrics.stockValue)}
            </span>
          </div>

          <div className="space-y-2">
            {stocks.length === 0 ? (
              <div className="p-5 bg-white rounded-2xl border border-rose-100 text-center">
                <p className="text-xs text-slate-500 font-medium">Belum ada portofolio saham</p>
              </div>
            ) : (
              stocks.map((stock) => {
              const totalVal = stock.lots * 100 * stock.currentPrice;
              const cost = stock.lots * 100 * stock.avgBuy;
              const pl = totalVal - cost;
              const plPct = cost > 0 ? (pl / cost) * 100 : 0;
              const isGain = pl >= 0;

              return (
                <div
                  key={stock.id}
                  className="p-3.5 bg-white rounded-2xl border border-rose-100 flex items-center justify-between shadow-2xs min-h-[58px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 font-black text-rose-700 text-xs flex items-center justify-center border border-rose-100">
                      {stock.code.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{stock.code}</span>
                        <span className="text-[11px] text-slate-400">
                          {stock.lots} lots ({stock.lots * 100} shares)
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Avg: {formatIDR(stock.avgBuy)} • Market: {formatIDR(stock.currentPrice)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-800">{formatIDR(totalVal)}</div>
                      <div
                        className={`text-[11px] font-semibold flex items-center justify-end gap-0.5 ${
                          isGain ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isGain ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        <span>
                          {isGain ? '+' : ''}
                          {plPct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteStock(stock.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50 min-h-[36px] min-w-[36px] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-rose-500"
                      aria-label={`Delete ${stock.code}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            }))}
          </div>
        </div>
      )}

      {/* Gold Section */}
      {(subTab === 'all' || subTab === 'gold') && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-amber-50 text-amber-600">
                <Coins className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Gold Holdings (Spot & Antam)
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-800">
              {formatIDR(metrics.totalGoldVal)}
            </span>
          </div>

          <div className="space-y-2">
            {goldHoldings.length === 0 ? (
              <div className="p-5 bg-white rounded-2xl border border-rose-100 text-center">
                <p className="text-xs text-slate-500 font-medium">Belum ada simpanan emas</p>
              </div>
            ) : (
              goldHoldings.map((gold) => {
              const livePrice = gold.type === 'spot' ? goldPrices.spot : goldPrices.antam;
              const totalVal = gold.grams * livePrice;
              const cost = gold.grams * gold.avgBuy;
              const pl = totalVal - cost;
              const plPct = cost > 0 ? (pl / cost) * 100 : 0;
              const isGain = pl >= 0;

              return (
                <div
                  key={gold.id}
                  className="p-3.5 bg-white rounded-2xl border border-rose-100 flex items-center justify-between shadow-2xs min-h-[58px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 font-bold text-amber-700 text-xs flex items-center justify-center border border-amber-100">
                      Au
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{gold.label}</span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold uppercase text-[10px]">
                          {gold.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {gold.grams} grams • Rate: {formatIDR(livePrice)}/g
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-800">{formatIDR(totalVal)}</div>
                      <div
                        className={`text-[11px] font-semibold flex items-center justify-end gap-0.5 ${
                          isGain ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isGain ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        <span>
                          {isGain ? '+' : ''}
                          {plPct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteGoldHolding(gold.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50 min-h-[36px] min-w-[36px] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-rose-500"
                      aria-label={`Delete ${gold.label}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            }))}
          </div>
        </div>
      )}
    </div>
  );
};
