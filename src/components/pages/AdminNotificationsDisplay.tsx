import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../services/dbStore';
import { NotificationRecord } from '../../types';
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  ShieldCheck,
  AlertTriangle,
  Wrench,
  Info,
  RefreshCw,
} from 'lucide-react';
import { AdminNavBar } from '../admin/AdminNavBar';

interface AdminNotificationsProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const AdminNotificationsDisplay: React.FC<AdminNotificationsProps> = ({
  onNavigate,
  onLogout,
}) => {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');

  const loadNotifs = () => {
    setNotifications([...DatabaseService.getNotifications()]);
  };

  useEffect(() => {
    loadNotifs();
    const handleUpdate = () => loadNotifs();
    window.addEventListener('tenant_hub_db_updated', handleUpdate);
    return () => window.removeEventListener('tenant_hub_db_updated', handleUpdate);
  }, []);

  const handleMarkAllRead = () => {
    DatabaseService.markAllNotificationsRead();
    loadNotifs();
  };

  const handleClearAll = () => {
    if (confirm('Clear all logged notifications?')) {
      DatabaseService.clearNotifications();
      loadNotifs();
    }
  };

  const handleMarkRead = (id: string) => {
    DatabaseService.markNotificationRead(id);
    loadNotifs();
  };

  const filtered = notifications.filter((n) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'PAYMENT') return n.type.startsWith('PAYMENT');
    if (filterType === 'MAINTENANCE') return n.type === 'MAINTENANCE_UPDATE';
    if (filterType === 'ANNOUNCEMENT') return n.type === 'URGENT_ANNOUNCEMENT' || n.type === 'NOTICE';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getTypeIcon = (type: NotificationRecord['type']) => {
    switch (type) {
      case 'PAYMENT_APPROVED':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'PAYMENT_REJECTED':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'URGENT_ANNOUNCEMENT':
        return <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />;
      case 'MAINTENANCE_UPDATE':
        return <Wrench className="w-4 h-4 text-cyan-400" />;
      default:
        return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 flex flex-col">
      <AdminNavBar currentPage="adminnotifications" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
              <Bell className="w-4 h-4" />
              <span>Event Feeds & Dispatches</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Notification Center</span>
              {unreadCount > 0 && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500 text-slate-950">
                  {unreadCount} unread
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Audited in-app notifications dispatched to occupants and property administrators.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
            <button
              onClick={handleClearAll}
              className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition"
              title="Clear notifications"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#1C2541] p-3 rounded-2xl border border-slate-700/80 mb-6 flex flex-wrap items-center justify-between gap-2 shadow-lg">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === 'ALL'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              All Events ({notifications.length})
            </button>
            <button
              onClick={() => setFilterType('PAYMENT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === 'PAYMENT'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Payments
            </button>
            <button
              onClick={() => setFilterType('MAINTENANCE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === 'MAINTENANCE'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Maintenance
            </button>
            <button
              onClick={() => setFilterType('ANNOUNCEMENT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === 'ANNOUNCEMENT'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Announcements
            </button>
          </div>

          <button
            onClick={loadNotifs}
            className="p-1.5 text-slate-400 hover:text-white"
            title="Refresh Feed"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Notification Feed */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="p-12 text-center bg-[#1C2541]/50 border border-slate-800 rounded-2xl">
              <Bell className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-400">No notifications in this feed.</p>
            </div>
          ) : (
            filtered.map((n) => {
              const isUnread = !n.isRead;
              return (
                <div
                  key={n.id}
                  onClick={() => handleMarkRead(n.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isUnread
                      ? 'bg-[#1C2541] border-cyan-500/40 shadow-md shadow-cyan-500/5'
                      : 'bg-[#1C2541]/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 mt-0.5">
                        {getTypeIcon(n.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white">{n.title}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-cyan-500/20 font-mono">
                            Target: {n.tenantNumber === 'ALL' ? 'All Residents' : `Flat ${n.tenantNumber}`}
                          </span>
                          {n.urgency === 'URGENT' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 font-bold uppercase animate-pulse">
                              URGENT
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                        <div className="text-[10px] text-slate-500 mt-2">{n.createdAt}</div>
                      </div>
                    </div>

                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};
