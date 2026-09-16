import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  id: string;
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'balance' | 'income' | 'expense' | 'budget';
  badgeText?: string;
  badgeType?: 'positive' | 'negative' | 'neutral' | 'warning';
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'balance',
  badgeText,
  badgeType = 'neutral',
}) => {
  const variantStyles = {
    balance: {
      bg: 'bg-white',
      border: 'border-slate-200/80',
      iconBg: 'bg-indigo-50 text-indigo-600',
      valueColor: 'text-slate-900',
    },
    income: {
      bg: 'bg-white',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-50 text-emerald-600',
      valueColor: 'text-emerald-600',
    },
    expense: {
      bg: 'bg-white',
      border: 'border-rose-100',
      iconBg: 'bg-rose-50 text-rose-600',
      valueColor: 'text-rose-600',
    },
    budget: {
      bg: 'bg-white',
      border: 'border-slate-200/80',
      iconBg: 'bg-blue-50 text-blue-600',
      valueColor: 'text-slate-900',
    },
  }[variant];

  const badgeStyles = {
    positive: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    negative: 'bg-rose-50 text-rose-700 border-rose-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  }[badgeType];

  return (
    <div
      id={id}
      className={`relative p-5 rounded-2xl border ${variantStyles.border} ${variantStyles.bg} shadow-sm hover:shadow-md transition-all duration-200`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`w-10 h-10 rounded-xl ${variantStyles.iconBg} flex items-center justify-center shadow-xs`}>
          <Icon className="w-5 h-5 stroke-[2.2]" />
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <h3 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${variantStyles.valueColor}`}>
          {value}
        </h3>
      </div>

      <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-100">
        <span className="text-slate-500 font-medium truncate">{subtitle || 'Updated in real-time'}</span>
        {badgeText && (
          <span className={`px-2 py-0.5 rounded-full font-semibold border text-[11px] shrink-0 ${badgeStyles}`}>
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
};
