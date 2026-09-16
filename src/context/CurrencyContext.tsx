import React, { createContext, useContext, useState, useEffect } from 'react';
import { CurrencyConfig } from '../types/index.ts';

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
  { code: 'INR', symbol: '₹', label: 'INR (₹)' },
  { code: 'CAD', symbol: 'CA$', label: 'CAD (CA$)' },
  { code: 'AUD', symbol: 'A$', label: 'AUD (A$)' },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥)' },
];

interface CurrencyContextValue {
  currency: CurrencyConfig;
  setCurrencyCode: (code: string) => void;
  formatAmount: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<CurrencyConfig>(() => {
    const saved = localStorage.getItem('preferred_currency');
    const match = SUPPORTED_CURRENCIES.find((c) => c.code === saved);
    return match || SUPPORTED_CURRENCIES[0];
  });

  useEffect(() => {
    localStorage.setItem('preferred_currency', currency.code);
  }, [currency]);

  const setCurrencyCode = (code: string) => {
    const match = SUPPORTED_CURRENCIES.find((c) => c.code === code);
    if (match) {
      setCurrency(match);
    }
  };

  const formatAmount = (amount: number): string => {
    const isNegative = amount < 0;
    const absVal = Math.abs(amount);
    const formattedNum = absVal.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${isNegative ? '-' : ''}${currency.symbol}${formattedNum}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrencyCode, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextValue => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
