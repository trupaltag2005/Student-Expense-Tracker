import React, { useState, useEffect, useCallback } from 'react';
import { Transaction, TransactionType } from '../types/index.ts';
import api from '../services/api.ts';
import { useCurrency } from '../context/CurrencyContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { TransactionTable } from '../components/transactions/TransactionTable.tsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { CATEGORIES_META } from '../utils/categories.ts';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Download,
  RotateCcw,
  Calendar,
} from 'lucide-react';

interface TransactionsPageProps {
  onOpenAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (tx: Transaction) => void;
  refreshTrigger: number;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  onOpenAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  refreshTrigger,
}) => {
  const { formatAmount } = useCurrency();
  const { showToast } = useToast();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters and search state
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string> = { sortBy };
      if (typeFilter !== 'all') params.type = typeFilter;
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (search.trim()) params.search = search.trim();
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/transactions', { params });
      if (res.data.success) {
        setTransactions(res.data.transactions);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
      showToast('Error loading transactions.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter, categoryFilter, search, startDate, endDate, sortBy, showToast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, refreshTrigger]);

  const handleResetFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setCategoryFilter('All');
    setStartDate('');
    setEndDate('');
    setSortBy('newest');
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      showToast('No transactions to export.', 'warning');
      return;
    }

    const headers = ['Date', 'Type', 'Category', 'Amount', 'Payment Method', 'Description'];
    const rows = transactions.map((t) => [
      new Date(t.date).toLocaleDateString(),
      t.type,
      `"${t.category}"`,
      t.amount,
      `"${t.paymentMethod}"`,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported CSV successfully!', 'success');
  };

  // Quick stats for filtered set
  const filteredIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-5">
      {/* Header and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Transaction Registry</h2>
          <p className="text-xs text-slate-500">
            {transactions.length} record{transactions.length === 1 ? '' : 's'} matching criteria
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            id="export-transactions-btn"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddTransaction}
            id="add-tx-main-btn"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              id="tx-search-input"
              placeholder="Search description, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            {(['all', 'expense', 'income'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`flex-1 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                  typeFilter === t
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              id="tx-category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 bg-white"
            >
              <option value="All">All Categories</option>
              {Object.keys(CATEGORIES_META).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <select
              id="tx-sort-select"
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 bg-white"
            >
              <option value="newest">Sort: Date (Newest First)</option>
              <option value="oldest">Sort: Date (Oldest First)</option>
              <option value="highest">Sort: Amount (Highest First)</option>
              <option value="lowest">Sort: Amount (Lowest First)</option>
            </select>
          </div>
        </div>

        {/* Date Range Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Date Range:
            </span>
            <input
              type="date"
              id="tx-start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-slate-700"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              id="tx-end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-slate-700"
            />
          </div>

          <button
            onClick={handleResetFilters}
            id="tx-reset-filters-btn"
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-semibold py-1 px-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Filtered Summary Header */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-white rounded-xl border border-slate-200/80">
          <span className="text-[11px] font-semibold text-slate-500">Filtered Incomes</span>
          <p className="text-base font-extrabold text-emerald-600 mt-0.5">
            +{formatAmount(filteredIncome)}
          </p>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200/80">
          <span className="text-[11px] font-semibold text-slate-500">Filtered Expenses</span>
          <p className="text-base font-extrabold text-rose-600 mt-0.5">
            -{formatAmount(filteredExpense)}
          </p>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-slate-500">Filtered Net</span>
          <p
            className={`text-base font-extrabold mt-0.5 ${
              filteredIncome - filteredExpense >= 0 ? 'text-slate-900' : 'text-rose-600'
            }`}
          >
            {formatAmount(filteredIncome - filteredExpense)}
          </p>
        </div>
      </div>

      {/* Transactions List / Table */}
      {isLoading ? (
        <div className="py-12">
          <LoadingSpinner label="Loading filtered transactions..." />
        </div>
      ) : (
        <TransactionTable
          transactions={transactions}
          onEdit={onEditTransaction}
          onDelete={onDeleteTransaction}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};
