import React, { useState } from 'react';
import { FinTrackProvider, useFinTrack } from './context/FinTrackContext';
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

  const handleOpenAddTx = () => {
    setEditingTx(null);
    setIsTxModalOpen(true);
  };

  const handleEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setIsTxModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f7eef3] flex justify-center selection:bg-rose-100 selection:text-rose-600">
      {/* Mobile Frame (Exact 1:1 match with prototype) */}
      <div className="pink-phone w-full max-w-[420px] min-h-screen sm:min-h-[844px] flex flex-col relative sm:my-auto sm:rounded-[40px] sm:shadow-2xl sm:border sm:border-[#ead4df] overflow-hidden">
        
        {/* iOS Status Bar */}
        <header
          className="px-6 pt-3 pb-2 flex items-center justify-between text-xs font-semibold select-none shrink-0"
          style={{ background: 'var(--pk-bg)', color: 'var(--pk-text)' }}
        >
          <span className="tabular-nums">09:41</span>
          <div
            className="w-24 h-5 rounded-full bg-[#1e151b] flex items-center justify-end pr-2"
            aria-hidden="true"
          >
            <div className="w-2 h-2 rounded-full bg-[#4a3746]" />
          </div>
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 20h20V4L2 20z" />
            </svg>
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="7" width="18" height="10" rx="2" />
              <path d="M22 11v2" />
            </svg>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto phone-scroll px-4 pb-28 space-y-4">
          {activeTab === 'dashboard' && (
            <>
              {/* Dashboard Header */}
              <div className="pt-3">
                <p className="text-xs font-medium" style={{ color: 'var(--pk-muted)' }}>
                  November 2026
                </p>
                <h2 className="text-xl font-bold tracking-tight leading-tight">Overview</h2>
              </div>

              {/* 2 Summary Cards: Total Assets & Total Cash */}
              <SummaryCards onOpenCashModal={() => setIsCashModalOpen(true)} />

              {/* Monthly Spending & Wide Chart */}
              <SpendingChart />

              {/* Recent 3 Transactions */}
              <TransactionList
                onEditTransaction={handleEditTx}
                onOpenAddModal={handleOpenAddTx}
                isDashboardPreview={true}
              />
            </>
          )}

          {activeTab === 'transactions' && (
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
              onEditTransaction={handleEditTx}
              onOpenAddModal={handleOpenAddTx}
            />
          )}

          {activeTab === 'assets' && (
            <AssetsTab onOpenAddAsset={() => setIsAssetModalOpen(true)} />
          )}
        </main>

        {/* Bottom Tab Bar (Exact 1:1 Solid High-Contrast iOS Navigation) */}
        <nav
          aria-label="Main navigation"
          className="fixed bottom-0 max-w-[420px] w-full px-2 pt-1.5 pb-4 flex items-center justify-around z-20 border-t sm:absolute"
          style={{
            background: 'var(--pk-card)',
            borderColor: 'var(--pk-border)',
          }}
        >
          {/* 1. Home / Dashboard */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            data-active={activeTab === 'dashboard'}
            className="nav-btn min-w-[56px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl text-xs font-semibold"
            style={{
              color: activeTab === 'dashboard' ? 'var(--pk-primary-text)' : 'var(--pk-muted)',
            }}
          >
            <span className="nav-pill px-3 py-1 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="9" rx="1.5" />
                <rect x="14" y="3" width="7" height="5" rx="1.5" />
                <rect x="14" y="12" width="7" height="9" rx="1.5" />
                <rect x="3" y="16" width="7" height="5" rx="1.5" />
              </svg>
            </span>
            <span>Home</span>
          </button>

          {/* 2. Activity / Transactions */}
          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            data-active={activeTab === 'transactions'}
            className="nav-btn min-w-[56px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl text-xs font-semibold"
            style={{
              color: activeTab === 'transactions' ? 'var(--pk-primary-text)' : 'var(--pk-muted)',
            }}
          >
            <span className="nav-pill px-3 py-1 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 6h13" />
                <path d="M8 12h13" />
                <path d="M8 18h13" />
                <path d="M3 6h.01" />
                <path d="M3 12h.01" />
                <path d="M3 18h.01" />
              </svg>
            </span>
            <span>Activity</span>
          </button>

          {/* 3. Center FAB Add Button */}
          <button
            type="button"
            onClick={handleOpenAddTx}
            aria-label="Add transaction"
            className="fab-plus flex items-center justify-center w-14 h-14 -mt-5 rounded-full border-4 text-white"
            style={{ borderColor: 'var(--pk-card)' }}
          >
            <svg
              className="w-7 h-7"
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </button>

          {/* 4. Cards */}
          <button
            type="button"
            onClick={() => setActiveTab('cc')}
            data-active={activeTab === 'cc'}
            className="nav-btn min-w-[56px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl text-xs font-semibold relative"
            style={{
              color: activeTab === 'cc' ? 'var(--pk-primary-text)' : 'var(--pk-muted)',
            }}
          >
            <span className="nav-pill px-3 py-1 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="5" width="20" height="14" rx="2.5" />
                <path d="M2 10h20" />
              </svg>
            </span>
            <span>Cards</span>
            {metrics.ccDueUnpaid > 0 && (
              <span
                className="absolute top-1.5 right-3 w-2 h-2 rounded-full"
                style={{ background: 'var(--pk-primary)' }}
                aria-hidden="true"
              />
            )}
          </button>

          {/* 5. Assets */}
          <button
            type="button"
            onClick={() => setActiveTab('assets')}
            data-active={activeTab === 'assets'}
            className="nav-btn min-w-[56px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl text-xs font-semibold"
            style={{
              color: activeTab === 'assets' ? 'var(--pk-primary-text)' : 'var(--pk-muted)',
            }}
          >
            <span className="nav-pill px-3 py-1 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </span>
            <span>Assets</span>
          </button>
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
