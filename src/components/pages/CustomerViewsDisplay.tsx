import React from 'react';
import { DatabaseService } from '../../services/dbStore';
import { formatINR, isPaid } from '../../data/tenantMapping';
import { Home, Droplets, CheckCircle2, AlertCircle, ArrowLeft, CreditCard } from 'lucide-react';

interface CustomerViewProps {
  tenantNumber: string;
  onNavigate: (page: string) => void;
}

export const RentPageDisplay: React.FC<CustomerViewProps> = ({ tenantNumber, onNavigate }) => {
  const displayName = DatabaseService.getTenantDisplayName(tenantNumber);
  const records = DatabaseService.getRentRecords(tenantNumber);

  return (
    <div className="relative z-10 w-full max-w-4xl mx-auto my-6 p-6 sm:p-8 bg-[#0F172A]/90 border border-slate-700/80 rounded-3xl shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
              Rent Ledger & History
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Unit {tenantNumber} • {displayName}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('paypage')}
          className="py-2 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-md"
        >
          <CreditCard className="w-4 h-4" />
          <span>Pay Rent Now</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 mb-6 bg-slate-900/60">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-800/80 text-slate-300 text-[11px] font-bold uppercase tracking-wider">
              <th className="p-3.5 border-b border-slate-700/80">Date</th>
              <th className="p-3.5 border-b border-slate-700/80">Day</th>
              <th className="p-3.5 border-b border-slate-700/80">Rent</th>
              <th className="p-3.5 border-b border-slate-700/80">Balance</th>
              <th className="p-3.5 border-b border-slate-700/80">Total Due</th>
              <th className="p-3.5 border-b border-slate-700/80">Mode</th>
              <th className="p-3.5 border-b border-slate-700/80">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  No rent history recorded yet.
                </td>
              </tr>
            ) : (
              records.map((r, i) => {
                const paidBool = isPaid(r.PAID);
                return (
                  <tr key={i} className="hover:bg-slate-800/50 transition">
                    <td className="p-3.5 font-bold text-white">{r.DATE}</td>
                    <td className="p-3.5 text-slate-400">{r.DAY}</td>
                    <td className="p-3.5 text-slate-200">{formatINR(r.PAYMENT)}</td>
                    <td className="p-3.5 text-slate-400">{formatINR(r.BALANCE)}</td>
                    <td className="p-3.5 font-black text-teal-400">{formatINR(r.TOTAL)}</td>
                    <td className="p-3.5 text-slate-300 font-mono text-xs">{r['MODE OF PAYMENT']}</td>
                    <td className="p-3.5">
                      {paidBool ? (
                        <span className="status-badge status-badge-paid">
                          <CheckCircle2 className="w-3 h-3" />
                          PAID
                        </span>
                      ) : (
                        <span className="status-badge status-badge-not-paid">
                          <AlertCircle className="w-3 h-3" />
                          NOT PAID
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-3 pt-2">
        <button
          onClick={() => onNavigate('customermainpage')}
          className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition border border-slate-700 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <button
          onClick={() => onNavigate('paymentpage')}
          className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-teal-500/20 text-teal-300 font-bold text-xs transition border border-teal-500/40"
        >
          View Combined Payment Summary →
        </button>
      </div>
    </div>
  );
};

export const WaterBillPageDisplay: React.FC<CustomerViewProps> = ({ tenantNumber, onNavigate }) => {
  const displayName = DatabaseService.getTenantDisplayName(tenantNumber);
  const records = DatabaseService.getWaterRecords(tenantNumber);

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto my-6 p-6 sm:p-8 bg-[#0F172A]/90 border border-slate-700/80 rounded-3xl shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
              Water Meter & Utility Ledger
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Unit {tenantNumber} • {displayName}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('paypage')}
          className="py-2 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-md"
        >
          <CreditCard className="w-4 h-4" />
          <span>Pay Utility Now</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 mb-6 bg-slate-900/60">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-800/80 text-slate-300 text-[11px] font-bold uppercase tracking-wider">
              <th className="p-3.5 border-b border-slate-700/80">Date</th>
              <th className="p-3.5 border-b border-slate-700/80">Day</th>
              <th className="p-3.5 border-b border-slate-700/80">Current Reading</th>
              <th className="p-3.5 border-b border-slate-700/80">Prev Reading</th>
              <th className="p-3.5 border-b border-slate-700/80">Kitchen</th>
              <th className="p-3.5 border-b border-slate-700/80">Bill</th>
              <th className="p-3.5 border-b border-slate-700/80">Balance</th>
              <th className="p-3.5 border-b border-slate-700/80">Total Due</th>
              <th className="p-3.5 border-b border-slate-700/80">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {records.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-500">
                  No water bill history recorded yet.
                </td>
              </tr>
            ) : (
              records.map((r, i) => {
                const paidBool = isPaid(r.PAID);
                return (
                  <tr key={i} className="hover:bg-slate-800/50 transition">
                    <td className="p-3.5 font-bold text-white">{r.DATE}</td>
                    <td className="p-3.5 text-slate-400">{r.DAY}</td>
                    <td className="p-3.5 font-mono text-slate-200">{r.CURRENT_READINGS}</td>
                    <td className="p-3.5 font-mono text-slate-400">{r.PREVIOUS_READINGS}</td>
                    <td className="p-3.5 text-slate-300">{formatINR(r.KITCHEN)}</td>
                    <td className="p-3.5 text-slate-300">{formatINR(r.TOTAL_BILL)}</td>
                    <td className="p-3.5 text-slate-400">{formatINR(r.BALANCE)}</td>
                    <td className="p-3.5 font-black text-sky-400">{formatINR(r.TOTAL)}</td>
                    <td className="p-3.5">
                      {paidBool ? (
                        <span className="status-badge status-badge-paid">
                          <CheckCircle2 className="w-3 h-3" />
                          PAID
                        </span>
                      ) : (
                        <span className="status-badge status-badge-not-paid">
                          <AlertCircle className="w-3 h-3" />
                          NOT PAID
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-3 pt-2">
        <button
          onClick={() => onNavigate('customermainpage')}
          className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition border border-slate-700 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <button
          onClick={() => onNavigate('paymentpage')}
          className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-sky-500/20 text-sky-300 font-bold text-xs transition border border-sky-500/40"
        >
          View Combined Payment Summary →
        </button>
      </div>
    </div>
  );
};
