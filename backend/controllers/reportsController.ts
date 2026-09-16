import { Response } from 'express';
import { db } from '../config/db.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export const getReportsSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { startDate, endDate, range } = req.query;

    let filterStart: Date | null = null;
    let filterEnd: Date | null = null;
    const now = new Date();

    if (range) {
      if (range === 'this_month') {
        filterStart = new Date(now.getFullYear(), now.getMonth(), 1);
        filterEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      } else if (range === 'last_month') {
        filterStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        filterEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      } else if (range === 'last_3_months') {
        filterStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        filterEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      } else if (range === 'this_year') {
        filterStart = new Date(now.getFullYear(), 0, 1);
        filterEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      }
    } else if (startDate || endDate) {
      if (startDate) filterStart = new Date(startDate as string);
      if (endDate) {
        filterEnd = new Date(endDate as string);
        filterEnd.setHours(23, 59, 59, 999);
      }
    }

    const allUserTx = db.findTransactions(userId);

    const filteredTx = allUserTx.filter((t) => {
      const txDate = new Date(t.date).getTime();
      if (filterStart && txDate < filterStart.getTime()) return false;
      if (filterEnd && txDate > filterEnd.getTime()) return false;
      return true;
    });

    let totalIncome = 0;
    let totalExpenses = 0;

    const categoryMap: Record<string, { amount: number; count: number; type: 'income' | 'expense' }> = {};
    const paymentMap: Record<string, { amount: number; count: number }> = {};

    filteredTx.forEach((tx) => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpenses += tx.amount;
      }

      // Category breakdown
      if (!categoryMap[tx.category]) {
        categoryMap[tx.category] = { amount: 0, count: 0, type: tx.type };
      }
      categoryMap[tx.category].amount += tx.amount;
      categoryMap[tx.category].count += 1;

      // Payment method breakdown
      if (!paymentMap[tx.paymentMethod]) {
        paymentMap[tx.paymentMethod] = { amount: 0, count: 0 };
      }
      paymentMap[tx.paymentMethod].amount += tx.amount;
      paymentMap[tx.paymentMethod].count += 1;
    });

    totalIncome = Math.round(totalIncome * 100) / 100;
    totalExpenses = Math.round(totalExpenses * 100) / 100;
    const savings = Math.round((totalIncome - totalExpenses) * 100) / 100;
    const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

    // Category breakdown list
    const expenseCategoryBreakdown = Object.entries(categoryMap)
      .filter(([_, data]) => data.type === 'expense')
      .map(([category, data]) => ({
        category,
        amount: Math.round(data.amount * 100) / 100,
        count: data.count,
        percentage: totalExpenses > 0 ? Math.round((data.amount / totalExpenses) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const incomeCategoryBreakdown = Object.entries(categoryMap)
      .filter(([_, data]) => data.type === 'income')
      .map(([category, data]) => ({
        category,
        amount: Math.round(data.amount * 100) / 100,
        count: data.count,
        percentage: totalIncome > 0 ? Math.round((data.amount / totalIncome) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const paymentMethodBreakdown = Object.entries(paymentMap)
      .map(([method, data]) => ({
        method,
        amount: Math.round(data.amount * 100) / 100,
        count: data.count,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Monthly income vs expense breakdown over the filtered period or past 12 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyDataMap: Record<string, { income: number; expense: number; label: string; year: number; month: number }> = {};

    filteredTx.forEach((tx) => {
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (!monthlyDataMap[key]) {
        monthlyDataMap[key] = {
          label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
          year: d.getFullYear(),
          month: d.getMonth() + 1,
          income: 0,
          expense: 0,
        };
      }
      if (tx.type === 'income') {
        monthlyDataMap[key].income += tx.amount;
      } else {
        monthlyDataMap[key].expense += tx.amount;
      }
    });

    const monthlyTrend = Object.values(monthlyDataMap)
      .sort((a, b) => a.year - b.year || a.month - b.month)
      .map((item) => ({
        name: item.label,
        income: Math.round(item.income * 100) / 100,
        expense: Math.round(item.expense * 100) / 100,
        savings: Math.round((item.income - item.expense) * 100) / 100,
      }));

    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        savings,
        savingsRate,
        transactionCount: filteredTx.length,
        expenseCategoryBreakdown,
        incomeCategoryBreakdown,
        paymentMethodBreakdown,
        monthlyTrend,
        startDate: filterStart ? filterStart.toISOString() : null,
        endDate: filterEnd ? filterEnd.toISOString() : null,
      },
    });
  } catch (error) {
    console.error('Error generating reports summary:', error);
    res.status(500).json({ success: false, message: 'Failed to generate reports.' });
  }
};
