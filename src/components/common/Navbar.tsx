import React, { useState } from 'react';
import { Menu, Plus, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { PageView } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCurrency, SUPPORTED_CURRENCIES } from '../../context/CurrencyContext.tsx';

interface NavbarProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  onOpenMobileSidebar: () => void;
  onOpenAddTransaction: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenMobileSidebar,
  onOpenAddTransaction,
}) => {
  const { user, logout } = useAuth();
  const { currency, setCurrencyCode } = useCurrency();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);

  const pageTitles: Record<PageView, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Financial overview & health' },
    transactions: { title: 'Transactions', subtitle: 'Manage incomes and expenses' },
    budget: { title: 'Monthly Budget', subtitle: 'Set and track spending limits' },
    reports: { title: 'Analytics & Reports', subtitle: 'Deep dive into financial patterns' },
    profile: { title: 'My Profile', subtitle: 'Manage personal details' },
    settings: { title: 'Settings', subtitle: 'Preferences and security' },
  };

  const currentMeta = pageTitles[currentPage] || { title: 'Expense Tracker', subtitle: '' };

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onOpenMobileSidebar}
          id="mobile-nav-toggle-btn"
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl md:hidden transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
            {currentMeta.title}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 font-medium">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Currency Picker + Quick Add + User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Currency Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowCurrencyMenu(!showCurrencyMenu);
              setShowUserMenu(false);
            }}
            id="currency-switcher-btn"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
            title="Switch display currency"
          >
            <span className="text-indigo-600 font-bold">{currency.symbol}</span>
            <span className="hidden sm:inline">{currency.code}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showCurrencyMenu && (
            <div
              id="currency-dropdown-menu"
              className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-40"
            >
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Display Currency
              </div>
              {SUPPORTED_CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    setCurrencyCode(c.code);
                    setShowCurrencyMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between hover:bg-slate-50 ${
                    c.code === currency.code ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>{c.label}</span>
                  <span className="text-slate-400">{c.symbol}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Add Transaction Button */}
        <button
          onClick={onOpenAddTransaction}
          id="navbar-add-tx-btn"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowCurrencyMenu(false);
            }}
            id="user-profile-menu-btn"
            className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div
              id="user-dropdown-menu"
              className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-40"
            >
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  onNavigate('profile');
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('settings');
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings</span>
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
