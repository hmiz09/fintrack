import React, { useState } from 'react';
import { useFinTrack } from '../../context/FinTrackContext';
import { formatDots, parseDots } from '../../utils/formatters';
import { X, TrendingUp, Coins } from 'lucide-react';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssetModal: React.FC<AssetModalProps> = ({ isOpen, onClose }) => {
  const { addStock, addGoldHolding } = useFinTrack();
  const [assetType, setAssetType] = useState<'stock' | 'gold'>('stock');

  // Stock Form State
  const [stockCode, setStockCode] = useState('');
  const [lots, setLots] = useState(10);
  const [avgBuyPrice, setAvgBuyPrice] = useState('9.000');

  // Gold Form State
  const [goldType, setGoldType] = useState<'spot' | 'antam'>('antam');
  const [grams, setGrams] = useState(10);
  const [goldAvgPrice, setGoldAvgPrice] = useState('1.350.000');
  const [goldLabel, setGoldLabel] = useState('Antam Bar');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (assetType === 'stock') {
      const code = stockCode.trim().toUpperCase();
      if (!code) return;
      const buyPrice = parseDots(avgBuyPrice);
      addStock(code, lots, buyPrice);
    } else {
      const buyPrice = parseDots(goldAvgPrice);
      addGoldHolding({
        type: goldType,
        grams: Number(grams) || 1,
        avgBuy: buyPrice,
        label: goldLabel.trim() || (goldType === 'spot' ? 'Digital Gold' : 'Antam Bar'),
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-rose-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800">Add Investment Asset</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Asset Type Selector */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-rose-50/60 rounded-2xl border border-rose-100">
          <button
            type="button"
            onClick={() => setAssetType('stock')}
            className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all min-h-[40px] ${
              assetType === 'stock'
                ? 'bg-white text-rose-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>IDX Stock</span>
          </button>
          <button
            type="button"
            onClick={() => setAssetType('gold')}
            className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all min-h-[40px] ${
              assetType === 'gold'
                ? 'bg-white text-amber-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Gold Holding</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {assetType === 'stock' ? (
            <>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Ticker Code (IDX)
                </label>
                <input
                  type="text"
                  value={stockCode}
                  onChange={(e) => setStockCode(e.target.value.toUpperCase())}
                  placeholder="e.g. BBCA, BBRI, BMRI"
                  className="w-full px-3 py-2 bg-rose-50/40 rounded-xl border border-rose-200 text-xs font-bold text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[42px]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Volume (Lots, 1 Lot = 100 Shares)
                </label>
                <input
                  type="number"
                  min={1}
                  value={lots}
                  onChange={(e) => setLots(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 bg-rose-50/40 rounded-xl border border-rose-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[42px]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Average Buy Price (Rp / share)
                </label>
                <input
                  type="text"
                  value={avgBuyPrice}
                  onChange={(e) => setAvgBuyPrice(formatDots(parseDots(e.target.value)))}
                  className="w-full px-3 py-2 bg-rose-50/40 rounded-xl border border-rose-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[42px]"
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Gold Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGoldType('antam');
                      setGoldLabel('Antam Physical Bar');
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border min-h-[40px] ${
                      goldType === 'antam'
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Antam Physical
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGoldType('spot');
                      setGoldLabel('Digital Gold Savings');
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border min-h-[40px] ${
                      goldType === 'spot'
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Digital Spot
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Description Label
                </label>
                <input
                  type="text"
                  value={goldLabel}
                  onChange={(e) => setGoldLabel(e.target.value)}
                  className="w-full px-3 py-2 bg-amber-50/30 rounded-xl border border-amber-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[42px]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Weight (Grams)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={0.1}
                  value={grams}
                  onChange={(e) => setGrams(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-amber-50/30 rounded-xl border border-amber-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[42px]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Average Buy Price (Rp / gram)
                </label>
                <input
                  type="text"
                  value={goldAvgPrice}
                  onChange={(e) => setGoldAvgPrice(formatDots(parseDots(e.target.value)))}
                  className="w-full px-3 py-2 bg-amber-50/30 rounded-xl border border-amber-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[42px]"
                  required
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all min-h-[44px]"
            >
              Save Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
