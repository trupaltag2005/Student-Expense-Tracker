import React, { useState } from 'react';
import { useCurrency } from '../../context/CurrencyContext.tsx';
import { AlertTriangle, CheckCircle, Flame, Edit3, DollarSign } from 'lucide-react';

interface BudgetProgressProps {
  budgetAmount: number;
  monthlyExpenses: number;
  remainingBudget: number;
  percentSpent: number;
  isExceeded: boolean;
  isWarning: boolean;
  onUpdateBudget: (newAmount: number) => Promise<void>;
  monthName?: string;
  year?: number;
}

export const BudgetProgress: React.FC<BudgetProgressProps> = ({
  budgetAmount,
  monthlyExpenses,
  remainingBudget,
  percentSpent,
  isExceeded,
  isWarning,
  onUpdateBudget,
  monthName = 'This Month',
  year = new Date().getFullYear(),
}) => {
  const { formatAmount } = useCurrency();
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(budgetAmount > 0 ? budgetAmount.toString() : '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inputValue);
    if (isNaN(val) || val <= 0) return;

    setIsSaving(true);
    await onUpdateBudget(val);
    setIsSaving(false);
    setIsEditing(false);
  };

  // Determine progress bar fill percentage (capped visually at 100% for bar, but label shows real %)
  const visualPercent = Math.min(percentSpent, 100);

  // Status color styling
  let barColor = 'bg-emerald-500';
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let statusText = 'On Track';

  if (isExceeded) {
    barColor = 'bg-rose-600';
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
    statusText = 'Budget Exceeded';
  } else if (isWarning) {
    barColor = 'bg-amber-500';
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    statusText = 'Approaching Limit';
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header with Title & Edit Trigger */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {monthName} {year} Target
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <h3 className="text-xl font-extrabold text-slate-900">
              Budget: {formatAmount(budgetAmount)}
            </h3>
            {!isEditing && (
              <button
                onClick={() => {
                  setInputValue(budgetAmount > 0 ? budgetAmount.toString() : '');
                  setIsEditing(true);
                }}
                id="edit-budget-amount-btn"
                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Edit budget amount"
                aria-label="Edit budget amount"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badgeColor}`}>
          {statusText} ({percentSpent}%)
        </span>
      </div>

      {/* Edit Budget Input Row */}
      {isEditing && (
        <form onSubmit={handleSave} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="relative flex-1">
            <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="number"
              min="1"
              step="any"
              required
              id="budget-input-field"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter monthly budget..."
              className="w-full pl-9 pr-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={isSaving}
            id="save-budget-btn"
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-3 py-1.5 text-slate-600 hover:bg-slate-200/60 rounded-lg text-xs font-medium transition-colors"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold text-slate-600">
          <span>Spent: {formatAmount(monthlyExpenses)}</span>
          <span className={remainingBudget < 0 ? 'text-rose-600 font-bold' : 'text-slate-600'}>
            Remaining: {formatAmount(remainingBudget)}
          </span>
        </div>
        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${visualPercent}%` }}
          />
        </div>
      </div>

      {/* Dynamic Status Callout Alert Banner */}
      {isExceeded && (
        <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium">
          <Flame className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">You have exceeded your monthly limit!</strong>
            You have spent {formatAmount(Math.abs(remainingBudget))} above your configured budget.
            Consider restricting discretionary purchases for the rest of the month.
          </div>
        </div>
      )}

      {isWarning && !isExceeded && (
        <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Heads up: Spending is at {percentSpent}%</strong>
            You only have {formatAmount(remainingBudget)} left for the remainder of this month.
          </div>
        </div>
      )}

      {!isWarning && !isExceeded && budgetAmount > 0 && (
        <div className="flex items-start gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Healthy budget trajectory</strong>
            You have used {percentSpent}% of your limit with {formatAmount(remainingBudget)} left to spend.
          </div>
        </div>
      )}

      {budgetAmount === 0 && (
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-xs font-medium flex items-center justify-between">
          <span>No budget has been set for this month yet.</span>
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
          >
            Set Budget
          </button>
        </div>
      )}
    </div>
  );
};
