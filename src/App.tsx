import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ToastProvider, useToast } from './context/ToastContext.tsx';
import { CurrencyProvider } from './context/CurrencyContext.tsx';
import { PageView, Transaction } from './types/index.ts';
import api from './services/api.ts';

// Layout & Common Components
import { Sidebar } from './components/common/Sidebar.tsx';
import { Navbar } from './components/common/Navbar.tsx';
import { ToastContainer } from './components/common/Toast.tsx';
import { LoadingSpinner } from './components/common/LoadingSpinner.tsx';
import { ConfirmationModal } from './components/common/ConfirmationModal.tsx';
import { TransactionFormModal } from './components/transactions/TransactionFormModal.tsx';

// Pages
import { AuthPage } from './pages/AuthPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { TransactionsPage } from './pages/TransactionsPage.tsx';
import { BudgetPage } from './pages/BudgetPage.tsx';
import { ReportsPage } from './pages/ReportsPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';

const MainLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { showToast } = useToast();

  const [currentPage, setCurrentPage] = useState<PageView>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Transaction Modal State
  const [isTxModalOpen, setIsTxModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Transaction Deletion State
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [isDeletingTx, setIsDeletingTx] = useState<boolean>(false);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setIsTxModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsTxModalOpen(true);
  };

  const handleOpenDelete = (tx: Transaction) => {
    setDeletingTransaction(tx);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTransaction) return;
    setIsDeletingTx(true);
    try {
      const res = await api.delete(`/transactions/${deletingTransaction._id}`);
      if (res.data.success) {
        showToast('Transaction deleted successfully.', 'success');
        setDeletingTransaction(null);
        triggerRefresh();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete transaction.', 'error');
    } finally {
      setIsDeletingTx(false);
    }
  };

  const handleTransactionSaved = () => {
    triggerRefresh();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading Expense Tracker..." className="text-white" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <AuthPage />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">
        <Navbar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenAddTransaction={handleOpenAdd}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {currentPage === 'dashboard' && (
            <DashboardPage
              onNavigate={setCurrentPage}
              onOpenAddTransaction={handleOpenAdd}
              onEditTransaction={handleOpenEdit}
              onDeleteTransaction={handleOpenDelete}
              refreshTrigger={refreshTrigger}
            />
          )}

          {currentPage === 'transactions' && (
            <TransactionsPage
              onOpenAddTransaction={handleOpenAdd}
              onEditTransaction={handleOpenEdit}
              onDeleteTransaction={handleOpenDelete}
              refreshTrigger={refreshTrigger}
            />
          )}

          {currentPage === 'budget' && (
            <BudgetPage refreshTrigger={refreshTrigger} />
          )}

          {currentPage === 'reports' && (
            <ReportsPage refreshTrigger={refreshTrigger} />
          )}

          {currentPage === 'profile' && (
            <ProfilePage onNavigate={setCurrentPage} />
          )}

          {currentPage === 'settings' && (
            <SettingsPage />
          )}
        </main>
      </div>

      {/* Transaction Add / Edit Modal */}
      <TransactionFormModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTransaction(null);
        }}
        onSuccess={handleTransactionSaved}
        initialData={editingTransaction}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Transaction"
        message={
          deletingTransaction
            ? `Are you sure you want to delete this ${deletingTransaction.type} of $${deletingTransaction.amount} (${deletingTransaction.category})? This will immediately recalculate your balances and budgets.`
            : ''
        }
        confirmText="Delete Entry"
        isLoading={isDeletingTx}
        isDangerous={true}
      />

      {/* Toast Notification Stack */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <CurrencyProvider>
        <AuthProvider>
          <MainLayout />
        </AuthProvider>
      </CurrencyProvider>
    </ToastProvider>
  );
}
