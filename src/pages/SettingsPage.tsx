import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCurrency, SUPPORTED_CURRENCIES } from '../context/CurrencyContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { ConfirmationModal } from '../components/common/ConfirmationModal.tsx';
import api from '../services/api.ts';
import {
  Lock,
  Coins,
  Download,
  Trash2,
  Check,
  KeyRound,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { deleteAccount } = useAuth();
  const { currency, setCurrencyCode } = useCurrency();
  const { showToast } = useToast();

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [pwdError, setPwdError] = useState('');

  // Delete account state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdError('All password fields are required.');
      return;
    }

    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await api.put('/auth/password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res.data.success) {
        showToast('Password changed successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update password.';
      setPwdError(msg);
      showToast(msg, 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleExportAllData = async () => {
    try {
      showToast('Preparing full backup download...', 'info');
      const [txRes, budgetRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/budget/history'),
      ]);

      const backup = {
        exportedAt: new Date().toISOString(),
        application: 'Expense Tracker',
        transactions: txRes.data.transactions || [],
        budgetHistory: budgetRes.data.history || [],
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute(
        'download',
        `expense_tracker_backup_${new Date().toISOString().split('T')[0]}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast('All financial data exported successfully!', 'success');
    } catch (err) {
      console.error('Export error:', err);
      showToast('Failed to export data.', 'error');
    }
  };

  const handleConfirmDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Please enter your password to confirm deletion.');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');
    const res = await deleteAccount(deletePassword);
    setIsDeleting(false);

    if (res.success) {
      showToast('Account deleted successfully.', 'info');
      setIsDeleteModalOpen(false);
    } else {
      setDeleteError(res.message || 'Incorrect password.');
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Application Settings</h2>
        <p className="text-xs text-slate-500">
          Configure display currencies, security preferences, and financial exports
        </p>
      </div>

      {/* 1. Currency Preferences */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Coins className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Display Currency</h3>
            <p className="text-xs text-slate-500">
              Select the default currency symbol across your dashboard and statements
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SUPPORTED_CURRENCIES.map((c) => {
            const isSelected = currency.code === c.code;
            return (
              <button
                key={c.code}
                onClick={() => setCurrencyCode(c.code)}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <span className="block text-sm font-extrabold">{c.symbol}</span>
                  <span className="text-[11px] text-slate-500 font-normal">{c.code}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Security: Change Password */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <KeyRound className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Change Password</h3>
            <p className="text-xs text-slate-500">
              Ensure your account stays secure with a unique, robust password
            </p>
          </div>
        </div>

        {pwdError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {pwdError}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-3.5">
          <div>
            <label htmlFor="settings-current-pwd" className="block text-xs font-semibold text-slate-700 mb-1">
              Current Password *
            </label>
            <input
              type="password"
              id="settings-current-pwd"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="settings-new-pwd" className="block text-xs font-semibold text-slate-700 mb-1">
                New Password *
              </label>
              <input
                type="password"
                id="settings-new-pwd"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs text-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="settings-confirm-pwd"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Confirm New Password *
              </label>
              <input
                type="password"
                id="settings-confirm-pwd"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isChangingPassword}
              id="update-pwd-btn"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
            >
              {isChangingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Data Backup / Export */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Export All Financial Records</h3>
            <p className="text-xs text-slate-500 max-w-md">
              Download your complete database of transactions and monthly budget targets in structured JSON format
            </p>
          </div>
        </div>
        <button
          onClick={handleExportAllData}
          id="export-all-data-btn"
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shrink-0 transition-colors shadow-xs"
        >
          Download Backup
        </button>
      </div>

      {/* 4. Danger Zone: Delete Account */}
      <div className="bg-rose-50/50 rounded-2xl border border-rose-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-rose-800">
          <ShieldAlert className="w-5 h-5" />
          <h3 className="text-sm font-bold">Danger Zone</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Permanently erase your account and all associated transactions, budgets, and personal data.
          This action cannot be undone.
        </p>
        <div className="pt-2">
          <button
            onClick={() => {
              setDeletePassword('');
              setDeleteError('');
              setIsDeleteModalOpen(true);
            }}
            id="open-delete-account-modal-btn"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete My Account</span>
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Account Confirmation</h3>
              <p className="text-xs text-slate-500">
                Please type your current password to permanently delete your account and all financial history.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {deleteError}
              </div>
            )}

            <div>
              <label
                htmlFor="confirm-delete-pwd"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Password *
              </label>
              <input
                type="password"
                id="confirm-delete-pwd"
                required
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                autoFocus
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAccount}
                disabled={isDeleting}
                id="confirm-delete-account-submit-btn"
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
