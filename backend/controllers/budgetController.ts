import { Response } from 'express';
import { db } from '../config/db.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export const getBudget = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const now = new Date();
    const month = req.query.month ? parseInt(req.query.month as string, 10) : now.getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year as string, 10) : now.getFullYear();

    const budget = db.findBudget(userId, month, year);

    // Calculate monthly expenses for this specific month & year
    const transactions = db.findTransactions(userId);
    const monthlyExpenses = transactions
      .filter((t) => {
        if (t.type !== 'expense') return false;
        const d = new Date(t.date);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const budgetAmount = budget ? budget.amount : 0;
    const remainingBudget = Math.round((budgetAmount - monthlyExpenses) * 100) / 100;
    const percentSpent = budgetAmount > 0 ? Math.round((monthlyExpenses / budgetAmount) * 100) : 0;

    res.status(200).json({
      success: true,
      budget: budget || null,
      month,
      year,
      budgetAmount,
      monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
      remainingBudget,
      percentSpent,
      isExceeded: budgetAmount > 0 && monthlyExpenses > budgetAmount,
      isWarning: budgetAmount > 0 && percentSpent >= 80 && percentSpent <= 100,
    });
  } catch (error) {
    console.error('Error fetching budget:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch budget.' });
  }
};

export const setBudget = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { month, year, amount } = req.body;

    const parsedMonth = parseInt(month, 10);
    const parsedYear = parseInt(year, 10);
    const parsedAmount = Number(amount);

    if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      res.status(400).json({ success: false, message: 'Month must be between 1 and 12.' });
      return;
    }

    if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
      res.status(400).json({ success: false, message: 'Invalid year.' });
      return;
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({ success: false, message: 'Budget amount must be greater than 0.' });
      return;
    }

    const budget = db.setBudget(
      userId,
      parsedMonth,
      parsedYear,
      Math.round(parsedAmount * 100) / 100
    );

    res.status(200).json({
      success: true,
      message: 'Monthly budget updated successfully.',
      budget,
    });
  } catch (error) {
    console.error('Error saving budget:', error);
    res.status(500).json({ success: false, message: 'Failed to save budget.' });
  }
};

export const updateBudget = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { id } = req.params;
    const { amount } = req.body;

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({ success: false, message: 'Budget amount must be greater than 0.' });
      return;
    }

    const updated = db.updateBudget(id, userId, Math.round(parsedAmount * 100) / 100);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Budget not found or access denied.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully.',
      budget: updated,
    });
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ success: false, message: 'Failed to update budget.' });
  }
};

export const getBudgetHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const budgets = db.getUserBudgets(userId);
    const transactions = db.findTransactions(userId);

    const history = budgets.map((b) => {
      const expenses = transactions
        .filter((t) => {
          if (t.type !== 'expense') return false;
          const d = new Date(t.date);
          return d.getMonth() + 1 === b.month && d.getFullYear() === b.year;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const remaining = Math.round((b.amount - expenses) * 100) / 100;
      const percentSpent = b.amount > 0 ? Math.round((expenses / b.amount) * 100) : 0;

      return {
        _id: b._id,
        month: b.month,
        year: b.year,
        amount: b.amount,
        monthlyExpenses: Math.round(expenses * 100) / 100,
        remaining,
        percentSpent,
        isExceeded: expenses > b.amount,
      };
    });

    res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    console.error('Error fetching budget history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch budget history.' });
  }
};
