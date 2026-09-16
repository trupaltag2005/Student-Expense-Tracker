import React from 'react';
import {
  Utensils,
  Plane,
  ShoppingBag,
  ReceiptText,
  GraduationCap,
  HeartPulse,
  Film,
  Briefcase,
  Laptop,
  HelpCircle,
  CreditCard,
  Banknote,
  Building,
  Smartphone,
  Tag,
} from 'lucide-react';

export interface CategoryMeta {
  name: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  bgColor: string;
  type: 'expense' | 'income' | 'both';
}

export const CATEGORIES_META: Record<string, CategoryMeta> = {
  Food: {
    name: 'Food',
    icon: Utensils,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200',
    type: 'expense',
  },
  Travel: {
    name: 'Travel',
    icon: Plane,
    color: 'text-sky-600',
    bgColor: 'bg-sky-50 border-sky-200',
    type: 'expense',
  },
  Shopping: {
    name: 'Shopping',
    icon: ShoppingBag,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    type: 'expense',
  },
  Bills: {
    name: 'Bills',
    icon: ReceiptText,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50 border-rose-200',
    type: 'expense',
  },
  Education: {
    name: 'Education',
    icon: GraduationCap,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    type: 'expense',
  },
  Health: {
    name: 'Health',
    icon: HeartPulse,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50 border-teal-200',
    type: 'expense',
  },
  Entertainment: {
    name: 'Entertainment',
    icon: Film,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 border-pink-200',
    type: 'expense',
  },
  Salary: {
    name: 'Salary',
    icon: Briefcase,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 border-emerald-200',
    type: 'income',
  },
  Freelance: {
    name: 'Freelance',
    icon: Laptop,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 border-indigo-200',
    type: 'income',
  },
  Other: {
    name: 'Other',
    icon: HelpCircle,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50 border-slate-200',
    type: 'both',
  },
};

export const PAYMENT_METHODS = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'UPI / Digital Wallet',
  'Other',
];

export const getPaymentIcon = (method: string): React.FC<{ className?: string }> => {
  switch (method) {
    case 'Cash':
      return Banknote;
    case 'Credit Card':
    case 'Debit Card':
      return CreditCard;
    case 'Bank Transfer':
      return Building;
    case 'UPI / Digital Wallet':
      return Smartphone;
    default:
      return Tag;
  }
};
