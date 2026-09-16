# Expense Tracker — Full-Stack Personal Finance Web Application

A modern, production-grade personal finance and expense tracking web application built with **React (Vite) + TypeScript + Tailwind CSS** on the frontend, and **Node.js + Express + JWT Authentication + Document/MongoDB Database Engine** on the backend.

Designed for real-world personal finance management, suitable for demonstration, production deployment, or university final-year capstone defense.

---

## Key Highlights & Features

### 1. User Authentication & Authorization
* **Secure Registration & Login**: Validates full name, email format, minimum password length, and password confirmation.
* **Password Encryption**: Employs bcrypt (salt rounds = 10) for secure password hashing.
* **JWT Authentication**: Stateless, encrypted tokens stored securely in client storage and verified on protected backend routes.
* **1-Click Demo Evaluation**: Instant demo login option pre-populated with realistic income, expenses, and budget targets.
* **Strict User Isolation**: All transactions, budgets, and statements are scoped to each authenticated `userId`.

### 2. Live Financial Dashboard
* **Dynamic Totals**: Real-time calculation of **Total Balance** (Total Income − Total Expenses), **Total Income**, and **Total Expenses**.
* **Monthly Budget Indicator**: Tracks current month's target, expenses, remaining runway, and alerts if exceeded.
* **Visual Data Charts**:
  - **Category-wise Donut Chart**: Visual distribution across Food, Travel, Bills, Entertainment, Health, Shopping, Education, etc.
  - **Cash Flow History Chart**: 6-month comparative bar chart contrasting Income vs. Expenses.
* **Recent Activity Feed**: Quick-glance list of recent income and expense logs with instant edit/delete actions.

### 3. Transaction Management (CRUD)
* **Type Categorization**: Supports both *Income* and *Expense* types with color-coded badges and signs.
* **Full Field Tracking**: Amount, Category, Date, Payment Method (Cash, Credit Card, Debit Card, Bank Transfer, UPI/Digital Wallet), and Notes.
* **Comprehensive Search & Filtering**:
  - Search by note, category, or payment method
  - Filter by Type (All / Income / Expense)
  - Filter by Category
  - Filter by Custom Date Range (Start Date – End Date)
  - Sort by Newest, Oldest, Highest, or Lowest amount
* **Safe Deletions**: Deletion requires explicit confirmation dialog and immediately recalculates all totals.
* **Data Portability**: 1-click **Export to CSV** for spreadsheets.

### 4. Monthly Budgeting System
* **Monthly Target Setting**: Set and update monthly budgets for any month and year.
* **Dynamic Progress Bar**: Color-coded trajectory (<80% Green / On Track, 80-100% Amber / Warning, >100% Red / Exceeded).
* **Deficit & Surplus Alerts**: Explicit warning callouts when spending exceeds allocated limits.
* **Historical Performance**: Table tracking adherence to past monthly budgets.

### 5. Deep Analytics & Reports
* **Flexible Time Horizon Filter**: This Month, Last Month, Last 3 Months, This Year, or All Time.
* **Aggregated Insights**: Net savings, Savings Rate (%), Total Inflow, Total Outflow.
* **Channel Distribution**: Spending grouped across payment methods (Cash, Cards, UPI, Bank Transfer).
* **Category Breakdown Matrix**: Detailed breakdown table with item counts, total spend, and percentage share.

### 6. Profile & Custom Settings
* **Display Currency Switcher**: Easily toggle between `$ USD`, `€ EUR`, `£ GBP`, `₹ INR`, `CA$ CAD`, `A$ AUD`, and `¥ JPY`.
* **Password Management**: Update account passwords with current password verification.
* **Full Data Backup**: 1-click export of the entire financial database in JSON format.
* **Danger Zone**: Secure account deletion with password verification and cascade cleanup.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS v4, Lucide React, Recharts, Motion |
| **Backend** | Node.js, Express.js (REST API), TypeScript, tsx |
| **Authentication** | JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`) |
| **Data Engine** | Dual-mode: Built-in atomic JSON Document Store (zero external dependencies required) + MongoDB URI compatibility |
| **HTTP Client** | Axios with request & response interceptors |

---

## Project Structure

```
.
├── backend/
│   ├── config/
│   │   └── db.ts                # Persistent document database engine & schema definition
│   ├── controllers/
│   │   ├── authController.ts        # Registration, Login, Profile & Password management
│   │   ├── transactionController.ts # Transaction CRUD, multi-filtering & sorting
│   │   ├── budgetController.ts      # Budget calculations, targets & history
│   │   ├── dashboardController.ts   # Real-time summaries and chart aggregations
│   │   └── reportsController.ts     # Range-based analytics & breakdowns
│   ├── middleware/
│   │   └── auth.ts                  # Bearer token verification & route protection
│   ├── models/
│   │   ├── User.ts                  # User schema types & category definitions
│   │   ├── Transaction.ts           # Transaction document schema
│   │   └── Budget.ts                # Monthly budget document schema
│   └── routes/
│       ├── authRoutes.ts
│       ├── transactionRoutes.ts
│       ├── budgetRoutes.ts
│       ├── dashboardRoutes.ts
│       └── reportsRoutes.ts
├── src/
│   ├── components/
│   │   ├── budget/
│   │   │   └── BudgetProgress.tsx
│   │   ├── charts/
│   │   │   ├── ExpenseChart.tsx     # Category distribution pie chart (Recharts)
│   │   │   └── MonthlyBarChart.tsx  # Income vs. Expense bar chart (Recharts)
│   │   ├── common/
│   │   │   ├── ConfirmationModal.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Toast.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardCard.tsx
│   │   └── transactions/
│   │       ├── TransactionFormModal.tsx
│   │       └── TransactionTable.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   ├── CurrencyContext.tsx
│   │   └── ToastContext.tsx
│   ├── pages/
│   │   ├── AuthPage.tsx
│   │   ├── BudgetPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── ReportsPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── TransactionsPage.tsx
│   ├── services/
│   │   └── api.ts                   # Configured Axios instance with auth interceptor
│   ├── types/
│   │   └── index.ts                 # TypeScript data contracts & interfaces
│   ├── utils/
│   │   └── categories.ts            # Category metadata, colors, and payment icons
│   ├── App.tsx                      # Root application router & layout orchestrator
│   ├── index.css                    # Tailwind CSS v4 styling
│   └── main.tsx                     # React DOM entry point
├── server.ts                        # Full-stack Express server integrating Vite middleware
├── metadata.json
├── package.json
└── README.md
```

---

## API Reference

### Authentication
* `POST /api/auth/register` — Register a new account (`name`, `email`, `password`, `confirmPassword`)
* `POST /api/auth/login` — Sign in with email and password
* `GET /api/auth/me` — Retrieve current authenticated user profile
* `PUT /api/auth/profile` — Update display name and email address
* `PUT /api/auth/password` — Change password (`currentPassword`, `newPassword`, `confirmPassword`)
* `DELETE /api/auth/account` — Delete account and cascade delete all personal records

### Transactions
* `GET /api/transactions` — Query transactions (filters: `type`, `category`, `startDate`, `endDate`, `search`, `sortBy`)
* `POST /api/transactions` — Create transaction (`type`, `amount`, `category`, `date`, `paymentMethod`, `note`)
* `PUT /api/transactions/:id` — Update an existing transaction
* `DELETE /api/transactions/:id` — Delete a transaction

### Dashboard
* `GET /api/dashboard/summary` — Returns total balance, total income, total expenses, monthly budget, spending chart, category chart, and recent items

### Budget
* `GET /api/budget?month=X&year=Y` — Get budget details and spending status for the specified month
* `POST /api/budget` — Set or update monthly budget target (`month`, `year`, `amount`)
* `GET /api/budget/history` — Retrieve all past monthly budgets and actual spending

### Reports
* `GET /api/reports/summary?range=X` — Generate analytics summary over requested time range

---

## Demo Credentials
(https://expense-tracker-9060.ai.studio/)

For quick evaluation without manual sign-up:
* **Email**: `demo@expensetracker.com`
* **Password**: `DemoUser123!`
* Or simply click the **1-Click Demo** button on the sign-in screen.
