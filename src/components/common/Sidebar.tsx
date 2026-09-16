import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  WalletCards,
  BarChart3,
  User,
  Settings,
  LogOut,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { PageView } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface SidebarProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();

  const navItems: Array<{ id: PageView; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'budget', label: 'Budget', icon: WalletCards },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleItemClick = (page: PageView) => {
    onNavigate(page);
    if (onCloseMobile) onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800/80">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
          <TrendingUp className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <span className="text-lg font-extrabold tracking-tight text-white block leading-none">
            Expense<span className="text-indigo-400">Tracker</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium tracking-wide flex items-center gap-1 mt-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Personal Finance
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* User Info & Logout footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        {user && (
          <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shadow">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate leading-tight">{user.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          id="sidebar-logout-btn"
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/40 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Persistent) */}
      <aside className="hidden md:block w-64 h-screen fixed left-0 top-0 z-30">
        {content}
      </aside>

      {/* Mobile Drawer (Responsive) */}
      {isOpenMobile && (
        <div
          id="mobile-sidebar-backdrop"
          className="fixed inset-0 z-50 md:hidden bg-slate-950/70 backdrop-blur-sm"
          onClick={onCloseMobile}
        >
          <div
            className="w-64 h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {content}
          </div>
        </div>
      )}
    </>
  );
};
