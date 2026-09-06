import React from 'react';
import { Home, Droplets, Users, KeyRound, ShieldCheck, Send, LogOut, Shield } from 'lucide-react';

interface AdminMainPageProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const AdminMainPageDisplay: React.FC<AdminMainPageProps> = ({ onNavigate, onLogout }) => {
  return (
    <div className="relative z-10 w-full min-h-[85vh] flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-2xl p-8 bg-[#0F172A]/90 border border-slate-700/80 rounded-3xl shadow-2xl backdrop-blur-xl text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-3 uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5" /> Property Administration
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
          TENANT HUB — ADMIN DESK
        </h1>
        <p className="text-xs text-slate-400 mb-8 max-w-md mx-auto">
          Manage resident records, verify UPI & cash transactions, update water meter readings, and audit leases.
        </p>

        {/* Two Column Grid with 6 Primary Management Modules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Left Column: Rent, Water, Info */}
          <div className="flex flex-col gap-3">
            <button
              id="btnRent"
              onClick={() => onNavigate('rentallpage')}
              className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-teal-500/50 text-slate-200 font-bold text-xs flex items-center justify-between transition group shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/15 text-teal-400 flex items-center justify-center">
                  <Home className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-white text-xs font-bold">Rent Master Ledger</div>
                  <div className="text-[10px] text-slate-400 font-normal">All flats monthly rent</div>
                </div>
              </div>
              <span className="text-slate-500 group-hover:text-teal-400 font-bold">→</span>
            </button>

            <button
              id="btnWater"
              onClick={() => onNavigate('waterallpage')}
              className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-sky-500/50 text-slate-200 font-bold text-xs flex items-center justify-between transition group shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
                  <Droplets className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-white text-xs font-bold">Water Meters</div>
                  <div className="text-[10px] text-slate-400 font-normal">Sub-meter billing & usage</div>
                </div>
              </div>
              <span className="text-slate-500 group-hover:text-sky-400 font-bold">→</span>
            </button>

            <button
              id="btnInfo"
              onClick={() => onNavigate('infoallpage')}
              className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-teal-500/50 text-slate-200 font-bold text-xs flex items-center justify-between transition group shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-white text-xs font-bold">Resident Directory</div>
                  <div className="text-[10px] text-slate-400 font-normal">Profiles, contacts & leases</div>
                </div>
              </div>
              <span className="text-slate-500 group-hover:text-emerald-400 font-bold">→</span>
            </button>
          </div>

          {/* Right Column: Password, Payment Verification, Send Payment */}
          <div className="flex flex-col gap-3">
            <button
              id="btnPassword"
              onClick={() => onNavigate('passwordallpage')}
              className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 text-slate-200 font-bold text-xs flex items-center justify-between transition group shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-white text-xs font-bold">Access Credentials</div>
                  <div className="text-[10px] text-slate-400 font-normal">Passwords & permissions</div>
                </div>
              </div>
              <span className="text-slate-500 group-hover:text-amber-400 font-bold">→</span>
            </button>

            <button
              id="btnPaymentVerify"
              onClick={() => onNavigate('adminpaymentverify')}
              className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-teal-500/50 text-slate-200 font-bold text-xs flex items-center justify-between transition group shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/15 text-teal-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-white text-xs font-bold">Payment Verification</div>
                  <div className="text-[10px] text-slate-400 font-normal">Approve UTRs & receipts</div>
                </div>
              </div>
              <span className="text-slate-500 group-hover:text-teal-400 font-bold">→</span>
            </button>

            <button
              id="btnSendPayment"
              onClick={() => onNavigate('sendpayment')}
              className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/50 text-slate-200 font-bold text-xs flex items-center justify-between transition group shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-white text-xs font-bold">Billing Notices</div>
                  <div className="text-[10px] text-slate-400 font-normal">Send bills & reminders</div>
                </div>
              </div>
              <span className="text-slate-500 group-hover:text-indigo-400 font-bold">→</span>
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <button
          id="btnLogout"
          onClick={onLogout}
          className="py-2.5 px-6 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 mx-auto"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout Admin Session</span>
        </button>
      </div>
    </div>
  );
};
