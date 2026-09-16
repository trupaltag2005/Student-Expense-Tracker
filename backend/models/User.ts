import { UserDocument } from '../config/db.ts';

export type IUser = UserDocument;

export const UserCategories = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Education',
  'Health',
  'Entertainment',
  'Salary',
  'Freelance',
  'Other',
] as const;

export type CategoryType = (typeof UserCategories)[number];

export const PaymentMethods = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'UPI / Digital Wallet',
  'Other',
] as const;

export type PaymentMethodType = (typeof PaymentMethods)[number];
