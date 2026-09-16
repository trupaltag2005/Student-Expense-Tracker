export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'income' | 'expense';

export type Category =
  | 'Food'
  | 'Travel'
  | 'Shopping'
  | 'Bills'
  | 'Education'
  | 'Health'
  | 'Entertainment'
  | 'Salary'
  | 'Freelance'
  | 'Other';

export type PaymentMethod =
  | 'Cash'
  | 'Credit Card'
  | 'Debit Card'
  | 'Bank Transfer'
  | 'UPI / Digital Wallet'
  | 'Other';

export interface Transaction {
  _id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: Category | string;
  date: string;
  paymentMethod: PaymentMethod | string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  _id: string;
  userId: string;
  month: number;
  year: number;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetStatus {
  budget: Budget | null;
  month: number;
  year: number;
  budgetAmount: number;
  monthlyExpenses: number;
  remainingBudget: number;
  percentSpent: number;
  isExceeded: boolean;
  isWarning: boolean;
}

export interface BudgetHistoryItem {
  _id: string;
  month: number;
  year: number;
  amount: number;
  monthlyExpenses: number;
  remaining: number;
  percentSpent: number;
  isExceeded: boolean;
}

export interface DashboardSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  monthlyBudget: number;
  currentMonthExpenses: number;
  currentMonthIncome: number;
  remainingBudget: number;
  percentBudgetUsed: number;
  recentTransactions: Transaction[];
  expenseOverviewChart: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  monthlySpendingChart: Array<{
    name: string;
    month: number;
    year: number;
    income: number;
    expense: number;
    net: number;
  }>;
}

export interface ReportsSummary {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsRate: number;
  transactionCount: number;
  expenseCategoryBreakdown: Array<{
    category: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
  incomeCategoryBreakdown: Array<{
    category: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
  paymentMethodBreakdown: Array<{
    method: string;
    amount: number;
    count: number;
  }>;
  monthlyTrend: Array<{
    name: string;
    income: number;
    expense: number;
    savings: number;
  }>;
  startDate: string | null;
  endDate: string | null;
}

export type PageView = 'dashboard' | 'transactions' | 'budget' | 'reports' | 'profile' | 'settings';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  label: string;
}
