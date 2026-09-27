import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Home,
  Droplets,
  Wrench,
  Megaphone,
  Bell,
  KeyRound,
  LogOut,
  Menu,
  X,
  Phone,
  Building2,
  FileText,
} from 'lucide-react';
import { DatabaseService } from '../../services/dbStore';
import { ThemePalette } from '../ThemePalette';

export interface AdminNavBarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  children?: React.ReactNode;
}

export const AdminNavBar: React.FC<AdminNavBarProps> = ({
  currentPage,
  onNavigate,
  onLogout,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [counts, setCounts] = useState({
    pendingPayments: 0,
    openComplaints: 0,
    unreadNotifs: 0,
    newContactRequests: 0,
  });

  const updateCounts = () => {
    try {
      const subs = DatabaseService.getPaymentSubmissions();
      const pendingPay = subs.filter((s) => s.status === 'PENDING').length;

      const complaints = DatabaseService.getComplaints();
      const openMaint = complaints.filter((c) => c.status === 'OPEN').length;

      const notifs = DatabaseService.getNotifications('ADMIN');
      const unread = notifs.filter((n) => !n.isRead).length;

      const contactReqs = DatabaseService.getContactRequests();
      const newContacts = contactReqs.filter((r) => r.status === 'NEW').length;

      setCounts({
        pendingPayments: pendingPay,
        openComplaints: openMaint,
        unreadNotifs: unread,
        newContactRequests: newContacts,
      });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    updateCounts();
    const handleUpdate = () => updateCounts();
    window.addEventListener('tenant_hub_db_updated', handleUpdate);
    return () => window.removeEventListener('tenant_hub_db_updated', handleUpdate);
  }, []);

  const navItems = [
    { id: 'adminmainpage', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'infoallpage', label: 'Tenants', icon: Users },
    {
      id: 'adminpaymentverify',
      label: 'Payments',
      icon: ShieldCheck,
      badge: counts.pendingPayments > 0 ? counts.pendingPayments : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    },
    { id: 'rentallpage', label: 'Rent Bills', icon: Home },
    { id: 'waterallpage', label: 'Water Bills', icon: Droplets },
    {
      id: 'adminmaintenance',
      label: 'Maintenance',
      icon: Wrench,
      badge: counts.openComplaints > 0 ? counts.openComplaints : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    },
    { id: 'adminannouncements', label: 'Announcements', icon: Megaphone },
    {
      id: 'adminnotifications',
      label: 'Notifications',
      icon: Bell,
      badge: counts.unreadNotifs > 0 ? counts.unreadNotifs : undefined,
      badgeColor: 'bg-teal-500/20 text-teal-300 border border-teal-500/40',
    },
    {
      id: 'admincontactrequests',
      label: 'Contact Requests',
      icon: Phone,
      badge: counts.newContactRequests > 0 ? counts.newContactRequests : undefined,
      badgeColor: 'bg-teal-500/20 text-teal-300 border border-teal-500/40',
    },
    { id: 'passwordallpage', label: 'Credentials', icon: KeyRound },
  ];

  const handleNav = (pageId: string) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
  };

  // Sidebar element matching the Tenant Page navigation drawer in reference image
  const sidebarDrawer = (
    <aside className="hidden lg:flex flex-col w-64 bg-[#0F172A] border-r border-slate-800 p-5 shrink-0 justify-between select-none">
      <div>
        {/* Brand Logo & Residency Name */}
        <div
          onClick={() => handleNav('adminmainpage')}
          className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-800 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-inner group-hover:scale-105 transition">
            <Building2 className="w-5 h-5 text-teal-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-extrabold tracking-wider text-white uppercase flex items-center gap-1.5">
              <span>TENANT HUB</span>
            </span>
            <span className="text-[11px] text-teal-400 font-semibold tracking-tight">Admin Portal</span>
          </div>
        </div>

        {/* Navigation Drawer Links */}
        <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${item.badgeColor || 'bg-teal-500/20 text-teal-300'}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile Mini & Logout in Navigation Drawer Footer */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-900/60 border border-slate-800/70">
          <div className="w-9 h-9 rounded-full bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-xs border border-teal-500/40 shrink-0">
            AD
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-bold text-white truncate">Admin Anu M</span>
            <span className="text-[11px] text-teal-400 font-mono">Property Manager</span>
          </div>
        </div>

        <div className="pt-1">
          <ThemePalette className="w-full mb-1" />
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btnAdminTenants"
            onClick={() => handleNav('infoallpage')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-[11px] font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            title="Tenant Directory"
          >
            <Users className="w-3.5 h-3.5 text-teal-400" />
            <span>Tenants</span>
          </button>
          <button
            id="btnAdminLogout"
            onClick={onLogout}
            className="flex items-center justify-center p-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 transition cursor-pointer"
            title="Logout Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );

  // Mobile Top Bar
  const mobileTopBar = (
    <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0F172A] border-b border-slate-800">
      <div
        onClick={() => handleNav('adminmainpage')}
        className="flex items-center gap-2.5 cursor-pointer"
      >
        <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
          <Building2 className="w-4 h-4 text-teal-400" />
        </div>
        <div>
          <div className="text-xs font-extrabold text-white tracking-wider uppercase">Tenant Hub</div>
          <div className="text-[10px] text-teal-400 font-medium">Admin Portal • Anu M</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemePalette showLabel={false} />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 cursor-pointer"
          aria-label="Toggle Navigation Drawer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );

  // Mobile Navigation Drawer Overlay
  const mobileDrawer = mobileMenuOpen && (
    <div className="lg:hidden p-4 bg-[#0F172A] border-b border-slate-800 space-y-3 animate-in slide-in-from-top duration-200">
      <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                isActive
                  ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${item.badgeColor || 'bg-teal-500/20 text-teal-300'}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-2 border-t border-slate-800 flex justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-[10px] border border-teal-500/40">
            AD
          </div>
          <span className="text-xs font-bold text-white">Admin Anu M</span>
        </div>
        <button
          onClick={onLogout}
          className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/40 flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  // If children are provided, wrap into the full card layout matching the Tenant Page
  if (children) {
    return (
      <div className="relative z-10 w-full min-h-[90vh] flex flex-col lg:flex-row bg-[#0B0F19]/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-w-7xl mx-auto my-3 sm:my-6">
        {sidebarDrawer}
        {mobileTopBar}
        {mobileDrawer}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    );
  }

  // Fallback for standalone usage
  return (
    <>
      {sidebarDrawer}
      {mobileTopBar}
      {mobileDrawer}
    </>
  );
};
