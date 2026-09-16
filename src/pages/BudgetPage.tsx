import React, { useState, useEffect, useCallback } from 'react';
import { BudgetStatus, BudgetHistoryItem } from '../types/index.ts';
import api from '../services/api.ts';
import { useCurrency } from '../context/CurrencyContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { BudgetProgress } from '../components/budget/BudgetProgress.tsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import {
  WalletCards,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  History,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from 'lucide-react';

interface BudgetPageProps {
  refreshTrigger: number;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const BudgetPage: React.FC<BudgetPageProps> = ({ refreshTrigger }) => {
  const { formatAmount } = useCurrency();
  const { showToast } = useToast();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());

  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
  const [history, setHistory] = useState<BudgetHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchBudgetData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [statusRes, histRes] = await Promise.all([
        api.get('/budget', { params: { month: selectedMonth, year: selectedYear } }),
        api.get('/budget/history'),
      ]);

      if (statusRes.data.success) {
        setBudgetStatus(statusRes.data);
      }
      if (histRes.data.success) {
        setHistory(histRes.data.history);
      }
    } catch (err) {
      console.error('Failed to load budget data:', err);
      showToast('Could not load budget data.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear, showToast]);

  useEffect(() => {
    fetchBudgetData();
  }, [fetchBudgetData, refreshTrigger]);

  const handleUpdateBudget = async (newAmount: number) => {
    try {
      const res = await api.post('/budget', {
        month: selectedMonth,
        year: selectedYear,
        amount: newAmount,
      });
      if (res.data.success) {
        showToast('Monthly budget updated!', 'success');
        fetchBudgetData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update budget.', 'error');
    }
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleJumpToCurrent = () => {
    setSelectedMonth(now.getMonth() + 1);
    setSelectedYear(now.getFullYear());
  };

  return (
    <div className="space-y-6">
      {/* Page Header and Month Picker Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Budget Management</h2>
          <p className="text-xs text-slate-500">
            Track spending against monthly targets and prevent overspending
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={handlePrevMonth}
              id="budget-prev-month-btn"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 text-xs font-bold text-slate-900 min-w-[120px] text-center">
              {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
            </div>
            <button
              onClick={handleNextMonth}
              id="budget-next-month-btn"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {(selectedMonth !== now.getMonth() + 1 || selectedYear !== now.getFullYear()) && (
            <button
              onClick={handleJumpToCurrent}
              className="px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {isLoading && !budgetStatus ? (
        <div className="py-12">
          <LoadingSpinner label="Loading budget status..." />
        </div>
      ) : (
        <>
          {/* Active Month Budget Card */}
          {budgetStatus && (
            <BudgetProgress
              budgetAmount={budgetStatus.budgetAmount}
              monthlyExpenses={budgetStatus.monthlyExpenses}
              remainingBudget={budgetStatus.remainingBudget}
              percentSpent={budgetStatus.percentSpent}
              isExceeded={budgetStatus.isExceeded}
              isWarning={budgetStatus.isWarning}
              onUpdateBudget={handleUpdateBudget}
              monthName={MONTH_NAMES[selectedMonth - 1]}
              year={selectedYear}
            />
          )}

          {/* Quick Metrics Breakdown */}
          {budgetStatus && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-xs font-semibold text-slate-500">Allocated Budget</span>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">
                  {formatAmount(budgetStatus.budgetAmount)}
                </p>
                <span className="text-[11px] text-slate-400">Target for {MONTH_NAMES[selectedMonth - 1]}</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-xs font-semibold text-slate-500">Actual Spending</span>
                <p className="text-2xl font-extrabold text-rose-600 mt-1">
                  {formatAmount(budgetStatus.monthlyExpenses)}
                </p>
                <span className="text-[11px] text-slate-400">
                  {budgetStatus.percentSpent}% of target spent
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-xs font-semibold text-slate-500">Surplus / Deficit</span>
                <p
                  className={`text-2xl font-extrabold mt-1 ${
                    budgetStatus.remainingBudget >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {formatAmount(budgetStatus.remainingBudget)}
                </p>
                <span className="text-[11px] text-slate-400">
                  {budgetStatus.remainingBudget >= 0 ? 'Remaining cash runway' : 'Over budget'}
                </span>
              </div>
            </div>
          )}

          {/* Budget History Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-slate-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Historical Budget Performance</h3>
                <p className="text-xs text-slate-500">Track how well you adhered to past targets</p>
              </div>
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-3">No historical budgets recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200/80">
                    <tr>
                      <th className="px-4 py-3">Period</th>
                      <th className="px-4 py-3">Budget</th>
                      <th className="px-4 py-3">Expenses</th>
                      <th className="px-4 py-3">Remaining</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {history.map((h) => {
                      const isPastExceeded = h.isExceeded;
                      return (
                        <tr key={h._id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 font-bold text-slate-900">
                            {MONTH_NAMES[h.month - 1]} {h.year}
                          </td>
                          <td className="px-4 py-3 font-semibold">{formatAmount(h.amount)}</td>
                          <td className="px-4 py-3 font-semibold text-rose-600">
                            {formatAmount(h.monthlyExpenses)}
                          </td>
                          <td
                            className={`px-4 py-3 font-bold ${
                              h.remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {formatAmount(h.remaining)}
                          </td>
                          <td className="px-4 py-3">
                            {isPastExceeded ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold">
                                <Flame className="w-3 h-3 text-rose-600" /> Exceeded ({h.percentSpent}%)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Adhered ({h.percentSpent}%)
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
