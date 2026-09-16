import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.tsx';
import { Transaction, TransactionType } from '../../types/index.ts';
import { CATEGORIES_META, PAYMENT_METHODS } from '../../utils/categories.ts';
import { useCurrency } from '../../context/CurrencyContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import api from '../../services/api.ts';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedTransaction: Transaction, isEdit: boolean) => void;
  initialData?: Transaction | null;
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const { currency } = useCurrency();
  const { showToast } = useToast();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Food');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
      setDate(new Date(initialData.date).toISOString().split('T')[0]);
      setPaymentMethod(initialData.paymentMethod);
      setNote(initialData.note || '');
    } else {
      // Default reset
      setType('expense');
      setAmount('');
      setCategory('Food');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('Cash');
      setNote('');
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  // When type changes, switch default category if not matching type
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income' && (category === 'Food' || category === 'Bills' || category === 'Shopping')) {
      setCategory('Salary');
    } else if (newType === 'expense' && (category === 'Salary' || category === 'Freelance')) {
      setCategory('Food');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0.');
      return;
    }

    if (!category.trim()) {
      setErrorMsg('Please select a category.');
      return;
    }

    if (!date) {
      setErrorMsg('Please select a date.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        type,
        amount: parsedAmount,
        category,
        date: new Date(date).toISOString(),
        paymentMethod,
        note: note.trim(),
      };

      if (initialData?._id) {
        // Edit existing transaction
        const res = await api.put(`/transactions/${initialData._id}`, payload);
        if (res.data.success) {
          showToast('Transaction updated successfully!', 'success');
          onSuccess(res.data.transaction, true);
          onClose();
        }
      } else {
        // Create new transaction
        const res = await api.post('/transactions', payload);
        if (res.data.success) {
          showToast('Transaction recorded successfully!', 'success');
          onSuccess(res.data.transaction, false);
          onClose();
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save transaction. Please try again.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter categories relevant for selected type
  const availableCategories = Object.keys(CATEGORIES_META).filter((catKey) => {
    const meta = CATEGORIES_META[catKey];
    return meta.type === 'both' || meta.type === type;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Transaction' : 'Record Transaction'}
      subtitle={initialData ? 'Update transaction details' : 'Log your income or expense entry'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* Type Selector Tabs */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Transaction Type *
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              id="tx-type-expense-btn"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-xs transition-all ${
                type === 'expense'
                  ? 'bg-white text-rose-600 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 text-rose-500" />
              <span>Expense</span>
            </button>
            <button
              type="button"
              id="tx-type-income-btn"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-xs transition-all ${
                type === 'income'
                  ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              <span>Income</span>
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label htmlFor="tx-amount" className="block text-xs font-semibold text-slate-700 mb-1">
            Amount ({currency.code}) *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold text-base">
              {currency.symbol}
            </span>
            <input
              type="number"
              id="tx-amount"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 font-semibold text-base transition-all"
            />
          </div>
        </div>

        {/* Category Grid Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category *</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-44 overflow-y-auto p-1 border border-slate-200 rounded-xl">
            {availableCategories.map((catKey) => {
              const meta = CATEGORIES_META[catKey];
              const Icon = meta.icon;
              const isSelected = category === catKey;
              return (
                <button
                  type="button"
                  key={catKey}
                  onClick={() => setCategory(catKey)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-bold shadow-xs'
                      : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1 ${meta.bgColor}`}>
                    <Icon className={`w-4 h-4 ${meta.color}`} />
                  </div>
                  <span className="truncate w-full text-center">{catKey}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date & Payment Method row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="tx-date" className="block text-xs font-semibold text-slate-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              id="tx-date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs font-medium text-slate-900"
            />
          </div>

          <div>
            <label htmlFor="tx-payment-method" className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Method *
            </label>
            <select
              id="tx-payment-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs font-medium text-slate-900 bg-white"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description / Note */}
        <div>
          <label htmlFor="tx-note" className="block text-xs font-semibold text-slate-700 mb-1">
            Description / Note
          </label>
          <input
            type="text"
            id="tx-note"
            placeholder="e.g. Organic supermarket run, monthly salary, etc."
            maxLength={120}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs text-slate-900"
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            id="tx-submit-btn"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Update Transaction' : 'Save Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
