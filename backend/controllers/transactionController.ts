import { Response } from 'express';
import { db } from '../config/db.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { UserCategories, PaymentMethods } from '../models/User.ts';

export const getTransactions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { type, category, startDate, endDate, search, sortBy } = req.query;

    const transactions = db.findTransactions(userId, {
      type: type as 'income' | 'expense' | undefined,
      category: category as string | undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      search: search as string | undefined,
      sortBy: sortBy as 'newest' | 'oldest' | 'highest' | 'lowest' | undefined,
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch transactions.' });
  }
};

export const createTransaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { type, amount, category, date, paymentMethod, note } = req.body;

    // Validation
    if (!type || (type !== 'income' && type !== 'expense')) {
      res.status(400).json({ success: false, message: 'Transaction type must be either "income" or "expense".' });
      return;
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({ success: false, message: 'Amount must be a valid number greater than 0.' });
      return;
    }

    if (!category || typeof category !== 'string' || !category.trim()) {
      res.status(400).json({ success: false, message: 'Category is required.' });
      return;
    }

    const txDate = date ? new Date(date) : new Date();
    if (isNaN(txDate.getTime())) {
      res.status(400).json({ success: false, message: 'A valid date is required.' });
      return;
    }

    const transaction = db.createTransaction({
      userId,
      type,
      amount: Math.round(parsedAmount * 100) / 100, // 2 decimal precision
      category: category.trim(),
      date: txDate.toISOString(),
      paymentMethod: paymentMethod?.trim() || 'Cash',
      note: note?.trim() || '',
    });

    res.status(201).json({
      success: true,
      message: 'Transaction added successfully.',
      transaction,
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ success: false, message: 'Failed to create transaction.' });
  }
};

export const updateTransaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { id } = req.params;
    const { type, amount, category, date, paymentMethod, note } = req.body;

    const existing = db.findTransactionById(id, userId);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Transaction not found or access denied.' });
      return;
    }

    const updates: Record<string, any> = {};

    if (type !== undefined) {
      if (type !== 'income' && type !== 'expense') {
        res.status(400).json({ success: false, message: 'Type must be "income" or "expense".' });
        return;
      }
      updates.type = type;
    }

    if (amount !== undefined) {
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        res.status(400).json({ success: false, message: 'Amount must be greater than 0.' });
        return;
      }
      updates.amount = Math.round(parsedAmount * 100) / 100;
    }

    if (category !== undefined) {
      if (!category.trim()) {
        res.status(400).json({ success: false, message: 'Category cannot be empty.' });
        return;
      }
      updates.category = category.trim();
    }

    if (date !== undefined) {
      const txDate = new Date(date);
      if (isNaN(txDate.getTime())) {
        res.status(400).json({ success: false, message: 'Valid date is required.' });
        return;
      }
      updates.date = txDate.toISOString();
    }

    if (paymentMethod !== undefined) {
      updates.paymentMethod = paymentMethod.trim();
    }

    if (note !== undefined) {
      updates.note = note.trim();
    }

    const updated = db.updateTransaction(id, userId, updates);
    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully.',
      transaction: updated,
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ success: false, message: 'Failed to update transaction.' });
  }
};

export const deleteTransaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { id } = req.params;
    const existing = db.findTransactionById(id, userId);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Transaction not found or access denied.' });
      return;
    }

    db.deleteTransaction(id, userId);
    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ success: false, message: 'Failed to delete transaction.' });
  }
};
