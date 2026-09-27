import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Database,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  HardDrive,
  Info,
} from 'lucide-react';
import {
  isSupabaseConfigured,
  getSupabaseConfig,
  setSupabaseConfig,
  clearSupabaseConfig,
} from '../../services/supabaseClient';
import { DatabaseService } from '../../services/dbStore';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete?: (message: string) => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onSyncComplete,
}) => {
  const [config, setConfig] = useState(getSupabaseConfig());
  const [url, setUrl] = useState(config.url || '');
  const [anonKey, setAnonKey] = useState(config.anonKey || '');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    isError?: boolean;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const current = getSupabaseConfig();
      setConfig(current);
      setUrl(current.url || '');
      setAnonKey(current.anonKey || '');
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setLoading(true);

    try {
      const res = setSupabaseConfig(url, anonKey);
      if (!res.success) {
        setStatusMessage({ text: res.error || 'Failed to configure Supabase.', isError: true });
        setLoading(false);
        return;
      }

      // Try initial sync from/to Supabase
      const pushRes = await DatabaseService.pushAllToSupabase();
      if (pushRes.success) {
        setStatusMessage({
          text: `Connected successfully! Synced ${pushRes.waterCount} water and ${pushRes.rentCount} rent records to cloud.`,
          isError: false,
        });
        setConfig(getSupabaseConfig());
        if (onSyncComplete) {
          onSyncComplete(`Connected & Synced with Supabase successfully.`);
        }
      } else {
        setStatusMessage({
          text: `Credentials saved, but sync encountered: ${pushRes.error || 'Check network / tables schema'}. You can still use the app.`,
          isError: true,
        });
      }
    } catch (err: any) {
      setStatusMessage({
        text: `Error connecting: ${err?.message || 'Unknown network error'}`,
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    setConfig(getSupabaseConfig());
    setUrl('');
    setAnonKey('');
    setStatusMessage({
      text: 'Switched to Local Storage Mode. All data remains safely stored in your browser.',
      isError: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900/95 shadow-2xl p-6 sm:p-7 text-white relative overflow-hidden"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(20, 184, 166, 0.15)',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
          title="Close Dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-wide text-white">Database & Cloud Sync</h2>
            <p className="text-xs text-slate-400">
              Manage your connection between Local Storage and Supabase Cloud
            </p>
          </div>
        </div>

        {/* Current Architecture Status Card */}
        <div className="mb-5 p-4 rounded-xl border border-slate-700/80 bg-slate-800/60">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Current Storage Mode:
            </span>
            {config.isConfigured ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Supabase Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                <HardDrive className="w-3.5 h-3.5" />
                Local Storage Mode (Active)
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {config.isConfigured ? (
              <>
                Records are being mirrored to Supabase cloud at{' '}
                <span className="font-mono text-teal-300 break-all">{config.url}</span>.
              </>
            ) : (
              <>
                All water bills, rent calculations, tenant info, and payments are{' '}
                <strong className="text-teal-300 font-semibold">
                  100% saved and persistent in local browser storage
                </strong>
                . Cloud sync is optional.
              </>
            )}
          </p>
        </div>

        {/* Status / Feedback Banner */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs sm:text-sm font-semibold mb-4 border flex items-start gap-2.5 ${
              statusMessage.isError
                ? 'bg-amber-500/20 text-amber-200 border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
            }`}
          >
            {statusMessage.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span className="flex-1">{statusMessage.text}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Supabase Project URL
            </label>
            <input
              type="url"
              placeholder="https://your-project-id.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 focus:border-teal-400 focus:outline-none text-white text-xs sm:text-sm font-mono placeholder-slate-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Supabase Anon (Public) Key
            </label>
            <textarea
              rows={3}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 focus:border-teal-400 focus:outline-none text-white text-xs sm:text-sm font-mono placeholder-slate-500 transition resize-none"
              required
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-teal-500/20 active:scale-98 transition disabled:opacity-50 cursor-pointer min-h-[42px]"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
              ) : (
                <ShieldCheck className="w-4 h-4 shrink-0" />
              )}
              <span>{loading ? 'Connecting...' : config.isConfigured ? 'Update & Sync' : 'Connect & Sync'}</span>
            </button>

            {config.isConfigured && (
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={loading}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs sm:text-sm font-semibold transition cursor-pointer min-h-[42px]"
              >
                Disconnect
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs sm:text-sm font-semibold transition cursor-pointer min-h-[42px]"
            >
              Continue in Local Mode
            </button>
          </div>
        </form>

        {/* Informational Guidance */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
          <div className="flex items-start gap-1.5 text-teal-400 font-semibold">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>Need a Supabase database?</span>
          </div>
          <p>
            1. Create a free project at <span className="text-slate-200 font-mono">supabase.com</span>.
          </p>
          <p>
            2. Run the SQL schema from <span className="text-slate-200 font-mono">supabase_schema.sql</span> (included in this repository) in your Supabase SQL editor.
          </p>
          <p>
            3. Copy the Project URL and anon key from Project Settings &gt; API and paste them above.
          </p>
        </div>
      </div>
    </div>
  );
};
