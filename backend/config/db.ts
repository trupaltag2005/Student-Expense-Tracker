import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserDocument {
  _id: string;
  name: string;
  email: string;
  password: string; // bcrypt hashed
  createdAt: string;
  updatedAt: string;
}

export interface TransactionDocument {
  _id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  paymentMethod: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetDocument {
  _id: string;
  userId: string;
  month: number; // 1 - 12
  year: number;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

interface DatabaseSchema {
  users: UserDocument[];
  transactions: TransactionDocument[];
  budgets: BudgetDocument[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'expense_tracker_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function generateObjectId(): string {
  // Generate 24-char hex string identical to MongoDB ObjectId
  return crypto.randomBytes(12).toString('hex');
}

class DocumentDatabase {
  private data: DatabaseSchema = {
    users: [],
    transactions: [],
    budgets: [],
  };

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.users) this.data.users = [];
        if (!this.data.transactions) this.data.transactions = [];
        if (!this.data.budgets) this.data.budgets = [];
      } else {
        this.seedInitialData();
        this.save();
      }
    } catch (err) {
      console.error('Error loading database file, initializing fresh database:', err);
      this.data = { users: [], transactions: [], budgets: [] };
      this.seedInitialData();
      this.save();
    }
  }

  public save(): void {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to persist database to file:', err);
    }
  }

  private seedInitialData(): void {
    // We will seed a demo user with realistic transactions for quick testing
    // Password for demo user: "DemoUser123!"
    // bcrypt hash for "DemoUser123!" with cost 10:
    const demoPasswordHash = '$2a$10$7zB3cWw0Zvh/9d67x4O2A.Ue0r3pYkG4m2b8g6Lz1n6f7q.8u0vWa';
    const demoUserId = '660000000000000000000001';
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const demoUser: UserDocument = {
      _id: demoUserId,
      name: 'Alex Morgan',
      email: 'demo@expensetracker.com',
      password: demoPasswordHash,
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.users.push(demoUser);

    // Seed budgets for past and current months
    this.data.budgets.push({
      _id: generateObjectId(),
      userId: demoUserId,
      month: currentMonth,
      year: currentYear,
      amount: 4000,
      createdAt: new Date(currentYear, currentMonth - 1, 1).toISOString(),
      updatedAt: new Date(currentYear, currentMonth - 1, 1).toISOString(),
    });

    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    this.data.budgets.push({
      _id: generateObjectId(),
      userId: demoUserId,
      month: prevMonth,
      year: prevYear,
      amount: 3800,
      createdAt: new Date(prevYear, prevMonth - 1, 1).toISOString(),
      updatedAt: new Date(prevYear, prevMonth - 1, 1).toISOString(),
    });

    // Helper to format ISO date
    const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();

    const sampleTransactions: Omit<TransactionDocument, '_id'>[] = [
      {
        userId: demoUserId,
        type: 'income',
        amount: 5500,
        category: 'Salary',
        date: d(1),
        paymentMethod: 'Bank Transfer',
        note: 'Monthly tech salary deposit',
        createdAt: d(1),
        updatedAt: d(1),
      },
      {
        userId: demoUserId,
        type: 'income',
        amount: 850,
        category: 'Freelance',
        date: d(4),
        paymentMethod: 'UPI / Digital Wallet',
        note: 'UI Design consultancy project',
        createdAt: d(4),
        updatedAt: d(4),
      },
      {
        userId: demoUserId,
        type: 'expense',
        amount: 1200,
        category: 'Bills',
        date: d(2),
        paymentMethod: 'Bank Transfer',
        note: 'Apartment rent & maintenance',
        createdAt: d(2),
        updatedAt: d(2),
      },
      {
        userId: demoUserId,
        type: 'expense',
        amount: 145.5,
        category: 'Food',
        date: d(3),
        paymentMethod: 'Credit Card',
        note: 'Weekly organic grocery market',
        createdAt: d(3),
        updatedAt: d(3),
      },
      {
        userId: demoUserId,
        type: 'expense',
        amount: 68.2,
        category: 'Entertainment',
        date: d(5),
        paymentMethod: 'Credit Card',
        note: 'Cinema tickets and snacks',
        createdAt: d(5),
        updatedAt: d(5),
      },
      {
        userId: demoUserId,
        type: 'expense',
        amount: 45.0,
        category: 'Travel',
        date: d(6),
        paymentMethod: 'Debit Card',
        note: 'Metro card refill & cab ride',
        createdAt: d(6),
        updatedAt: d(6),
      },
      {
        userId: demoUserId,
        type: 'expense',
        amount: 89.99,
        category: 'Shopping',
        date: d(8),
        paymentMethod: 'Credit Card',
        note: 'Ergonomic mouse and desk pad',
        createdAt: d(8),
        updatedAt: d(8),
      },
      {
        userId: demoUserId,
        type: 'expense',
        amount: 35.0,
        category: 'Bills',
        date: d(10),
        paymentMethod: 'Debit Card',
        note: 'High-speed internet bill',
        createdAt: d(10),
        updatedAt: d(10),
      },
      {
        userId: demoUserId,
        type: 'expense',
        amount: 120.0,
        category: 'Health',
        date: d(12),
        paymentMethod: 'Debit Card',
        note: 'Annual dental checkup & cleaning',
        createdAt: d(12),
        updatedAt: d(12),
      },
      {
        userId: demoUserId,
        type: 'expense',
        amount: 49.0,
        category: 'Education',
        date: d(15),
        paymentMethod: 'Credit Card',
        note: 'Cloud architecture certification course',
        createdAt: d(15),
        updatedAt: d(15),
      },
      // Previous month sample records
      {
        userId: demoUserId,
        type: 'income',
        amount: 5500,
        category: 'Salary',
        date: d(33),
        paymentMethod: 'Bank Transfer',
        note: 'Prior month salary payment',
        createdAt: d(33),
        updatedAt: d(33),
      },
      {
        userId: demoUserId,
        type: 'expense',
        amount: 1200,
        category: 'Bills',
        date: d(32),
        paymentMethod: 'Bank Transfer',
        note: 'Rent payment',
        createdAt: d(32),
        updatedAt: d(32),
      },
      {
        userId: demoUserId,
        type: 'expense',
        amount: 380,
        category: 'Food',
        date: d(35),
        paymentMethod: 'Credit Card',
        note: 'Grocery store bulk shopping',
        createdAt: d(35),
        updatedAt: d(35),
      },
      {
        userId: demoUserId,
        type: 'expense',
        amount: 220,
        category: 'Shopping',
        date: d(40),
        paymentMethod: 'Debit Card',
        note: 'Spring seasonal apparel',
        createdAt: d(40),
        updatedAt: d(40),
      },
    ];

    sampleTransactions.forEach((tx) => {
      this.data.transactions.push({
        _id: generateObjectId(),
        ...tx,
      });
    });
  }

  // --- User Collection Methods ---
  public findUserById(id: string): UserDocument | undefined {
    return this.data.users.find((u) => u._id === id);
  }

  public findUserByEmail(email: string): UserDocument | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(userData: Omit<UserDocument, '_id' | 'createdAt' | 'updatedAt'>): UserDocument {
    const now = new Date().toISOString();
    const newUser: UserDocument = {
      _id: generateObjectId(),
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      password: userData.password,
      createdAt: now,
      updatedAt: now,
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<Pick<UserDocument, 'name' | 'email' | 'password'>>): UserDocument | undefined {
    const user = this.findUserById(id);
    if (!user) return undefined;

    if (updates.name !== undefined) user.name = updates.name.trim();
    if (updates.email !== undefined) user.email = updates.email.toLowerCase().trim();
    if (updates.password !== undefined) user.password = updates.password;
    user.updatedAt = new Date().toISOString();

    this.save();
    return user;
  }

  public deleteUser(id: string): boolean {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter((u) => u._id !== id);
    // Also delete cascade: all transactions and budgets for this user
    this.data.transactions = this.data.transactions.filter((t) => t.userId !== id);
    this.data.budgets = this.data.budgets.filter((b) => b.userId !== id);
    this.save();
    return this.data.users.length < initialLen;
  }

  // --- Transaction Collection Methods ---
  public findTransactions(
    userId: string,
    filters?: {
      type?: 'income' | 'expense';
      category?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
      sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest';
    }
  ): TransactionDocument[] {
    let result = this.data.transactions.filter((t) => t.userId === userId);

    if (filters?.type) {
      result = result.filter((t) => t.type === filters.type);
    }

    if (filters?.category && filters.category !== 'All') {
      result = result.filter((t) => t.category.toLowerCase() === filters.category!.toLowerCase());
    }

    if (filters?.startDate) {
      const start = new Date(filters.startDate).getTime();
      result = result.filter((t) => new Date(t.date).getTime() >= start);
    }

    if (filters?.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((t) => new Date(t.date).getTime() <= end.getTime());
    }

    if (filters?.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.note.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.paymentMethod.toLowerCase().includes(q)
      );
    }

    // Sorting
    const sort = filters?.sortBy || 'newest';
    result.sort((a, b) => {
      if (sort === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sort === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sort === 'highest') return b.amount - a.amount;
      if (sort === 'lowest') return a.amount - b.amount;
      return 0;
    });

    return result;
  }

  public findTransactionById(id: string, userId: string): TransactionDocument | undefined {
    return this.data.transactions.find((t) => t._id === id && t.userId === userId);
  }

  public createTransaction(
    data: Omit<TransactionDocument, '_id' | 'createdAt' | 'updatedAt'>
  ): TransactionDocument {
    const now = new Date().toISOString();
    const newTx: TransactionDocument = {
      _id: generateObjectId(),
      userId: data.userId,
      type: data.type,
      amount: Number(data.amount),
      category: data.category,
      date: data.date || now,
      paymentMethod: data.paymentMethod || 'Cash',
      note: data.note ? data.note.trim() : '',
      createdAt: now,
      updatedAt: now,
    };
    this.data.transactions.push(newTx);
    this.save();
    return newTx;
  }

  public updateTransaction(
    id: string,
    userId: string,
    updates: Partial<Omit<TransactionDocument, '_id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): TransactionDocument | undefined {
    const tx = this.findTransactionById(id, userId);
    if (!tx) return undefined;

    if (updates.type !== undefined) tx.type = updates.type;
    if (updates.amount !== undefined) tx.amount = Number(updates.amount);
    if (updates.category !== undefined) tx.category = updates.category;
    if (updates.date !== undefined) tx.date = updates.date;
    if (updates.paymentMethod !== undefined) tx.paymentMethod = updates.paymentMethod;
    if (updates.note !== undefined) tx.note = updates.note.trim();
    tx.updatedAt = new Date().toISOString();

    this.save();
    return tx;
  }

  public deleteTransaction(id: string, userId: string): boolean {
    const initialLen = this.data.transactions.length;
    this.data.transactions = this.data.transactions.filter((t) => !(t._id === id && t.userId === userId));
    this.save();
    return this.data.transactions.length < initialLen;
  }

  // --- Budget Collection Methods ---
  public findBudget(userId: string, month: number, year: number): BudgetDocument | undefined {
    return this.data.budgets.find(
      (b) => b.userId === userId && b.month === month && b.year === year
    );
  }

  public setBudget(userId: string, month: number, year: number, amount: number): BudgetDocument {
    const now = new Date().toISOString();
    const existing = this.findBudget(userId, month, year);

    if (existing) {
      existing.amount = Number(amount);
      existing.updatedAt = now;
      this.save();
      return existing;
    }

    const newBudget: BudgetDocument = {
      _id: generateObjectId(),
      userId,
      month,
      year,
      amount: Number(amount),
      createdAt: now,
      updatedAt: now,
    };
    this.data.budgets.push(newBudget);
    this.save();
    return newBudget;
  }

  public updateBudget(id: string, userId: string, amount: number): BudgetDocument | undefined {
    const budget = this.data.budgets.find((b) => b._id === id && b.userId === userId);
    if (!budget) return undefined;
    budget.amount = Number(amount);
    budget.updatedAt = new Date().toISOString();
    this.save();
    return budget;
  }

  public getUserBudgets(userId: string): BudgetDocument[] {
    return this.data.budgets
      .filter((b) => b.userId === userId)
      .sort((a, b) => b.year - a.year || b.month - a.month);
  }
}

export const db = new DocumentDatabase();
