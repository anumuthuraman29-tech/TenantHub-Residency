import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { DatabaseService } from '../../services/dbStore';
import { TENANT_TABLE_MAP } from '../../data/tenantMapping';

interface LoginProps {
  onLoginSuccess: (role: 'Admin' | 'Customer', tenantNumber?: string) => void;
  onSwitchMode?: () => void;
  onNavigate?: (page: string) => void;
}

export const LoginPageDisplay: React.FC<LoginProps> = ({ onLoginSuccess, onNavigate }) => {
  return (
    <div className="relative z-10 w-full min-h-[85vh] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-xl p-8 bg-[#0F172A]/90 border border-slate-700/80 rounded-3xl shadow-2xl backdrop-blur-xl text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold mb-4 uppercase tracking-wider">
          <span>🏢</span> Residential Management
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
          TENANT HUB RESIDENCY
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mb-8 max-w-md mx-auto">
          Welcome to the digital portal for residents & property management. Access rent ledgers, water meters, maintenance, and UPI checkout.
        </p>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            id="btnCustomerLogin"
            onClick={() => (onNavigate ? onNavigate('customerloginpage') : onLoginSuccess('Customer', '11'))}
            className="p-6 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700 hover:border-teal-500/50 text-left transition group shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                👤
              </div>
              <h2 className="text-base font-bold text-white group-hover:text-teal-300 transition">
                Tenant Portal
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Flats 11, 12, 21, 22, 31, 32, 41
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-teal-400 font-bold flex items-center justify-between">
              <span>Rent • Water • UPI</span>
              <span>→</span>
            </div>
          </button>

          <button
            id="btnAdminLogin"
            onClick={() => (onNavigate ? onNavigate('adminloginpage') : onLoginSuccess('Admin'))}
            className="p-6 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700 hover:border-teal-500/50 text-left transition group shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                🛡️
              </div>
              <h2 className="text-base font-bold text-white group-hover:text-teal-300 transition">
                Admin Management
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Property & Accounts Desk
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-cyan-400 font-bold flex items-center justify-between">
              <span>Master Ledger • Approvals</span>
              <span>→</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export const CustomerLoginPage: React.FC<LoginProps> = ({ onLoginSuccess, onSwitchMode, onNavigate }) => {
  const [tenantNum, setTenantNum] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const clean = tenantNum.trim();
    if (!TENANT_TABLE_MAP[clean]) {
      setError('Invalid tenant number. Allowed suffixes: 11, 12, 21, 22, 31, 32, 41');
      return;
    }

    const isValid = DatabaseService.verifyTenant(clean, password);
    if (isValid) {
      onLoginSuccess('Customer', clean);
    } else {
      setError(`Incorrect password for Tenant ${clean}. Default: tenant${clean}`);
    }
  };

  return (
    <div className="relative z-10 w-full min-h-[85vh] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md p-8 hub-panel text-center">
        <h2 className="text-2xl font-bold tracking-wider uppercase mb-6 text-white">
          TENANT LOGIN
        </h2>

        {error && (
          <div className="bg-red-500/20 border border-red-400 text-red-200 text-sm p-3 rounded-lg mb-4 text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              Flat / Tenant Number:
            </label>
            <input
              type="text"
              value={tenantNum}
              onChange={(e) => setTenantNum(e.target.value)}
              placeholder="e.g. 11"
              className="w-full hub-input font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              Password:
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full hub-input font-mono pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1 text-slate-400 hover:text-teal-400 focus:outline-none transition"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" id="btnEnter" className="w-full hub-btn hub-btn-primary py-3 text-sm font-bold uppercase tracking-wider mt-2">
            Sign In
          </button>
        </form>

        <div className="mt-6 flex justify-between items-center text-xs">
          <button
            onClick={() => onNavigate ? onNavigate('login') : onSwitchMode?.()}
            className="text-white/70 hover:text-white underline"
          >
            ← Back
          </button>
          <button
            onClick={onSwitchMode}
            className="text-white/80 hover:text-white underline"
          >
            Switch to Admin Login
          </button>
        </div>
      </div>
    </div>
  );
};

export const AdminLoginPage: React.FC<LoginProps> = ({ onLoginSuccess, onSwitchMode, onNavigate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const isValid = DatabaseService.verifyAdmin(username, password);
    if (isValid) {
      onLoginSuccess('Admin');
    } else {
      setError('Invalid admin credentials. Use admin / admin123');
    }
  };

  return (
    <div className="relative z-10 w-full min-h-[85vh] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md p-8 hub-panel text-center">
        <h2 className="text-2xl font-bold tracking-wider uppercase mb-6 text-white">
          ADMIN LOGIN
        </h2>

        {error && (
          <div className="bg-red-500/20 border border-red-400 text-red-200 text-sm p-3 rounded-lg mb-4 text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1.5">
              Admin Username:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              className="w-full hub-input font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1.5">
              Password:
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="e.g. admin123"
                className="w-full hub-input font-mono pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1 text-slate-400 hover:text-teal-400 focus:outline-none transition"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" id="btnEnter" className="w-full hub-btn py-3 text-sm font-bold uppercase tracking-wider mt-2">
            Sign In
          </button>
        </form>

        <div className="mt-6 flex justify-between items-center text-xs">
          <button
            onClick={() => onNavigate ? onNavigate('login') : onSwitchMode?.()}
            className="text-white/70 hover:text-white underline"
          >
            ← Back
          </button>
          <button
            onClick={onSwitchMode}
            className="text-white/80 hover:text-white underline"
          >
            Switch to Tenant Login
          </button>
        </div>
      </div>
    </div>
  );
};
