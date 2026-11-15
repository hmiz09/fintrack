import React, { useState, useRef } from 'react';
import { useFinTrack } from '../../context/FinTrackContext';
import { getOrdinalDay } from '../../utils/formatters';
import { Minus, Plus, X } from 'lucide-react';

interface DueDateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DueDateModal: React.FC<DueDateModalProps> = ({ isOpen, onClose }) => {
  const { ccDueDate, setCcDueDate } = useFinTrack();
  const [day, setDay] = useState(ccDueDate);
  const touchStartY = useRef<number | null>(null);

  if (!isOpen) return null;

  const clamp = (val: number) => Math.max(1, Math.min(31, val));

  const updateDay = (delta: number) => {
    setDay((prev) => clamp(prev + delta));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchStartY.current - touchEndY;
    const threshold = 18;

    if (diffY > threshold) {
      // Swiped UP -> increase day
      setDay((prev) => clamp(prev + 1));
    } else if (diffY < -threshold) {
      // Swiped DOWN -> decrease day
      setDay((prev) => clamp(prev - 1));
    }
    touchStartY.current = null;
  };

  const handleSave = () => {
    setCcDueDate(day);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-xl border border-rose-100 text-center">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-slate-800">Change Due Date</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Minimal Stepper Stage with Swipe Zone */}
        <div className="flex items-center justify-center gap-4 my-6">
          <button
            type="button"
            onClick={() => updateDay(-1)}
            disabled={day <= 1}
            className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 hover:bg-rose-100 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center focus-visible:outline-2 focus-visible:outline-rose-500"
            aria-label="Decrease day"
          >
            <Minus className="w-5 h-5" />
          </button>

          {/* Central Swipe Zone & Direct Numeric Input */}
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative w-28 h-24 rounded-2xl bg-rose-50/50 border-2 border-rose-200/70 flex flex-col items-center justify-center cursor-ns-resize select-none touch-pan-y"
          >
            <input
              type="number"
              min={1}
              max={31}
              value={day}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) setDay(clamp(val));
              }}
              className="w-full text-center text-3xl font-black text-rose-600 bg-transparent focus:outline-none"
            />
            <span className="text-xs font-bold text-rose-900/60 -mt-1">
              {getOrdinalDay(day)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => updateDay(1)}
            disabled={day >= 31}
            className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 hover:bg-rose-100 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center focus-visible:outline-2 focus-visible:outline-rose-500"
            aria-label="Increase day"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-4">
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
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
