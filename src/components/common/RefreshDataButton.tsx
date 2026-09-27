import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

export interface RefreshDataButtonProps {
  onRefresh: () => Promise<void> | void;
  isDirty?: boolean;
  unsavedWarningMessage?: string;
  className?: string;
  buttonText?: string;
  size?: 'sm' | 'md';
  variant?: 'primary' | 'secondary' | 'outline' | 'subtle';
}

export const RefreshDataButton: React.FC<RefreshDataButtonProps> = ({
  onRefresh,
  isDirty = false,
  unsavedWarningMessage = 'You have unsaved changes. Refreshing the data may discard them. Continue?',
  className = '',
  buttonText = 'Refresh Data',
  size = 'md',
  variant = 'secondary',
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const executeRefresh = async () => {
    setIsRefreshing(true);
    setShowConfirmModal(false);
    try {
      await onRefresh();
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 3000);
    } catch (err) {
      console.error('[RefreshDataButton] Error refreshing data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isRefreshing) return;

    if (isDirty) {
      setShowConfirmModal(true);
    } else {
      executeRefresh();
    }
  };

  const sizeClasses =
    size === 'sm'
      ? 'px-3 py-1.5 text-xs rounded-lg gap-1.5'
      : 'px-3.5 py-2 text-xs sm:text-sm rounded-xl gap-2';

  const variantClasses =
    variant === 'primary'
      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold shadow-md shadow-teal-500/20'
      : variant === 'outline'
      ? 'bg-transparent border border-teal-500/50 hover:bg-teal-500/10 text-teal-300 font-semibold'
      : variant === 'subtle'
      ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 font-medium'
      : 'bg-slate-800 hover:bg-slate-700 text-teal-300 hover:text-teal-200 border border-teal-500/30 hover:border-teal-500/60 font-semibold shadow-sm';

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleClick}
        disabled={isRefreshing}
        className={`inline-flex items-center justify-center transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none ${sizeClasses} ${variantClasses} ${className}`}
        title="Re-fetch latest data from database without leaving this page"
      >
        <RefreshCw
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-400 ${
            isRefreshing ? 'animate-spin text-teal-300' : ''
          }`}
        />
        <span>{isRefreshing ? 'Refreshing...' : buttonText}</span>
      </button>

      {/* Subtle feedback toast notification */}
      {showSuccessToast && (
        <div className="absolute top-full left-0 mt-2 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-semibold shadow-xl backdrop-blur-md whitespace-nowrap animate-in fade-in slide-in-from-top-1 duration-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Data refreshed successfully.</span>
        </div>
      )}

      {/* Unsaved changes confirmation modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C2541] border border-amber-500/50 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Unsaved Changes</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {unsavedWarningMessage}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeRefresh}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-md"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
