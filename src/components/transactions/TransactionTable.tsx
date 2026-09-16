import React from 'react';
import { Transaction } from '../../types/index.ts';
import { CATEGORIES_META, getPaymentIcon } from '../../utils/categories.ts';
import { useCurrency } from '../../context/CurrencyContext.tsx';
import { Edit2, Trash2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  isLoading?: boolean;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const { formatAmount } = useCurrency();

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  if (transactions.length === 0 && !isLoading) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 text-slate-500">
        <p className="text-sm font-medium">No transactions found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/80">
            <tr>
              <th scope="col" className="px-5 py-3.5">Type & Category</th>
              <th scope="col" className="px-5 py-3.5">Description</th>
              <th scope="col" className="px-5 py-3.5">Date</th>
              <th scope="col" className="px-5 py-3.5">Payment Method</th>
              <th scope="col" className="px-5 py-3.5 text-right">Amount</th>
              <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {transactions.map((tx) => {
              const meta = CATEGORIES_META[tx.category] || CATEGORIES_META['Other'];
              const CategoryIcon = meta.icon;
              const isIncome = tx.type === 'income';
              const PaymentIcon = getPaymentIcon(tx.paymentMethod);

              return (
                <tr
                  key={tx._id}
                  id={`tx-row-${tx._id}`}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {/* Category & Type */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${meta.bgColor}`}>
                        <CategoryIcon className={`w-4 h-4 ${meta.color}`} />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{tx.category}</span>
                        <div className="flex items-center gap-1 text-[11px]">
                          {isIncome ? (
                            <span className="text-emerald-600 flex items-center font-medium">
                              <ArrowUpRight className="w-3 h-3" /> Income
                            </span>
                          ) : (
                            <span className="text-rose-600 flex items-center font-medium">
                              <ArrowDownLeft className="w-3 h-3" /> Expense
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Note / Description */}
                  <td className="px-5 py-3.5 text-slate-700 max-w-xs truncate">
                    {tx.note || <span className="text-slate-400 italic">No notes</span>}
                  </td>

                  {/* Date */}
                  <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">
                    {formatDate(tx.date)}
                  </td>

                  {/* Payment Method */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/60">
                      <PaymentIcon className="w-3 h-3 text-slate-500" />
                      {tx.paymentMethod}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="px-5 py-3.5 whitespace-nowrap text-right font-extrabold text-sm">
                    <span className={isIncome ? 'text-emerald-600' : 'text-slate-900'}>
                      {isIncome ? '+' : '-'}
                      {formatAmount(tx.amount)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEdit(tx)}
                        id={`edit-tx-btn-${tx._id}`}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit transaction"
                        aria-label="Edit transaction"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(tx)}
                        id={`delete-tx-btn-${tx._id}`}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete transaction"
                        aria-label="Delete transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-100">
        {transactions.map((tx) => {
          const meta = CATEGORIES_META[tx.category] || CATEGORIES_META['Other'];
          const CategoryIcon = meta.icon;
          const isIncome = tx.type === 'income';

          return (
            <div key={tx._id} id={`tx-card-${tx._id}`} className="p-4 space-y-2.5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${meta.bgColor}`}>
                    <CategoryIcon className={`w-5 h-5 ${meta.color}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{tx.category}</h4>
                    <p className="text-xs text-slate-500">{formatDate(tx.date)}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-base font-extrabold block ${
                      isIncome ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatAmount(tx.amount)}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {tx.paymentMethod}
                  </span>
                </div>
              </div>

              {tx.note && <p className="text-xs text-slate-600 pl-1">{tx.note}</p>}

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-50">
                <button
                  onClick={() => onEdit(tx)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => onDelete(tx)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
