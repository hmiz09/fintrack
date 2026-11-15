import React from 'react';
import { Sparkles, SlidersHorizontal, Settings } from 'lucide-react';
import { useFinTrack } from '../context/FinTrackContext';

interface TopHeaderProps {
  onOpenCategories: () => void;
  onOpenProfile: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenCategories, onOpenProfile }) => {
  const { userName } = useFinTrack();
  const displayName = userName?.trim() || 'Rose';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="px-5 pt-6 pb-3">
      {/* User greeting and top actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenProfile}
            className="relative group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-full"
            aria-label="Buka Profil dan Pengaturan"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-rose-500 to-pink-300 p-0.5 shadow-sm group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-rose-600 font-bold text-base">
                {initial}
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
          </button>

          <button
            type="button"
            onClick={onOpenProfile}
            className="text-left group focus:outline-none"
            aria-label="Edit nama dan pengaturan"
          >
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-slate-800 leading-tight group-hover:text-rose-600 transition-colors">
                Hello, {displayName}
              </h1>
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <p className="text-xs text-rose-950/60 font-medium group-hover:underline">
              Tap untuk ganti nama / reset
            </p>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenProfile}
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-full bg-white/90 border border-rose-200/70 text-rose-950/70 hover:text-rose-600 hover:bg-rose-50/60 transition-colors shadow-xs flex items-center justify-center focus-visible:outline-2 focus-visible:outline-rose-500"
            aria-label="Profil & Pengaturan"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenCategories}
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-full bg-white/90 border border-rose-200/70 text-rose-950/70 hover:text-rose-600 hover:bg-rose-50/60 transition-colors shadow-xs flex items-center justify-center focus-visible:outline-2 focus-visible:outline-rose-500"
            aria-label="Manage Categories"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
