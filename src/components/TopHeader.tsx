import React from 'react';
import { useFinTrack } from '../context/FinTrackContext';
import type { ActiveTab } from '../types';
import { Sparkles, SlidersHorizontal } from 'lucide-react';

interface TopHeaderProps {
  onOpenCategories: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenCategories }) => {
  const { activeTab, setActiveTab } = useFinTrack();

  const tabs: { key: ActiveTab; label: string }[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'activity', label: 'Activity' },
    { key: 'cc', label: 'Cards' },
    { key: 'assets', label: 'Assets' },
  ];

  return (
    <header className="px-5 pt-6 pb-2">
      {/* User greeting and top actions */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-rose-500 to-pink-300 p-0.5 shadow-sm">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-rose-600 font-bold text-base">
                R
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-slate-800 leading-tight">Hello, Rose</h1>
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <p className="text-xs text-rose-950/60 font-medium">November 2026</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenCategories}
          className="min-h-[44px] min-w-[44px] p-2.5 rounded-full bg-white/90 border border-rose-200/70 text-rose-950/70 hover:text-rose-600 hover:bg-rose-50/60 transition-colors shadow-xs flex items-center justify-center focus-visible:outline-2 focus-visible:outline-rose-500"
          aria-label="Manage Categories"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation tabs */}
      <nav className="flex items-center gap-1.5 p-1 bg-white/80 backdrop-blur-md rounded-2xl border border-rose-200/60 shadow-xs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-150 min-h-[44px] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-rose-500 ${
                isActive
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
