import React, { useState, useEffect, useCallback } from 'react';
import { ReportsSummary } from '../types/index.ts';
import api from '../services/api.ts';
import { useCurrency } from '../context/CurrencyContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { ExpenseChart } from '../components/charts/ExpenseChart.tsx';
import { MonthlyBarChart } from '../components/charts/MonthlyBarChart.tsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.tsx';
import { CATEGORIES_META, getPaymentIcon } from '../utils/categories.ts';
import {
  BarChart3,
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Percent,
  CreditCard,
  Layers,
} from 'lucide-react';

interface ReportsPageProps {
  refreshTrigger: number;
}

type RangePreset = 'this_month' | 'last_month' | 'last_3_months' | 'this_year' | 'all';

export const ReportsPage: React.FC<ReportsPageProps> = ({ refreshTrigger }) => {
  const { formatAmount } = useCurrency();
  const { showToast } = useToast();

  const [range, setRange] = useState<RangePreset>('all');
  const [reports, setReports] = useState<ReportsSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string> = {};
      if (range !== 'all') {
        params.range = range;
      }
      const res = await api.get('/reports/summary', { params });
      if (res.data.success) {
        setReports(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      showToast('Could not load reports summary.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [range, showToast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports, refreshTrigger]);

  const presetLabels: Record<RangePreset, string> = {
    this_month: 'This Month',
    last_month: 'Last Month',
    last_3_months: 'Last 3 Months',
    this_year: 'This Year',
    all: 'All Time',
  };

  const r = reports || {
    totalIncome: 0,
    totalExpenses: 0,
    savings: 0,
    savingsRate: 0,
    transactionCount: 0,
    expenseCategoryBreakdown: [],
    incomeCategoryBreakdown: [],
    paymentMethodBreakdown: [],
    monthlyTrend: [],
    startDate: null,
    endDate: null,
  };

  return (
    <div className="space-y-6">
      {/* Header and Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Financial Reports & Analytics</h2>
          <p className="text-xs text-slate-500">
            Analysis across {r.transactionCount} transactions in {presetLabels[range]}
          </p>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          {(['this_month', 'last_month', 'last_3_months', 'this_year', 'all'] as RangePreset[]).map(
            (p) => (
              <button
                key={p}
                onClick={() => setRange(p)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  range === p
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {presetLabels[p]}
              </button>
            )
          )}
        </div>
      </div>

      {isLoading && !reports ? (
        <div className="py-12">
          <LoadingSpinner size="lg" label="Aggregating financial analytics..." />
        </div>
      ) : (
        <>
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Total Inflow</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-emerald-600">{formatAmount(r.totalIncome)}</p>
              <span className="text-[11px] text-slate-400">Total verified income</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Total Outflow</span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-rose-600">{formatAmount(r.totalExpenses)}</p>
              <span className="text-[11px] text-slate-400">Total recorded expenses</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Net Savings</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <p
                className={`text-2xl font-extrabold ${
                  r.savings >= 0 ? 'text-indigo-600' : 'text-rose-600'
                }`}
              >
                {formatAmount(r.savings)}
              </p>
              <span className="text-[11px] text-slate-400">Income minus expenses</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Savings Rate</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Percent className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{r.savingsRate}%</p>
              <span className="text-[11px] text-slate-400">Percentage of income saved</span>
            </div>
          </div>

          {/* Visual Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExpenseChart
              data={r.expenseCategoryBreakdown}
              title={`Expense Distribution (${presetLabels[range]})`}
            />
            <MonthlyBarChart
              data={r.monthlyTrend}
              title={`Monthly Cash Flow History`}
            />
          </div>

          {/* Detailed Category Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-slate-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Category Spending Breakdown</h3>
                <p className="text-xs text-slate-500">Detailed line items and spending weights</p>
              </div>
            </div>

            {r.expenseCategoryBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-3">No expenses recorded for this range.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200/80">
                    <tr>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Transactions</th>
                      <th className="px-4 py-3">Total Spent</th>
                      <th className="px-4 py-3">Share of Total</th>
                      <th className="px-4 py-3">Visual Ratio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {r.expenseCategoryBreakdown.map((item) => {
                      const meta = CATEGORIES_META[item.category] || CATEGORIES_META['Other'];
                      const Icon = meta.icon;

                      return (
                        <tr key={item.category} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${meta.bgColor}`}>
                                <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                              </div>
                              <span>{item.category}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{item.count} items</td>
                          <td className="px-4 py-3 font-bold text-slate-900">
                            {formatAmount(item.amount)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-700">
                            {item.percentage}%
                          </td>
                          <td className="px-4 py-3 w-48">
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-600 rounded-full"
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payment Method Distribution */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-slate-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Payment Channel Distribution</h3>
                <p className="text-xs text-slate-500">Volume processed across different mediums</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {r.paymentMethodBreakdown.map((pm) => {
                const Icon = getPaymentIcon(pm.method);
                return (
                  <div
                    key={pm.method}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{pm.method}</span>
                        <span className="text-[11px] text-slate-400">{pm.count} transactions</span>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-slate-900">
                      {formatAmount(pm.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
