import React, { useState } from 'react';
import { DatabaseService } from '../../services/dbStore';
import { formatINR } from '../../data/tenantMapping';
import { PaymentSubmission } from '../../types';

interface AdminPaymentVerifyProps {
  onNavigate: (page: string) => void;
}

export const AdminPaymentVerifyDisplay: React.FC<AdminPaymentVerifyProps> = ({ onNavigate }) => {
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>(
    DatabaseService.getPaymentSubmissions()
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const refreshData = () => {
    setSubmissions(DatabaseService.getPaymentSubmissions());
  };

  const handleApprove = (subId: string, tenantNum: string) => {
    DatabaseService.approvePayment(subId);
    refreshData();
    setStatusMessage(
      `✓ Payment ${subId} Approved! Rent & Water records for Flat ${tenantNum} marked as PAID.`
    );
  };

  const handleReject = (subId: string) => {
    DatabaseService.rejectPayment(subId);
    refreshData();
    setStatusMessage(`Payment ${subId} rejected.`);
  };

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto my-6 p-6 sm:p-8 hub-panel">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/15 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider uppercase text-white drop-shadow-md">
            PAYMENT VERIFICATION & APPROVAL (ADMIN)
          </h1>
          <p className="text-xs text-white/80 mt-1">
            Review incoming UPI & PhonePe payment proofs submitted by tenants and approve to mark records as PAID.
          </p>
        </div>

        <button
          onClick={refreshData}
          className="hub-btn px-4 py-2 text-xs font-bold whitespace-nowrap"
        >
          ↻ Refresh List
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-500/25 border border-emerald-400 text-emerald-100 rounded-xl text-xs font-semibold text-center mb-6 shadow">
          {statusMessage}
        </div>
      )}

      {/* Submissions Grid */}
      <div className="overflow-x-auto rounded-xl border border-white/15 mb-6 shadow-xl">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-white/10 text-white text-xs uppercase tracking-wider">
              <th className="p-3 border-b border-white/10">Ref ID</th>
              <th className="p-3 border-b border-white/10">Tenant</th>
              <th className="p-3 border-b border-white/10">Amount</th>
              <th className="p-3 border-b border-white/10">UTR / TXN ID</th>
              <th className="p-3 border-b border-white/10">Mode</th>
              <th className="p-3 border-b border-white/10">Date & Time</th>
              <th className="p-3 border-b border-white/10">Status</th>
              <th className="p-3 border-b border-white/10">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-white/50">
                  No payment submissions found.
                </td>
              </tr>
            ) : (
              submissions.map((sub) => {
                const isPending = sub.status === 'PENDING';
                const isVerified = sub.status === 'VERIFIED';
                return (
                  <tr key={sub.id} className="hover:bg-white/5 transition">
                    <td className="p-3 font-mono text-xs font-bold text-white">{sub.id}</td>
                    <td className="p-3">
                      <div className="font-semibold text-white">{sub.tenantName}</div>
                      <div className="text-[11px] text-white/70">Flat {sub.tenantNumber}</div>
                    </td>
                    <td className="p-3 font-bold text-amber-300">{formatINR(sub.amount)}</td>
                    <td className="p-3 font-mono text-xs text-white/90 bg-white/5 px-2 py-1 rounded">
                      {sub.utrNumber}
                    </td>
                    <td className="p-3 text-xs text-white/80">{sub.paymentMode}</td>
                    <td className="p-3 text-xs text-white/70">{sub.timestamp}</td>
                    <td className="p-3">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          isVerified
                            ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                            : isPending
                            ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40 animate-pulse'
                            : 'bg-red-500/30 text-red-200 border border-red-400/40'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {isPending ? (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleApprove(sub.id, sub.tenantNumber)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold shadow transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(sub.id)}
                            className="px-2.5 py-1 bg-red-600/70 hover:bg-red-600 text-white rounded text-xs font-semibold shadow transition"
                          >
                            Reject
                          </button>
                        </div>
                      ) : isVerified ? (
                        <span className="text-xs text-emerald-300 font-semibold">✓ Settled</span>
                      ) : (
                        <span className="text-xs text-red-300">Declined</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center pt-2">
        <button
          onClick={() => onNavigate('rentallpage')}
          className="hub-btn px-6 py-2.5 text-xs font-bold"
        >
          View Rent Database
        </button>
        <button
          onClick={() => onNavigate('adminmainpage')}
          className="hub-btn px-6 py-2.5 text-xs font-bold"
        >
          Back to Admin Hub
        </button>
      </div>
    </div>
  );
};
