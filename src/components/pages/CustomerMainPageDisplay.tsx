import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Home,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  Bell,
  User,
  LogOut,
  Droplets,
  Zap,
  Phone,
  Calendar,
  ShieldCheck,
  Plus,
  ChevronRight,
  Menu,
  X,
  Wrench,
  Sparkles,
  ArrowUpRight,
  Check,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { DatabaseService } from '../../services/dbStore';
import { ThemePalette } from '../ThemePalette';
import { getTenantTables, formatINR, isPaid } from '../../data/tenantMapping';
import { ComplaintRecord, NoticeRecord, NotificationRecord } from '../../types';

interface CustomerMainPageProps {
  tenantNumber: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

type TabType = 'dashboard' | 'payments' | 'complaints' | 'notices' | 'residency' | 'profile';

export const CustomerMainPageDisplay: React.FC<CustomerMainPageProps> = ({
  tenantNumber,
  onNavigate,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [newComplaintTitle, setNewComplaintTitle] = useState('');
  const [newComplaintCategory, setNewComplaintCategory] = useState<
    'Plumbing' | 'Electrical' | 'Carpentry' | 'Appliance' | 'Cleaning' | 'Security' | 'General'
  >('Plumbing');
  const [newComplaintPriority, setNewComplaintPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [newComplaintDesc, setNewComplaintDesc] = useState('');
  const [complaintSuccessMessage, setComplaintSuccessMessage] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setTick((t) => t + 1);
    window.addEventListener('tenant_hub_db_updated', handleUpdate);
    return () => window.removeEventListener('tenant_hub_db_updated', handleUpdate);
  }, []);

  const tenantDisplayName = DatabaseService.getTenantDisplayName(tenantNumber || '11');
  const residentName = DatabaseService.getTenantResidentName(tenantNumber || '11');
  const residentPhone = DatabaseService.getTenantPhone(tenantNumber || '11');

  const tenantInfo = useMemo(() => {
    try {
      return getTenantTables(tenantNumber || '11');
    } catch {
      return null;
    }
  }, [tenantNumber, tick]);

  const customerRecord = useMemo(() => {
    return DatabaseService.getInfoRecord(tenantNumber || '11');
  }, [tenantNumber, tick]);

  const latestRent = useMemo(() => {
    return DatabaseService.getLatestRentRecord(tenantNumber || '11');
  }, [tenantNumber, tick]);

  const latestWater = useMemo(() => {
    return DatabaseService.getLatestWaterRecord(tenantNumber || '11');
  }, [tenantNumber, tick]);

  const complaints = useMemo(() => {
    return DatabaseService.getComplaints(tenantNumber || '11');
  }, [tenantNumber, tick]);

  const notices = useMemo(() => {
    return DatabaseService.getNotices();
  }, [tick]);

  const notifications = useMemo(() => {
    return DatabaseService.getNotifications(tenantNumber || '11');
  }, [tenantNumber, tick]);

  const unreadNotifs = useMemo(() => {
    return notifications.filter((n) => !n.isRead);
  }, [notifications]);

  // Payment Summary based on latest bill status and outstanding balance
  const billSummary = useMemo(() => {
    return DatabaseService.getTenantPaymentSummary(tenantNumber || '11');
  }, [tenantNumber, tick]);

  const {
    isRentPaid,
    isWaterPaid,
    rentOutstanding,
    waterOutstanding,
    grandTotal,
    isOverallPaid,
    status: overallStatus,
    pendingSubmission: pendingPayment,
  } = billSummary;

  const rentTotal = latestRent?.TOTAL ?? 0;
  const waterTotal = latestWater?.TOTAL ?? 0;

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const handleCreateComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComplaintTitle.trim() || !newComplaintDesc.trim()) return;

    DatabaseService.submitComplaint({
      tenantNumber: tenantNumber || '11',
      title: newComplaintTitle.trim(),
      category: newComplaintCategory,
      priority: newComplaintPriority,
      description: newComplaintDesc.trim(),
      room: `Flat ${tenantNumber}`,
    });

    setComplaintSuccessMessage('Maintenance ticket created successfully. The building manager will attend to it.');
    setNewComplaintTitle('');
    setNewComplaintDesc('');
    setTimeout(() => {
      setShowComplaintModal(false);
      setComplaintSuccessMessage(null);
    }, 1800);
  };

  const navItems: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'complaints', label: 'Complaints', icon: Wrench },
    { id: 'notices', label: 'Notices', icon: Bell },
    { id: 'residency', label: 'Residency', icon: Building2 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="relative z-10 w-full min-h-[90vh] flex flex-col lg:flex-row bg-[#0B0F19]/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-w-7xl mx-auto my-3 sm:my-6">
      {/* ===================== SIDEBAR (Desktop) ===================== */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0F172A] border-r border-slate-800 p-5 shrink-0 justify-between select-none">
        <div>
          {/* Brand Logo & Residency Name */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-inner">
              <Building2 className="w-5 h-5 text-teal-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-extrabold tracking-wider text-white uppercase">Tenant Hub</span>
              <span className="text-[11px] text-teal-400 font-semibold tracking-tight">Residency Portal</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.id === 'notices' && (
                    <span className="ml-auto text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded-full font-bold">
                      {notices.length}
                    </span>
                  )}
                  {item.id === 'complaints' && complaints.length > 0 && (
                    <span className="ml-auto text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full font-bold">
                      {complaints.filter((c) => c.status !== 'RESOLVED').length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tenant Profile Mini & Logout in Sidebar Footer */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-900/60 border border-slate-800/70">
            <div className="w-9 h-9 rounded-full bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-xs border border-teal-500/40">
              {tenantNumber}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-white truncate">{residentName}</span>
              <span className="text-[11px] text-slate-400 font-mono">Flat {tenantNumber}</span>
            </div>
          </div>

          <div className="pt-2">
            <ThemePalette className="w-full mb-1" />
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btnInfo"
              onClick={() => onNavigate('customerinfo')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-[11px] font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="View Tenant Info & Lease"
            >
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span>Info</span>
            </button>
            <button
              id="btnLogout"
              onClick={onLogout}
              className="flex items-center justify-center p-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 transition"
              title="Logout Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ===================== MOBILE TOP BAR ===================== */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0F172A] border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Building2 className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-white tracking-wider uppercase">Tenant Hub</div>
            <div className="text-[10px] text-teal-400 font-medium">Flat {tenantNumber} • {residentName}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemePalette showLabel={false} />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-200 border border-slate-700"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden p-4 bg-[#0F172A] border-b border-slate-800 space-y-2 animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold ${
                    isActive
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <button
              id="btnInfo"
              onClick={() => onNavigate('customerinfo')}
              className="text-teal-400 font-semibold flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" /> Lease Info
            </button>
            <button
              id="btnLogout"
              onClick={onLogout}
              className="text-red-400 font-semibold flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      )}

      {/* ===================== MAIN CONTENT AREA ===================== */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[90vh]">
        {/* ===================== TOP HEADER & GREETING ===================== */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                {greeting}, {residentName} 👋
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Here&apos;s an overview of your residency at Tenant Hub.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ThemePalette />
            <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 px-3.5 py-1.5 rounded-full text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">Flat {tenantNumber}</span>
              <span className="text-slate-500">•</span>
              <span className="text-teal-400 font-medium">Active Lease</span>
            </div>

            <button
              onClick={() => setActiveTab('notices')}
              className="relative p-2 rounded-full bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 transition"
              title="Residency Notices & Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-cyan-400 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifs.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* ===================== TAB VIEW ROUTER ===================== */}

        {/* 1. DASHBOARD VIEW (PRIMARY) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Unread Alert Banners */}
            {unreadNotifs.length > 0 && (
              <div className="space-y-2">
                {unreadNotifs.slice(0, 2).map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-2xl border flex items-start justify-between gap-3 shadow-lg ${
                      n.type === 'PAYMENT_APPROVED'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                        : n.urgency === 'URGENT'
                        ? 'bg-red-500/15 border-red-500/40 text-red-200 animate-pulse'
                        : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold flex items-center gap-2">
                        <span>{n.title}</span>
                        <span className="text-[10px] opacity-70">({n.createdAt})</span>
                      </div>
                      <p className="text-xs opacity-90">{n.message}</p>
                    </div>
                    <button
                      onClick={() => DatabaseService.markNotificationRead(n.id)}
                      className="px-2.5 py-1 rounded-lg bg-black/30 hover:bg-black/50 text-[11px] font-semibold transition shrink-0"
                    >
                      Dismiss
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 1.1 RESIDENCY CARD */}
            <div className="bg-gradient-to-r from-slate-900 via-[#111C2E] to-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 text-lg font-black shrink-0 shadow-inner">
                    {tenantNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg sm:text-xl font-bold text-white">{residentName}</h2>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        ACTIVE RESIDENT
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                      <span className="text-teal-400 font-medium">Tenant Hub Residency</span>
                      <span>•</span>
                      <span>Room / Flat: <strong className="text-white">Unit {tenantNumber}</strong></span>
                      <span>•</span>
                      <span>Contact: <span className="font-mono text-slate-300">{residentPhone || '8129046082'}</span></span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center">
                  <button
                    onClick={() => setActiveTab('residency')}
                    className="text-xs px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition flex items-center gap-1.5"
                  >
                    <span>View Lease Spec</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Spec Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Move-in Date</span>
                  <span className="font-bold text-white font-mono">{customerRecord?.ARRIVED_DATE || '2025-02-10'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Advance Deposit</span>
                  <span className="font-bold text-amber-300">{formatINR(Number(customerRecord?.ADVANCE_PAID || 20000))}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Base Monthly Rent</span>
                  <span className="font-bold text-white">{formatINR(Number(customerRecord?.CURRENT_RENT || 6250))}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Annual Increment</span>
                  <span className="font-bold text-teal-300">{customerRecord?.YEARLY_INCREMENT || 5}% / yr</span>
                </div>
              </div>
            </div>

            {/* 1.2 PAYMENT OVERVIEW SECTION */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-teal-400" />
                    <span>Payment Overview & Status</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live billing status for current billing cycle (Rent, Water, and Utilities).
                  </p>
                </div>
                <button
                  id="btnPayment"
                  onClick={() => onNavigate('paymentpage')}
                  className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition"
                >
                  <span>Full Ledger</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 3 Prominent Cards: Rent, Water Bill, Electricity Bill */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. RENT CARD */}
                <div
                  className={`relative p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isRentPaid
                      ? 'bg-slate-900/80 border-slate-800'
                      : 'bg-gradient-to-b from-red-950/30 to-slate-900/90 border-red-500/40 shadow-lg shadow-red-950/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Monthly Rent
                      </span>
                      {isRentPaid ? (
                        <span className="status-badge status-badge-paid">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          PAID
                        </span>
                      ) : (
                        <span className="status-badge status-badge-not-paid animate-pulse">
                          <AlertCircle className="w-3.5 h-3.5" />
                          NOT PAID
                        </span>
                      )}
                    </div>

                    <div className="my-2">
                      <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {formatINR(rentTotal)}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Due Date: <strong className="text-slate-200">5th of the month</strong></span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Record Date: {latestRent?.DATE || 'Current Month'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center gap-2">
                    {!isRentPaid ? (
                      <button
                        onClick={() => onNavigate('paypage')}
                        className="flex-1 py-2 px-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition shadow-md flex items-center justify-center gap-1.5"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay {formatINR(rentOutstanding)}</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-800/80 text-emerald-400 text-xs font-semibold cursor-not-allowed flex items-center justify-center gap-1.5 border border-slate-700/50"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Rent Paid (₹0 Due)</span>
                      </button>
                    )}

                    <button
                      id="btnRent"
                      onClick={() => onNavigate('rentpage')}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
                      title="View Rent Table"
                    >
                      History
                    </button>
                  </div>
                </div>

                {/* 2. WATER BILL CARD */}
                <div
                  className={`relative p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isWaterPaid
                      ? 'bg-slate-900/80 border-slate-800'
                      : 'bg-gradient-to-b from-red-950/30 to-slate-900/90 border-red-500/40 shadow-lg shadow-red-950/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Droplets className="w-3.5 h-3.5 text-teal-400" />
                        Water Bill
                      </span>
                      {isWaterPaid ? (
                        <span className="status-badge status-badge-paid">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          PAID
                        </span>
                      ) : (
                        <span className="status-badge status-badge-not-paid animate-pulse">
                          <AlertCircle className="w-3.5 h-3.5" />
                          NOT PAID
                        </span>
                      )}
                    </div>

                    <div className="my-2">
                      <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {formatINR(waterTotal)}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Due Date: <strong className="text-slate-200">10th of the month</strong></span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
                        <span>Meter Reading:</span>
                        <span className="font-mono text-slate-200 font-semibold">
                          {latestWater ? `${latestWater.CURRENT_READINGS} units` : 'Synced'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center gap-2">
                    {!isWaterPaid ? (
                      <button
                        onClick={() => onNavigate('paypage')}
                        className="flex-1 py-2 px-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition shadow-md flex items-center justify-center gap-1.5"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay {formatINR(waterOutstanding)}</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-800/80 text-emerald-400 text-xs font-semibold cursor-not-allowed flex items-center justify-center gap-1.5 border border-slate-700/50"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Water Paid (₹0 Due)</span>
                      </button>
                    )}

                    <button
                      id="btnWaterBill"
                      onClick={() => onNavigate('waterbillpage')}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
                      title="View Water Meter Breakdown"
                    >
                      History
                    </button>
                  </div>
                </div>

                {/* 3. ELECTRICITY BILL CARD */}
                <div className="relative p-5 rounded-2xl border border-slate-800 bg-slate-900/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        Electricity
                      </span>
                      <span className="status-badge status-badge-progress">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        SUB-METERED
                      </span>
                    </div>

                    <div className="my-2">
                      <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        Active
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                        <span>Direct Utility Grid & Backup</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                        Sub-metered billing verified by property manager. 24/7 DG Generator backup included.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => onNavigate('customerinfo')}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 flex items-center justify-center gap-1.5"
                    >
                      <span>Utility Policy</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Combined Grand Total Banner */}
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-teal-950/40 via-slate-900 to-slate-900 border border-teal-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-base border border-teal-500/30">
                    ₹
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 block font-medium">Grand Total (Rent + Water)</span>
                      {isOverallPaid ? (
                        <span className="status-badge status-badge-paid">
                          <CheckCircle2 className="w-3 h-3" />
                          PAID
                        </span>
                      ) : pendingPayment ? (
                        <span className="status-badge status-badge-pending">
                          <Clock className="w-3 h-3" />
                          PENDING
                        </span>
                      ) : (
                        <span className="status-badge status-badge-not-paid">
                          <AlertCircle className="w-3 h-3" />
                          NOT PAID
                        </span>
                      )}
                    </div>
                    <span className="text-xl sm:text-2xl font-black text-white">{formatINR(grandTotal)}</span>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {isOverallPaid ? (
                        <span className="text-emerald-400 font-medium">All bills are fully paid (₹0.00 outstanding)</span>
                      ) : (
                        <span>
                          Rent: <strong className={isRentPaid ? 'text-emerald-400 font-normal' : 'text-slate-200'}>{isRentPaid ? 'PAID (₹0)' : formatINR(rentOutstanding)}</strong>
                          {' • '}
                          Water: <strong className={isWaterPaid ? 'text-emerald-400 font-normal' : 'text-slate-200'}>{isWaterPaid ? 'PAID (₹0)' : formatINR(waterOutstanding)}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {isOverallPaid ? (
                    <button
                      disabled
                      className="flex-1 sm:flex-none py-2.5 px-6 rounded-xl bg-emerald-500/20 text-emerald-300 font-extrabold text-xs tracking-wider uppercase border border-emerald-500/30 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>All Bills Paid</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigate('paypage')}
                      className="flex-1 sm:flex-none py-2.5 px-6 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs tracking-wider uppercase transition shadow-lg flex items-center justify-center gap-2"
                    >
                      <span>Pay {formatINR(grandTotal)}</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onNavigate('paymentpage')}
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>

            {/* 1.3 QUICK ACTIONS BAR */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <button
                  onClick={() => onNavigate('paypage')}
                  className="p-3.5 rounded-xl bg-slate-900/70 hover:bg-teal-500/10 border border-slate-800 hover:border-teal-500/30 text-left transition group"
                >
                  <CreditCard className="w-5 h-5 text-teal-400 mb-2 group-hover:scale-110 transition" />
                  <div className="text-xs font-bold text-white">Pay Bills</div>
                  <div className="text-[10px] text-slate-400">{isOverallPaid ? 'All Bills Paid' : `Due: ${formatINR(grandTotal)}`}</div>
                </button>

                <button
                  onClick={() => onNavigate('rentpage')}
                  className="p-3.5 rounded-xl bg-slate-900/70 hover:bg-teal-500/10 border border-slate-800 hover:border-teal-500/30 text-left transition group"
                >
                  <Home className="w-5 h-5 text-teal-400 mb-2 group-hover:scale-110 transition" />
                  <div className="text-xs font-bold text-white">Rent Ledger</div>
                  <div className="text-[10px] text-slate-400">Monthly breakdown</div>
                </button>

                <button
                  onClick={() => onNavigate('waterbillpage')}
                  className="p-3.5 rounded-xl bg-slate-900/70 hover:bg-teal-500/10 border border-slate-800 hover:border-teal-500/30 text-left transition group"
                >
                  <Droplets className="w-5 h-5 text-teal-400 mb-2 group-hover:scale-110 transition" />
                  <div className="text-xs font-bold text-white">Water Meter</div>
                  <div className="text-[10px] text-slate-400">Readings & Units</div>
                </button>

                <button
                  onClick={() => setShowComplaintModal(true)}
                  className="p-3.5 rounded-xl bg-slate-900/70 hover:bg-teal-500/10 border border-slate-800 hover:border-teal-500/30 text-left transition group"
                >
                  <Wrench className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition" />
                  <div className="text-xs font-bold text-white">Raise Issue</div>
                  <div className="text-[10px] text-slate-400">Maintenance desk</div>
                </button>

                <button
                  onClick={() => setActiveTab('notices')}
                  className="p-3.5 rounded-xl bg-slate-900/70 hover:bg-teal-500/10 border border-slate-800 hover:border-teal-500/30 text-left transition group"
                >
                  <Bell className="w-5 h-5 text-teal-400 mb-2 group-hover:scale-110 transition" />
                  <div className="text-xs font-bold text-white">Notices</div>
                  <div className="text-[10px] text-slate-400">Building updates</div>
                </button>

                <button
                  onClick={() => onNavigate('customerinfo')}
                  className="p-3.5 rounded-xl bg-slate-900/70 hover:bg-teal-500/10 border border-slate-800 hover:border-teal-500/30 text-left transition group"
                >
                  <User className="w-5 h-5 text-teal-400 mb-2 group-hover:scale-110 transition" />
                  <div className="text-xs font-bold text-white">Profile & Lease</div>
                  <div className="text-[10px] text-slate-400">Deposit & terms</div>
                </button>
              </div>
            </div>

            {/* 1.4 TWO COLUMNS: RECENT COMPLAINTS & LATEST NOTICES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* Complaints Box */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-teal-400" />
                    <h3 className="text-sm font-bold text-white">Maintenance Requests</h3>
                  </div>
                  <button
                    onClick={() => setShowComplaintModal(true)}
                    className="text-[11px] font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New Ticket</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {complaints.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-500">
                      No active maintenance requests for Flat {tenantNumber}.
                    </div>
                  ) : (
                    complaints.slice(0, 3).map((c) => (
                      <div
                        key={c.id}
                        className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white truncate">{c.title}</span>
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-700/60 text-slate-300">
                              {c.category}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5">{c.createdAt}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            c.status === 'RESOLVED'
                              ? 'status-badge-paid'
                              : c.status === 'IN PROGRESS'
                              ? 'status-badge-progress'
                              : 'status-badge-pending'
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Announcements Box */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-teal-400" />
                    <h3 className="text-sm font-bold text-white">Residency Announcements</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('notices')}
                    className="text-[11px] font-bold text-teal-400 hover:text-teal-300"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-2.5">
                  {notices.slice(0, 3).map((n) => (
                    <div
                      key={n.id}
                      className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 flex items-start gap-3 text-xs"
                    >
                      <div className="w-2 h-2 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-white truncate">{n.title}</span>
                          <span className="text-[10px] text-slate-400 shrink-0">{n.date}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                          {n.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. PAYMENTS TAB */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-white">Payment Management & Ledger</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete billing records for Flat {tenantNumber} ({residentName})
                </p>
              </div>
              <button
                onClick={() => onNavigate('paypage')}
                disabled={isOverallPaid}
                className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md ${
                  isOverallPaid
                    ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                    : 'bg-teal-500 hover:bg-teal-400 text-slate-950'
                }`}
              >
                {isOverallPaid ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <CreditCard className="w-4 h-4" />}
                <span>{isOverallPaid ? 'All Bills Paid (₹0.00 Due)' : `Pay ${formatINR(grandTotal)}`}</span>
              </button>
            </div>

            {/* Status Highlight Banner */}
            <div
              className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                isOverallPaid
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                  : pendingPayment
                  ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                  : 'bg-red-950/20 border-red-500/40 text-red-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {isOverallPaid ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                ) : pendingPayment ? (
                  <Clock className="w-8 h-8 text-amber-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-red-400 shrink-0 animate-pulse" />
                )}
                <div>
                  <div className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                    <span>{isOverallPaid ? 'All Dues Cleared' : (pendingPayment ? 'Payment Pending Verification' : 'Outstanding Balance Due')}</span>
                    {isOverallPaid ? (
                      <span className="status-badge status-badge-paid">PAID</span>
                    ) : pendingPayment ? (
                      <span className="status-badge status-badge-pending">PENDING</span>
                    ) : (
                      <span className="status-badge status-badge-not-paid">NOT PAID</span>
                    )}
                  </div>
                  <div className="text-xs opacity-90 mt-0.5">
                    {isOverallPaid
                      ? 'No outstanding payments for rent or water at this time (Grand Total: ₹ 0.00).'
                      : pendingPayment
                      ? `Your payment of ${formatINR(pendingPayment.amount)} is pending admin verification.`
                      : `Total Outstanding Dues: ${formatINR(grandTotal)}. Please clear before due date.`}
                  </div>
                </div>
              </div>

              {isOverallPaid ? (
                <button
                  disabled
                  className="py-2.5 px-6 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs uppercase tracking-wider border border-emerald-500/30 cursor-not-allowed flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>All Bills Paid</span>
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('paypage')}
                  className="py-2.5 px-6 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg uppercase tracking-wider"
                >
                  Pay {formatINR(grandTotal)} Now
                </button>
              )}
            </div>

            {/* Quick Access to Rent & Water details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-white">Rent History & Ledger</h3>
                  <button
                    onClick={() => onNavigate('rentpage')}
                    className="text-xs font-bold text-teal-400 hover:underline"
                  >
                    View Table →
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Current Rent Amount:</span>
                    <span className="font-bold text-white">{formatINR(rentTotal)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Payment Status:</span>
                    <span className={isRentPaid ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {latestRent?.PAID || 'NOT PAID'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Payment Mode:</span>
                    <span className="text-white font-mono">{latestRent?.['MODE OF PAYMENT'] || 'PhonePe UPI'}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-white">Water Consumption & Meter</h3>
                  <button
                    onClick={() => onNavigate('waterbillpage')}
                    className="text-xs font-bold text-teal-400 hover:underline"
                  >
                    View Table →
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Total Water Bill:</span>
                    <span className="font-bold text-white">{formatINR(waterTotal)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Payment Status:</span>
                    <span className={isWaterPaid ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {latestWater?.PAID || 'NOT PAID'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Current Reading:</span>
                    <span className="text-white font-mono">{latestWater?.CURRENT_READINGS || 0} Units</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. COMPLAINTS TAB */}
        {activeTab === 'complaints' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-white">Maintenance & Complaints Desk</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Submit and track repair requests for Flat {tenantNumber}
                </p>
              </div>
              <button
                onClick={() => setShowComplaintModal(true)}
                className="py-2.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Complaint</span>
              </button>
            </div>

            <div className="space-y-3">
              {complaints.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 text-xs">
                  No complaints filed yet. Click &quot;Submit Complaint&quot; if you need maintenance or repairs.
                </div>
              ) : (
                complaints.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">{c.title}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-teal-300 font-semibold text-[10px] border border-slate-700">
                          {c.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                          Priority: {c.priority}
                        </span>
                      </div>
                      <p className="text-slate-300 mt-1">{c.description}</p>
                      <div className="text-[11px] text-slate-500 pt-1">
                        Reported: {c.createdAt} • Reference: <span className="font-mono text-slate-400">{c.id}</span>
                        {c.resolvedAt && <span className="text-emerald-400 ml-2">Resolved: {c.resolvedAt}</span>}
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span
                        className={`status-badge ${
                          c.status === 'RESOLVED'
                            ? 'status-badge-paid'
                            : c.status === 'IN PROGRESS'
                            ? 'status-badge-progress'
                            : 'status-badge-pending'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 4. NOTICES TAB */}
        {activeTab === 'notices' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-white">Residency Bulletins & In-App Alerts</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Official announcements and payment/maintenance dispatch notifications for Flat {tenantNumber}
              </p>
            </div>

            {/* In-App Notifications Section */}
            {notifications.length > 0 && (
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                    Recent Alerts & Confirmation Feeds
                  </h3>
                  <button
                    onClick={() => DatabaseService.markAllNotificationsRead(tenantNumber)}
                    className="text-[11px] text-slate-400 hover:text-teal-300 font-semibold"
                  >
                    Mark All As Read
                  </button>
                </div>

                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 rounded-xl border flex items-start justify-between gap-3 text-xs transition ${
                        !n.isRead
                          ? 'bg-slate-900 border-teal-500/40 shadow-sm'
                          : 'bg-slate-900/50 border-slate-800/80 opacity-75'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white">{n.title}</span>
                          <span className="text-[10px] text-slate-400">{n.createdAt}</span>
                          {!n.isRead && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 font-bold">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300">{n.message}</p>
                      </div>

                      {!n.isRead && (
                        <button
                          onClick={() => DatabaseService.markNotificationRead(n.id)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold shrink-0"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Residency Bulletins */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Official Residency Bulletins
              </h3>

              {notices.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 text-xs">
                  No public bulletins posted at this time.
                </div>
              ) : (
                notices.map((n) => (
                  <div
                    key={n.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      n.priority === 'URGENT'
                        ? 'bg-amber-950/20 border-amber-500/30'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{n.title}</span>
                        {n.priority === 'URGENT' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                            URGENT
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                          {n.category}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">{n.date}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{n.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 5. RESIDENCY & LEASE TAB */}
        {activeTab === 'residency' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-white">Residency & Lease Terms</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Official residency contract parameters for Flat {tenantNumber}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800/40 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Property</span>
                  <span className="text-sm font-bold text-white">Tenant Hub Residency</span>
                </div>
                <div className="p-3 bg-slate-800/40 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Assigned Unit</span>
                  <span className="text-sm font-bold text-teal-300 font-mono">Flat {tenantNumber}</span>
                </div>
                <div className="p-3 bg-slate-800/40 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Primary Resident</span>
                  <span className="text-sm font-bold text-white">{residentName}</span>
                </div>
                <div className="p-3 bg-slate-800/40 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Move-In Date</span>
                  <span className="text-sm font-bold text-emerald-300 font-mono">
                    {customerRecord?.ARRIVED_DATE || '2025-02-10'}
                  </span>
                </div>
                <div className="p-3 bg-slate-800/40 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Advance Security Deposit</span>
                  <span className="text-sm font-bold text-amber-300">
                    {formatINR(Number(customerRecord?.ADVANCE_PAID || 20000))}
                  </span>
                </div>
                <div className="p-3 bg-slate-800/40 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Base Monthly Rent</span>
                  <span className="text-sm font-bold text-white">
                    {formatINR(Number(customerRecord?.CURRENT_RENT || 6250))}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  id="btnInfo"
                  onClick={() => onNavigate('customerinfo')}
                  className="py-2.5 px-6 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
                >
                  View Full Signed Lease Document
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-white">Resident Profile</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Contact information and authentication details
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 max-w-xl text-xs">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-300 font-black text-xl flex items-center justify-center border border-teal-500/40">
                  {tenantNumber}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{residentName}</h3>
                  <span className="text-teal-400 font-mono text-xs">Flat {tenantNumber} • Active</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Phone Number:</span>
                  <span className="font-semibold text-white">{residentPhone || '8129046082'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Tenant Number / ID:</span>
                  <span className="font-mono text-teal-300 font-bold">{tenantNumber}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Default Credentials:</span>
                  <span className="text-slate-300 font-mono">tenant{tenantNumber}</span>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  id="btnLogout"
                  onClick={onLogout}
                  className="py-2 px-5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-bold text-xs"
                >
                  Logout Session
                </button>
                <button
                  id="btnPayment"
                  onClick={() => onNavigate('paymentpage')}
                  className="py-2 px-5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===================== COMPLAINT SUBMISSION MODAL ===================== */}
      {showComplaintModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0F172A] border border-slate-700 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">Raise Maintenance Request</h3>
              </div>
              <button
                onClick={() => setShowComplaintModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {complaintSuccessMessage ? (
              <div className="py-6 text-center text-emerald-400 space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
                <div className="text-sm font-bold">{complaintSuccessMessage}</div>
              </div>
            ) : (
              <form onSubmit={handleCreateComplaint} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Issue Title / Subject:</label>
                  <input
                    type="text"
                    value={newComplaintTitle}
                    onChange={(e) => setNewComplaintTitle(e.target.value)}
                    placeholder="e.g. Tap leaking in bathroom, corridor bulb replacement"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Category:</label>
                    <select
                      value={newComplaintCategory}
                      onChange={(e) => setNewComplaintCategory(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                    >
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Carpentry">Carpentry</option>
                      <option value="Appliance">Appliance</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Security">Security</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Priority:</label>
                    <select
                      value={newComplaintPriority}
                      onChange={(e) => setNewComplaintPriority(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High (Urgent)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Detailed Description:</label>
                  <textarea
                    rows={3}
                    value={newComplaintDesc}
                    onChange={(e) => setNewComplaintDesc(e.target.value)}
                    placeholder="Describe the issue with any specific details for the technician..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowComplaintModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

