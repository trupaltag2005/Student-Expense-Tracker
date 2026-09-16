import { Response } from 'express';
import { db } from '../config/db.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export const getDashboardSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const allTransactions = db.findTransactions(userId);

    // 1. Total Income & Total Expenses across all time
    let totalIncome = 0;
    let totalExpenses = 0;

    allTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else if (tx.type === 'expense') {
        totalExpenses += tx.amount;
      }
    });

    totalIncome = Math.round(totalIncome * 100) / 100;
    totalExpenses = Math.round(totalExpenses * 100) / 100;
    const totalBalance = Math.round((totalIncome - totalExpenses) * 100) / 100;

    // 2. Current Month Stats & Budget
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const currentMonthExpenses = allTransactions
      .filter((t) => {
        if (t.type !== 'expense') return false;
        const d = new Date(t.date);
        return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const currentMonthIncome = allTransactions
      .filter((t) => {
        if (t.type !== 'income') return false;
        const d = new Date(t.date);
        return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const currentBudgetDoc = db.findBudget(userId, currentMonth, currentYear);
    const monthlyBudget = currentBudgetDoc ? currentBudgetDoc.amount : 0;
    const roundedMonthExpenses = Math.round(currentMonthExpenses * 100) / 100;
    const remainingBudget = Math.round((monthlyBudget - roundedMonthExpenses) * 100) / 100;
    const percentBudgetUsed = monthlyBudget > 0 ? Math.round((roundedMonthExpenses / monthlyBudget) * 100) : 0;

    // 3. Recent Transactions (last 6 transactions)
    const recentTransactions = allTransactions.slice(0, 6);

    // 4. Expense Overview Chart (Category-wise for all expenses or current month expenses)
    const categoryTotals: Record<string, number> = {};
    allTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    const expenseOverviewChart = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount: Math.round(amount * 100) / 100,
        percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // 5. Monthly Spending Chart (Last 6 months: income vs expense)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlySpendingChart: Array<{
      name: string;
      month: number;
      year: number;
      income: number;
      expense: number;
      net: number;
    }> = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const label = `${monthNames[m - 1]} ${y === currentYear ? '' : "'" + y.toString().slice(-2)}`.trim();

      const monthTx = allTransactions.filter((t) => {
        const td = new Date(t.date);
        return td.getMonth() + 1 === m && td.getFullYear() === y;
      });

      const inc = monthTx.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const exp = monthTx.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

      monthlySpendingChart.push({
        name: label,
        month: m,
        year: y,
        income: Math.round(inc * 100) / 100,
        expense: Math.round(exp * 100) / 100,
        net: Math.round((inc - exp) * 100) / 100,
      });
    }

    res.status(200).json({
      success: true,
      summary: {
        totalBalance,
        totalIncome,
        totalExpenses,
        monthlyBudget,
        currentMonthExpenses: roundedMonthExpenses,
        currentMonthIncome: Math.round(currentMonthIncome * 100) / 100,
        remainingBudget,
        percentBudgetUsed,
        recentTransactions,
        expenseOverviewChart,
        monthlySpendingChart,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ success: false, message: 'Failed to load dashboard summary.' });
  }
};
