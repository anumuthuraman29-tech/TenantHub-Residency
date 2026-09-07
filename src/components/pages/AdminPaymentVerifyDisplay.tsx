import React, { useState, useEffect, useMemo } from 'react';
import { DatabaseService } from '../../services/dbStore';
import { formatINR } from '../../data/tenantMapping';
import { PaymentSubmission } from '../../types';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CreditCard,
  MessageSquare,
} from 'lucide-react';
import { AdminNavBar } from '../admin/AdminNavBar';

interface AdminPaymentVerifyProps {
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

export const AdminPaymentVerifyDisplay: React.FC<AdminPaymentVerifyProps> = ({
  onNavigate,
  onLogout,
}) => {
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Rejection modal
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const refreshData = () => {
    setSubmissions([...DatabaseService.getPaymentSubmissions()]);
  };

  useEffect(() => {
    refreshData();
    DatabaseService.syncFromSupabase().catch(() => {});
    const handleUpdate = () => refreshData();
    window.addEventListener('tenant_hub_db_updated', handleUpdate);
    return () => window.removeEventListener('tenant_hub_db_updated', handleUpdate);
  }, []);

  const handleApprove = async (subId: string, tenantNum: string, amount: number) => {
    await DatabaseService.approvePayment(subId);
    refreshData();
    setStatusMessage(
      `✓ Payment ${subId} (${formatINR(amount)}) APPROVED! Rent & Water for Flat ${tenantNum} marked PAID with ₹0 balance. In-app & SMS notification sent.`
    );
    setTimeout(() => setStatusMessage(null), 6000);
  };

  const handleOpenRejectModal = (subId: string) => {
    setRejectModalId(subId);
    setRejectReason('');
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalId) return;

    await DatabaseService.rejectPayment(rejectModalId, rejectReason.trim() || undefined);
    setRejectModalId(null);
    setRejectReason('');
    refreshData();
    setStatusMessage(
      `Payment ${rejectModalId} marked REJECTED. Bills remain unchanged, tenant notified via In-App alert and SMS.`
    );
    setTimeout(() => setStatusMessage(null), 6000);
  };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = s.id.toLowerCase().includes(q);
        const matchTenant = s.tenantName.toLowerCase().includes(q);
        const matchRoom = s.tenantNumber.includes(q);
        const matchUtr = s.utrNumber.toLowerCase().includes(q);
        if (!matchId && !matchTenant && !matchRoom && !matchUtr) return false;
      }
      return true;
    });
  }, [submissions, statusFilter, searchQuery]);

  const summary = useMemo(() => {
    const pending = submissions.filter((s) => s.status === 'PENDING');
    const verified = submissions.filter((s) => s.status === 'VERIFIED');
    const rejected = submissions.filter((s) => s.status === 'REJECTED');
    const verifiedTotal = verified.reduce((acc, curr) => acc + curr.amount, 0);

    return {
      pendingCount: pending.length,
      verifiedCount: verified.length,
      rejectedCount: rejected.length,
      totalCollected: verifiedTotal,
    };
  }, [submissions]);

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 flex flex-col">
      <AdminNavBar
        currentPage="adminpaymentverify"
        onNavigate={onNavigate}
        onLogout={onLogout || (() => onNavigate('login'))}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Financial Audit & Clearing</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Payment Verification Desk
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Verify UTR transaction proofs submitted by occupants. Approving automatically clears rent and water ledgers to ₹0.00 PAID in database.
            </p>
          </div>

          <button
            onClick={refreshData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-2 text-xs font-semibold transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Submissions</span>
          </button>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div className="mb-6 p-3.5 bg-cyan-500/20 border border-cyan-500/50 text-cyan-200 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-lg">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} className="text-cyan-400 hover:text-white font-bold ml-3">
              ✕
            </button>
          </div>
        )}

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
          <div
            onClick={() => setStatusFilter('PENDING')}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              statusFilter === 'PENDING'
                ? 'bg-[#1C2541] border-amber-500/60 shadow-md shadow-amber-500/10'
                : 'bg-[#1C2541]/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[11px] text-amber-400 font-semibold uppercase flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Approvals</span>
            </div>
            <div className="text-2xl font-black text-amber-300 mt-1">
              {summary.pendingCount}
            </div>
          </div>

          <div
            onClick={() => setStatusFilter('VERIFIED')}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              statusFilter === 'VERIFIED'
                ? 'bg-[#1C2541] border-emerald-500/60 shadow-md shadow-emerald-500/10'
                : 'bg-[#1C2541]/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[11px] text-emerald-400 font-semibold uppercase flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified & Paid</span>
            </div>
            <div className="text-2xl font-black text-emerald-300 mt-1">
              {summary.verifiedCount}
            </div>
          </div>

          <div
            onClick={() => setStatusFilter('REJECTED')}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              statusFilter === 'REJECTED'
                ? 'bg-[#1C2541] border-red-500/60 shadow-md shadow-red-500/10'
                : 'bg-[#1C2541]/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[11px] text-red-400 font-semibold uppercase flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" />
              <span>Rejected</span>
            </div>
            <div className="text-2xl font-black text-red-300 mt-1">
              {summary.rejectedCount}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#1C2541]/70 border border-slate-800">
            <div className="text-[11px] text-cyan-400 font-semibold uppercase flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Total Verified Sum</span>
            </div>
            <div className="text-2xl font-black text-cyan-300 mt-1 truncate">
              {formatINR(summary.totalCollected)}
            </div>
          </div>
        </div>

        {/* Filter / Search Controls */}
        <div className="bg-[#1C2541] p-4 rounded-2xl border border-slate-700/80 mb-6 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by UTR number, flat, tenant name or ID..."
              className="w-full bg-[#0B132B] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  statusFilter === status
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Submissions Table / Cards */}
        <div className="overflow-x-auto rounded-2xl border border-slate-700/80 bg-[#1C2541] shadow-2xl">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-[#0B132B]/80 text-slate-300 text-[11px] uppercase tracking-wider font-bold">
                <th className="p-3.5 border-b border-slate-800">Ref ID</th>
                <th className="p-3.5 border-b border-slate-800">Tenant & Room</th>
                <th className="p-3.5 border-b border-slate-800">Amount</th>
                <th className="p-3.5 border-b border-slate-800">UTR / Reference No</th>
                <th className="p-3.5 border-b border-slate-800">Mode</th>
                <th className="p-3.5 border-b border-slate-800">Submitted At</th>
                <th className="p-3.5 border-b border-slate-800">Status</th>
                <th className="p-3.5 border-b border-slate-800 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500">
                    No payment submissions match current filters.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => {
                  const isPending = sub.status === 'PENDING';
                  const isVerified = sub.status === 'VERIFIED';
                  const isRejected = sub.status === 'REJECTED';

                  return (
                    <tr key={sub.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-mono text-xs font-bold text-cyan-400">
                        {sub.id}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-white">{sub.tenantName}</div>
                        <div className="text-[11px] text-slate-400">Flat {sub.tenantNumber}</div>
                      </td>
                      <td className="p-3.5 font-extrabold text-amber-300 text-sm">
                        {formatINR(sub.amount)}
                      </td>
                      <td className="p-3.5">
                        <div className="font-mono text-xs text-slate-200 bg-[#0B132B] px-2.5 py-1 rounded-lg border border-slate-800 inline-block font-semibold">
                          {sub.utrNumber}
                        </div>
                        {sub.notes && (
                          <div className="text-[10px] text-slate-400 mt-1 max-w-xs truncate" title={sub.notes}>
                            Note: {sub.notes}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-xs text-slate-300 font-medium">{sub.paymentMode}</td>
                      <td className="p-3.5 text-xs text-slate-400">{sub.timestamp}</td>
                      <td className="p-3.5">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                            isVerified
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : isPending
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                              : 'bg-red-500/20 text-red-300 border border-red-500/40'
                          }`}
                        >
                          {isVerified && <CheckCircle2 className="w-3 h-3" />}
                          {isPending && <Clock className="w-3 h-3" />}
                          {isRejected && <XCircle className="w-3 h-3" />}
                          <span>{sub.status}</span>
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApprove(sub.id, sub.tenantNumber, sub.amount)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleOpenRejectModal(sub.id)}
                              className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 rounded-xl text-xs font-bold transition"
                            >
                              Reject
                            </button>
                          </div>
                        ) : isVerified ? (
                          <span className="text-xs text-emerald-400 font-semibold">
                            ✓ Ledger Settled (₹0 Due)
                          </span>
                        ) : (
                          <span className="text-xs text-red-400 font-medium">Declined</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Reject Reason Modal */}
      {rejectModalId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C2541] border border-red-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-2 text-red-400">
              <XCircle className="w-5 h-5" />
              <span>Reject Payment Proof</span>
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Enter an optional explanation for why this payment submission ({rejectModalId}) is being declined. The tenant will receive an in-app notice and SMS alert.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reason for Rejection:
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. UTR number not matching bank transaction or amount deficit..."
                  className="w-full bg-[#0B132B] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
