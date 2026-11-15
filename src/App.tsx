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

import type { Transaction } from './types';
import { Plus } from 'lucide-react';

const FinTrackApp: React.FC = () => {
  const { activeTab } = useFinTrack();

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [isDueDateModalOpen, setIsDueDateModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);

  const handleOpenAddTx = () => {
    setEditingTx(null);
    setIsTxModalOpen(true);
  };

  const handleEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setIsTxModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-rose-50/50 flex justify-center selection:bg-rose-100 selection:text-rose-600">
      {/* Mobile constrained frame */}
      <div className="w-full max-w-md min-h-screen bg-[#fff9fb] border-x border-rose-200/60 shadow-xl flex flex-col relative pb-24">
        {/* Top Header & Navigation */}
        <TopHeader onOpenCategories={() => setIsCategoryModalOpen(true)} />

        {/* Dynamic Tab Content */}
        <main className="flex-1 mt-3">
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

        {/* Floating Action Button (FAB) to Add Transaction */}
        <button
          type="button"
          onClick={handleOpenAddTx}
          className="fixed bottom-6 right-6 sm:absolute sm:right-6 sm:bottom-6 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 text-white shadow-lg shadow-rose-500/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-rose-500"
          aria-label="Add New Transaction"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>

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
