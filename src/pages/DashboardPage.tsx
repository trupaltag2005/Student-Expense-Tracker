import React, { useEffect, useState, useCallback } from 'react';
import { DashboardSummary, Transaction, PageView } from '../types/index.ts';
import api from '../services/api.ts';
import { useCurrency } from '../context/CurrencyContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { DashboardCard } from '../components/dashboard/DashboardCard.tsx';
import { TransactionTable } from '../components/transactions/TransactionTable.tsx';
import { ExpenseChart } from '../components/charts/ExpenseChart.tsx';
import { MonthlyBarChart } from '../components/charts/MonthlyBarChart.tsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  PlusCircle,
  Receipt,
  AlertCircle,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (page: PageView) => void;
  onOpenAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (tx: Transaction) => void;
  refreshTrigger: number;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  refreshTrigger,
}) => {
  const { formatAmount } = useCurrency();
  const { showToast } = useToast();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSummary = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/dashboard/summary');
      if (res.data.success) {
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      showToast('Could not load dashboard summary.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary, refreshTrigger]);

  if (isLoading && !summary) {
    return (
      <div className="py-20">
        <LoadingSpinner size="lg" label="Calculating financial metrics..." />
      </div>
    );
  }

  const s = summary || {
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    monthlyBudget: 0,
    currentMonthExpenses: 0,
    currentMonthIncome: 0,
    remainingBudget: 0,
    percentBudgetUsed: 0,
    recentTransactions: [],
    expenseOverviewChart: [],
    monthlySpendingChart: [],
  };

  const isExceeded = s.monthlyBudget > 0 && s.currentMonthExpenses > s.monthlyBudget;
  const isWarning = s.monthlyBudget > 0 && s.percentBudgetUsed >= 80 && !isExceeded;

  return (
    <div className="space-y-6">
      {/* Exceeded/Warning Alert Banner if applicable */}
      {isExceeded && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold block">Monthly Budget Exceeded!</span>
              <span>
                You have spent {formatAmount(s.currentMonthExpenses)} against a {formatAmount(s.monthlyBudget)} budget.
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('budget')}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shrink-0 transition-colors"
          >
            Adjust Budget
          </button>
        </div>
      )}

      {isWarning && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <TrendingDown className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold block">Approaching Monthly Budget Limit</span>
              <span>
                You have used {s.percentBudgetUsed}% of your budget with {formatAmount(s.remainingBudget)} remaining.
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('budget')}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shrink-0 transition-colors"
          >
            View Budget
          </button>
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <DashboardCard
          id="metric-total-balance"
          title="Total Balance"
          value={formatAmount(s.totalBalance)}
          subtitle="Income minus expenses"
          icon={Wallet}
          variant="balance"
          badgeText={s.totalBalance >= 0 ? 'Net Positive' : 'Deficit'}
          badgeType={s.totalBalance >= 0 ? 'positive' : 'negative'}
        />

        {/* Total Income */}
        <DashboardCard
          id="metric-total-income"
          title="Total Income"
          value={formatAmount(s.totalIncome)}
          subtitle={`Current month: ${formatAmount(s.currentMonthIncome)}`}
          icon={ArrowUpRight}
          variant="income"
          badgeText="Cumulative"
          badgeType="positive"
        />

        {/* Total Expenses */}
        <DashboardCard
          id="metric-total-expenses"
          title="Total Expenses"
          value={formatAmount(s.totalExpenses)}
          subtitle={`Current month: ${formatAmount(s.currentMonthExpenses)}`}
          icon={ArrowDownLeft}
          variant="expense"
          badgeText="Cumulative"
          badgeType="negative"
        />

        {/* Monthly Budget */}
        <DashboardCard
          id="metric-monthly-budget"
          title="Monthly Budget"
          value={s.monthlyBudget > 0 ? formatAmount(s.monthlyBudget) : 'Not Set'}
          subtitle={
            s.monthlyBudget > 0
              ? `${formatAmount(s.remainingBudget)} remaining`
              : 'Click to configure'
          }
          icon={PiggyBank}
          variant="budget"
          badgeText={s.monthlyBudget > 0 ? `${s.percentBudgetUsed}% used` : 'Setup'}
          badgeType={isExceeded ? 'negative' : isWarning ? 'warning' : 'neutral'}
        />
      </div>

      {/* Quick Action Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Financial Actions</h4>
          <p className="text-xs text-slate-500">Quickly record transactions or view statements</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddTransaction}
            id="dashboard-quick-add-btn"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Entry</span>
          </button>
          <button
            onClick={() => onNavigate('transactions')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
          >
            <Receipt className="w-4 h-4 text-slate-500" />
            <span>View All</span>
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyBarChart
          data={s.monthlySpendingChart}
          title="Monthly Income vs. Spending"
        />
        <ExpenseChart
          data={s.expenseOverviewChart}
          title="Expense Breakdown by Category"
        />
      </div>

      {/* Recent Transactions Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
            <p className="text-xs text-slate-500">Latest financial activities recorded</p>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            id="dashboard-see-all-tx-btn"
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            <span>See all transactions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <TransactionTable
          transactions={s.recentTransactions}
          onEdit={onEditTransaction}
          onDelete={onDeleteTransaction}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
