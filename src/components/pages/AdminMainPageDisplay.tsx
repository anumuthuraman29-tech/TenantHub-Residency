import React, { useState, useEffect, useMemo } from 'react';
import { DatabaseService } from '../../services/dbStore';
import { formatINR } from '../../data/tenantMapping';
import {
  Users,
  Home,
  Droplets,
  Wrench,
  ShieldCheck,
  CreditCard,
  Megaphone,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  PlusCircle,
  KeyRound,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { AdminNavBar } from '../admin/AdminNavBar';

interface AdminMainPageProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const AdminMainPageDisplay: React.FC<AdminMainPageProps> = ({
  onNavigate,
  onLogout,
}) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const reloadData = () => {
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    const handleUpdate = () => reloadData();
    window.addEventListener('tenant_hub_db_updated', handleUpdate);
    return () => window.removeEventListener('tenant_hub_db_updated', handleUpdate);
  }, []);

  // Compute all live metrics from dbStore
  const metrics = useMemo(() => {
    const tenants = DatabaseService.getTenantInfoList();
    const totalTenants = tenants.length;
    // Occupied rooms: tenants with an assigned room number or valid resident name
    const occupiedRooms = tenants.filter((t) => t.NAME && t.NAME.trim().length > 0).length;

    const paymentSubs = DatabaseService.getPaymentSubmissions();
    const verifiedPayments = paymentSubs.filter((p) => p.status === 'VERIFIED');
    const pendingPayments = paymentSubs.filter((p) => p.status === 'PENDING');
    const rejectedPayments = paymentSubs.filter((p) => p.status === 'REJECTED');

    const totalCollected = verifiedPayments.reduce((acc, curr) => acc + curr.amount, 0);

    // Calculate rent and water bill totals from ledger
    const rentSummary = DatabaseService.getRentAllSummary();
    const waterSummary = DatabaseService.getWaterAllSummary();

    // Maintenance complaints
    const complaints = DatabaseService.getComplaints();
    const pendingComplaints = complaints.filter((c) => c.status === 'OPEN');

    // Recent activities
    const recentPayments = paymentSubs.slice(0, 4);
    const recentComplaints = complaints.slice(0, 4);
    const recentNotices = DatabaseService.getNotices().slice(0, 3);

    return {
      totalTenants,
      occupiedRooms,
      totalRentCollected: rentSummary.totalRent,
      totalRentPaid: rentSummary.totalPaid,
      totalWaterCollected: waterSummary.totalDue,
      pendingComplaintsCount: pendingComplaints.length,
      pendingPaymentsCount: pendingPayments.length,
      verifiedPaymentsCount: verifiedPayments.length,
      rejectedPaymentsCount: rejectedPayments.length,
      totalCollected,
      recentPayments,
      recentComplaints,
      recentNotices,
    };
  }, [refreshKey]);

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 flex flex-col">
      <AdminNavBar currentPage="adminmainpage" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome & Overview Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#1C2541] via-[#1C2541]/90 to-[#0B132B] p-6 sm:p-8 rounded-3xl border border-cyan-500/30 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold mb-2 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Property Management & Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Admin Command Desk
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Complete administrative control over Tenant Hub Residency — monitor occupancy, approve UPI transactions, manage utilities, and resolve maintenance tickets.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <button
              onClick={reloadData}
              className="p-3 rounded-2xl bg-[#0B132B]/80 hover:bg-slate-800 border border-slate-700 text-slate-300 transition"
              title="Refresh Dashboard Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('adminpaymentverify')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition group"
            >
              <span>Verify Payments</span>
              {metrics.pendingPaymentsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-slate-950 text-cyan-300 text-[11px] font-bold">
                  {metrics.pendingPaymentsCount}
                </span>
              )}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Background Ambient Glow */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* SECTION 1: Summary Cards Grid (6 Cards) */}
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Real-Time Residency Metrics
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {/* Card 1: Total Tenants */}
            <div
              onClick={() => onNavigate('infoallpage')}
              className="p-4 sm:p-5 rounded-2xl bg-[#1C2541] border border-slate-700/80 hover:border-cyan-500/50 transition cursor-pointer group shadow-lg flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Tenants</span>
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">{metrics.totalTenants}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Registered residents</div>
              </div>
            </div>

            {/* Card 2: Occupied Rooms */}
            <div
              onClick={() => onNavigate('infoallpage')}
              className="p-4 sm:p-5 rounded-2xl bg-[#1C2541] border border-slate-700/80 hover:border-teal-500/50 transition cursor-pointer group shadow-lg flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Occupied Rooms</span>
                <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center group-hover:scale-110 transition">
                  <Home className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">{metrics.occupiedRooms} / 7</div>
                <div className="text-[10px] text-slate-400 mt-0.5">100% Occupancy</div>
              </div>
            </div>

            {/* Card 3: Total Rent Collected */}
            <div
              onClick={() => onNavigate('rentallpage')}
              className="p-4 sm:p-5 rounded-2xl bg-[#1C2541] border border-slate-700/80 hover:border-emerald-500/50 transition cursor-pointer group shadow-lg flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Rent Ledger</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-emerald-300 truncate">
                  {formatINR(metrics.totalRentCollected)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Total billing cycle</div>
              </div>
            </div>

            {/* Card 4: Total Water Bill Collected */}
            <div
              onClick={() => onNavigate('waterallpage')}
              className="p-4 sm:p-5 rounded-2xl bg-[#1C2541] border border-slate-700/80 hover:border-sky-500/50 transition cursor-pointer group shadow-lg flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Water Meter</span>
                <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center group-hover:scale-110 transition">
                  <Droplets className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-sky-300 truncate">
                  {formatINR(metrics.totalWaterCollected)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Sub-meter usage</div>
              </div>
            </div>

            {/* Card 5: Pending Maintenance Requests */}
            <div
              onClick={() => onNavigate('adminmaintenance')}
              className="p-4 sm:p-5 rounded-2xl bg-[#1C2541] border border-slate-700/80 hover:border-cyan-500/50 transition cursor-pointer group shadow-lg flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Maintenance</span>
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition">
                  <Wrench className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-white flex items-center gap-2">
                  <span>{metrics.pendingComplaintsCount}</span>
                  {metrics.pendingComplaintsCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                      Open
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Awaiting resolution</div>
              </div>
            </div>

            {/* Card 6: Pending Payment Approvals (Clickable to verify) */}
            <div
              onClick={() => onNavigate('adminpaymentverify')}
              className={`p-4 sm:p-5 rounded-2xl border transition cursor-pointer group shadow-lg flex flex-col justify-between ${
                metrics.pendingPaymentsCount > 0
                  ? 'bg-[#1C2541] border-amber-500/70 shadow-amber-500/10'
                  : 'bg-[#1C2541] border-slate-700/80 hover:border-amber-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-amber-400 font-semibold uppercase">Approvals</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-amber-300 flex items-center gap-2">
                  <span>{metrics.pendingPaymentsCount}</span>
                  {metrics.pendingPaymentsCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black animate-pulse">
                      Action
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-amber-300/80 mt-0.5">Click to verify UTRs</div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Payment Overview & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Overview Panel (2 Columns) */}
          <div className="lg:col-span-2 bg-[#1C2541] border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-wide">Payment Flow Overview</h2>
                  <p className="text-xs text-slate-400">Status breakdown of verified UPI proofs and collections</p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('adminpaymentverify')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 transition"
              >
                <span>Audit All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3.5 rounded-2xl bg-[#0B132B] border border-slate-800">
                <div className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </div>
                <div className="text-xl font-black text-emerald-300 mt-1">
                  {metrics.verifiedPaymentsCount}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0B132B] border border-slate-800">
                <div className="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Pending
                </div>
                <div className="text-xl font-black text-amber-300 mt-1">
                  {metrics.pendingPaymentsCount}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0B132B] border border-slate-800">
                <div className="text-[10px] text-red-400 font-bold uppercase flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Rejected
                </div>
                <div className="text-xl font-black text-red-300 mt-1">
                  {metrics.rejectedPaymentsCount}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0B132B] border border-slate-800">
                <div className="text-[10px] text-cyan-400 font-bold uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Collected
                </div>
                <div className="text-lg font-black text-cyan-300 mt-1 truncate">
                  {formatINR(metrics.totalCollected)}
                </div>
              </div>
            </div>

            {/* Recent Payments Preview */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Latest Payment Submissions
              </div>

              {metrics.recentPayments.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs bg-[#0B132B] rounded-2xl border border-slate-800">
                  No payment submissions logged yet.
                </div>
              ) : (
                metrics.recentPayments.map((p) => {
                  const isPending = p.status === 'PENDING';
                  const isVerified = p.status === 'VERIFIED';

                  return (
                    <div
                      key={p.id}
                      onClick={() => onNavigate('adminpaymentverify')}
                      className="p-3.5 rounded-xl bg-[#0B132B] border border-slate-800 hover:border-cyan-500/40 transition flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 text-cyan-400 flex items-center justify-center font-bold text-xs">
                          {p.tenantNumber}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                            {p.tenantName} • Flat {p.tenantNumber}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            UTR: {p.utrNumber} • {p.timestamp}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-xs text-amber-300">
                          {formatINR(p.amount)}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            isVerified
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : isPending
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-red-500/20 text-red-300 border border-red-500/40'
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Actions Panel (1 Column) */}
          <div className="bg-[#1C2541] border border-slate-700/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-wide">Quick Actions</h2>
                  <p className="text-xs text-slate-400">Direct administrative shortcuts</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => onNavigate('infoeditpage')}
                  className="w-full p-3 rounded-xl bg-[#0B132B] hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-200 text-xs font-bold flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>Add / Edit Tenant Record</span>
                  </div>
                  <span className="text-slate-500 group-hover:text-cyan-400 font-bold">→</span>
                </button>

                <button
                  onClick={() => onNavigate('rentallpage')}
                  className="w-full p-3 rounded-xl bg-[#0B132B] hover:bg-slate-800 border border-slate-800 hover:border-teal-500/50 text-slate-200 text-xs font-bold flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <Home className="w-4 h-4 text-teal-400" />
                    <span>View Rent Master Ledger</span>
                  </div>
                  <span className="text-slate-500 group-hover:text-teal-400 font-bold">→</span>
                </button>

                <button
                  onClick={() => onNavigate('waterallpage')}
                  className="w-full p-3 rounded-xl bg-[#0B132B] hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 text-slate-200 text-xs font-bold flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <Droplets className="w-4 h-4 text-sky-400" />
                    <span>View Water Master Ledger</span>
                  </div>
                  <span className="text-slate-500 group-hover:text-sky-400 font-bold">→</span>
                </button>

                <button
                  onClick={() => onNavigate('adminpaymentverify')}
                  className="w-full p-3 rounded-xl bg-[#0B132B] hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-slate-200 text-xs font-bold flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Review Pending Payments</span>
                  </div>
                  <span className="text-slate-500 group-hover:text-amber-400 font-bold">→</span>
                </button>

                <button
                  onClick={() => onNavigate('adminannouncements')}
                  className="w-full p-3 rounded-xl bg-[#0B132B] hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-200 text-xs font-bold flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <Megaphone className="w-4 h-4 text-cyan-400" />
                    <span>Create Announcement</span>
                  </div>
                  <span className="text-slate-500 group-hover:text-cyan-400 font-bold">→</span>
                </button>

                <button
                  onClick={() => onNavigate('adminmaintenance')}
                  className="w-full p-3 rounded-xl bg-[#0B132B] hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-200 text-xs font-bold flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <Wrench className="w-4 h-4 text-cyan-400" />
                    <span>Manage Maintenance Requests</span>
                  </div>
                  <span className="text-slate-500 group-hover:text-cyan-400 font-bold">→</span>
                </button>

                <button
                  onClick={() => onNavigate('passwordallpage')}
                  className="w-full p-3 rounded-xl bg-[#0B132B] hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 text-slate-200 text-xs font-bold flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <KeyRound className="w-4 h-4 text-purple-400" />
                    <span>Resident Access Passwords</span>
                  </div>
                  <span className="text-slate-500 group-hover:text-purple-400 font-bold">→</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 mt-4">
              <div className="text-[10px] text-slate-500 text-center font-mono">
                TENANT HUB RESIDENCY • v3.4 PRO
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Recent Activity (Maintenance Tickets & Residency Bulletins) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Maintenance Work Orders */}
          <div className="bg-[#1C2541] border border-slate-700/80 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Recent Maintenance Orders</h3>
                  <p className="text-xs text-slate-400">Active repair requests from tenants</p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('adminmaintenance')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 transition"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {metrics.recentComplaints.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs bg-[#0B132B] rounded-2xl border border-slate-800">
                  No maintenance requests recorded.
                </div>
              ) : (
                metrics.recentComplaints.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onNavigate('adminmaintenance')}
                    className="p-3.5 rounded-xl bg-[#0B132B] border border-slate-800 hover:border-cyan-500/40 transition cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                        {c.title}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {c.tenantName} • {c.room} • {c.category}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        c.status === 'RESOLVED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : c.status === 'IN PROGRESS'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Residency Bulletins / Notices */}
          <div className="bg-[#1C2541] border border-slate-700/80 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Active Residency Bulletins</h3>
                  <p className="text-xs text-slate-400">Announcements displayed to occupants</p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('adminannouncements')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 transition"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {metrics.recentNotices.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs bg-[#0B132B] rounded-2xl border border-slate-800">
                  No bulletins published yet.
                </div>
              ) : (
                metrics.recentNotices.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => onNavigate('adminannouncements')}
                    className="p-3.5 rounded-xl bg-[#0B132B] border border-slate-800 hover:border-cyan-500/40 transition cursor-pointer flex items-start justify-between gap-3 group"
                  >
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition flex items-center gap-2">
                        <span>{n.title}</span>
                        {n.priority === 'URGENT' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/40">
                            URGENT
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {n.description}
                      </p>
                    </div>

                    <span className="text-[10px] text-slate-500 shrink-0">{n.date}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
