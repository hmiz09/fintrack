import React, { useState } from 'react';
import { FinTrackProvider, useFinTrack } from './context/FinTrackContext';
import { TopHeader } from './components/TopHeader';
import { SummaryCards } from './components/SummaryCards';
import { SpendingChart } from './components/SpendingChart';
import { TransactionList } from './components/TransactionList';
import { CreditCardTab } from './components/CreditCardTab';
import { AssetsTab } from './components/AssetsTab';

// Modals
import { TransactionModal } from './components/modals/TransactionModal';
import { DueDateModal } from './components/modals/DueDateModal';
import { LimitModal } from './components/modals/LimitModal';
import { CashModal } from './components/modals/CashModal';
import { CategoryModal } from './components/modals/CategoryModal';
import { AssetModal } from './components/modals/AssetModal';
import { ProfileModal } from './components/modals/ProfileModal';

import type { Transaction, ActiveTab } from './types';
import { LayoutDashboard, History, CreditCard, TrendingUp, Plus } from 'lucide-react';

const FinTrackApp: React.FC = () => {
  const { activeTab, setActiveTab, metrics } = useFinTrack();

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [isDueDateModalOpen, setIsDueDateModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleOpenAddTx = () => {
    setEditingTx(null);
    setIsTxModalOpen(true);
  };

  const handleEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setIsTxModalOpen(true);
  };

  const navItems: { key: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'activity', label: 'Activity', icon: History },
  ];

  const rightNavItems: { key: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'cc', label: 'Cards', icon: CreditCard },
    { key: 'assets', label: 'Assets', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-rose-50/50 flex justify-center selection:bg-rose-100 selection:text-rose-600">
      {/* Mobile constrained frame */}
      <div className="w-full max-w-md min-h-screen bg-[#fff9fb] border-x border-rose-200/60 shadow-xl flex flex-col relative pb-28">
        {/* Top Header (User greeting, avatar, settings icon) */}
        <TopHeader
          onOpenCategories={() => setIsCategoryModalOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        {/* Dynamic Tab Content */}
        <main className="flex-1 mt-1">
          {activeTab === 'dashboard' && (
            <>
              <SummaryCards onOpenCashModal={() => setIsCashModalOpen(true)} />
              <SpendingChart />
              <TransactionList
                onEditTransaction={handleEditTx}
                onOpenAddModal={handleOpenAddTx}
                isDashboardPreview={true}
              />
            </>
          )}

          {activeTab === 'activity' && (
            <TransactionList
              onEditTransaction={handleEditTx}
              onOpenAddModal={handleOpenAddTx}
              isDashboardPreview={false}
            />
          )}

          {activeTab === 'cc' && (
            <CreditCardTab
              onOpenLimitModal={() => setIsLimitModalOpen(true)}
              onOpenDueDateModal={() => setIsDueDateModalOpen(true)}
            />
          )}

          {activeTab === 'assets' && (
            <AssetsTab onOpenAddAsset={() => setIsAssetModalOpen(true)} />
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <nav
          aria-label="Main Navigation"
          className="fixed bottom-0 max-w-md w-full bg-white/95 backdrop-blur-md border-t border-rose-200/80 px-3 py-2 flex items-center justify-around z-30 shadow-lg"
        >
          {navItems.map((item) => {
            const active = activeTab === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition-all min-h-[44px] ${
                  active ? 'text-rose-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}

          {/* Center Floating Plus Button */}
          <div className="flex-1 flex justify-center">
            <button
              type="button"
              onClick={handleOpenAddTx}
              aria-label="Add New Transaction"
              className="-mt-7 w-13 h-13 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 text-white shadow-lg shadow-rose-500/30 flex items-center justify-center border-4 border-[#fff9fb] transition-all hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-rose-500"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {rightNavItems.map((item) => {
            const active = activeTab === item.key;
            const Icon = item.icon;
            const hasBadge = item.key === 'cc' && metrics.ccDueUnpaid > 0;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition-all min-h-[44px] relative ${
                  active ? 'text-rose-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  {hasBadge && (
                    <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-rose-500" />
                  )}
                </div>
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Modals Container */}
        <TransactionModal
          isOpen={isTxModalOpen}
          onClose={() => setIsTxModalOpen(false)}
          editingTx={editingTx}
          onOpenCategories={() => setIsCategoryModalOpen(true)}
        />

        <DueDateModal
          isOpen={isDueDateModalOpen}
          onClose={() => setIsDueDateModalOpen(false)}
        />

        <LimitModal
          isOpen={isLimitModalOpen}
          onClose={() => setIsLimitModalOpen(false)}
        />

        <CashModal
          isOpen={isCashModalOpen}
          onClose={() => setIsCashModalOpen(false)}
        />

        <CategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
        />

        <AssetModal
          isOpen={isAssetModalOpen}
          onClose={() => setIsAssetModalOpen(false)}
        />

        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <FinTrackProvider>
      <FinTrackApp />
    </FinTrackProvider>
  );
};

export default App;
