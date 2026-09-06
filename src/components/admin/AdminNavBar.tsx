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
} from 'lucide-react';
import { DatabaseService } from '../../services/dbStore';
import { ThemePalette } from '../ThemePalette';

interface AdminNavBarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const AdminNavBar: React.FC<AdminNavBarProps> = ({
  currentPage,
  onNavigate,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [counts, setCounts] = useState({
    pendingPayments: 0,
    openComplaints: 0,
    unreadNotifs: 0,
  });

  const updateCounts = () => {
    try {
      const subs = DatabaseService.getPaymentSubmissions();
      const pendingPay = subs.filter((s) => s.status === 'PENDING').length;

      const complaints = DatabaseService.getComplaints();
      const openMaint = complaints.filter((c) => c.status === 'OPEN').length;

      const notifs = DatabaseService.getNotifications('ADMIN');
      const unread = notifs.filter((n) => !n.isRead).length;

      setCounts({
        pendingPayments: pendingPay,
        openComplaints: openMaint,
        unreadNotifs: unread,
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
      badgeColor: 'bg-amber-500 text-slate-950',
    },
    { id: 'rentallpage', label: 'Rent Bills', icon: Home },
    { id: 'waterallpage', label: 'Water Bills', icon: Droplets },
    {
      id: 'adminmaintenance',
      label: 'Maintenance',
      icon: Wrench,
      badge: counts.openComplaints > 0 ? counts.openComplaints : undefined,
      badgeColor: 'bg-cyan-500 text-slate-950',
    },
    { id: 'adminannouncements', label: 'Announcements', icon: Megaphone },
    {
      id: 'adminnotifications',
      label: 'Notifications',
      icon: Bell,
      badge: counts.unreadNotifs > 0 ? counts.unreadNotifs : undefined,
      badgeColor: 'bg-red-500 text-white',
    },
    { id: 'passwordallpage', label: 'Credentials', icon: KeyRound },
  ];

  const handleNav = (pageId: string) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B132B]/95 backdrop-blur-md border-b border-cyan-500/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand / Logo */}
          <div
            onClick={() => handleNav('adminmainpage')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 p-0.5 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition">
              <div className="w-full h-full bg-[#0B132B] rounded-[10px] flex items-center justify-center">
                <span className="font-black text-cyan-400 text-sm">TH</span>
              </div>
            </div>
            <div>
              <div className="text-sm font-black text-white tracking-wider flex items-center gap-2">
                <span>TENANT HUB</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  ADMIN
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Residency Management Suite</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`relative px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-none ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop Right Logout & Theme */}
          <div className="hidden xl:flex items-center gap-2">
            <ThemePalette />
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 hover:text-red-200 text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="End Admin Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile & Tablet Hamburger Button */}
          <div className="flex xl:hidden items-center gap-2">
            {/* Quick unread indicators for tablet/mobile */}
            {counts.pendingPayments > 0 && (
              <button
                onClick={() => handleNav('adminpaymentverify')}
                className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1"
                title={`${counts.pendingPayments} payments awaiting approval`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{counts.pendingPayments}</span>
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 hover:text-white"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#0F172A] border-b border-cyan-500/20 px-4 pt-3 pb-5 space-y-1.5 shadow-2xl animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`p-2.5 rounded-xl text-left text-xs font-medium flex items-center justify-between transition ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                      : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon className="w-4 h-4 shrink-0 text-cyan-400" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${item.badgeColor}`}
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
              <ThemePalette />
              <span className="text-[11px] text-slate-400 hidden sm:inline">Admin</span>
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
      )}
    </header>
  );
};
