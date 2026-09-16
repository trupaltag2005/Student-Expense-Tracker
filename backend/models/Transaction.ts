import { TransactionDocument } from '../config/db.ts';

export type ITransaction = TransactionDocument;

export interface TransactionFilterQuery {
  type?: 'income' | 'expense';
  category?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest';
}
