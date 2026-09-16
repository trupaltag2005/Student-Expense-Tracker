import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import api from '../services/api.ts';
import {
  User,
  Mail,
  Calendar,
  ShieldCheck,
  Save,
  CheckCircle2,
  LogOut,
  Settings as SettingsIcon,
} from 'lucide-react';
import { PageView } from '../types/index.ts';

interface ProfilePageProps {
  onNavigate: (page: PageView) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, updateUser, logout } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Full name cannot be empty.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Email address cannot be empty.');
      return;
    }

    setIsUpdating(true);
    try {
      const res = await api.put('/auth/profile', { name: name.trim(), email: email.trim() });
      if (res.data.success) {
        updateUser(res.data.user);
        showToast('Profile updated successfully!', 'success');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">User Profile</h2>
        <p className="text-xs text-slate-500">Manage your identity and account details</p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
        <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
            <h3 className="text-xl font-bold text-slate-900">{user?.name}</h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold w-fit mx-auto sm:mx-0">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified Account
            </span>
          </div>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <div className="flex items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Joined {memberSince}
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> Private Cloud Vault
            </span>
          </div>
        </div>
      </div>

      {/* Edit Information Form */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h4 className="text-sm font-bold text-slate-900">Personal Information</h4>
          <p className="text-xs text-slate-500">Update your display name and login credentials</p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="profile-name" className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs text-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label htmlFor="profile-email" className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  id="profile-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs text-slate-900 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUpdating}
              id="save-profile-btn"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Quick Settings Links Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Security & Preferences</h4>
          <p className="text-xs text-slate-500">
            Change your password, display currency, or manage account termination
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('settings')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Go to Settings</span>
          </button>
          <button
            onClick={logout}
            id="profile-logout-btn"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
