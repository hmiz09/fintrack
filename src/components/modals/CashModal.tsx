import React, { useState } from 'react';
import { useFinTrack } from '../../context/FinTrackContext';
import { formatDots, parseDots, formatIDR } from '../../utils/formatters';
import { X, Wallet } from 'lucide-react';

interface CashModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CashModal: React.FC<CashModalProps> = ({ isOpen, onClose }) => {
  const { cashBalance, setCashBalance } = useFinTrack();
  const [valStr, setValStr] = useState(formatDots(cashBalance));

  if (!isOpen) return null;

  const quickAdds = [500000, 1000000, 2000000, 5000000];

  const handleQuickAdd = (amt: number) => {
    const cur = parseDots(valStr);
    setValStr(formatDots(cur + amt));
  };

  const handleSave = () => {
    const num = parseDots(valStr);
    setCashBalance(num);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-rose-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <Wallet className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Adjust Cash Balance</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Current Bank & Cash Balance
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-base font-bold text-rose-600">Rp</span>
            <input
              type="text"
              value={valStr}
              onChange={(e) => setValStr(formatDots(parseDots(e.target.value)))}
              className="w-full pl-11 pr-4 py-3 bg-rose-50/50 rounded-2xl border-2 border-rose-200/80 text-xl font-black text-slate-800 focus:outline-none focus:border-rose-500"
              placeholder="0"
            />
          </div>
        </div>

        {/* Quick Add Chips */}
        <div className="mb-6">
          <span className="text-[11px] text-slate-400 block mb-2 font-medium">Quick add funds:</span>
          <div className="grid grid-cols-2 gap-2">
            {quickAdds.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handleQuickAdd(amt)}
                className="py-2 px-3 rounded-xl border border-rose-100 bg-rose-50/30 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-colors min-h-[40px] flex items-center justify-center"
              >
                +{formatIDR(amt)}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all min-h-[44px]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all min-h-[44px]"
          >
            Save Balance
          </button>
        </div>
      </div>
    </div>
  );
};
