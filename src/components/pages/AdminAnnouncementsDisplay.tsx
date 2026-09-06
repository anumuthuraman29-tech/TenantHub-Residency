import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../services/dbStore';
import { NoticeRecord } from '../../types';
import {
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  Send,
  Bell,
  CheckCircle2,
  Search,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { AdminNavBar } from '../admin/AdminNavBar';

interface AdminAnnouncementsProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const AdminAnnouncementsDisplay: React.FC<AdminAnnouncementsProps> = ({
  onNavigate,
  onLogout,
}) => {
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<NoticeRecord['category']>('Maintenance');
  const [priority, setPriority] = useState<'NORMAL' | 'URGENT'>('NORMAL');

  const loadNotices = () => {
    setNotices([...DatabaseService.getNotices()]);
  };

  useEffect(() => {
    loadNotices();
    const handleUpdate = () => loadNotices();
    window.addEventListener('tenant_hub_db_updated', handleUpdate);
    return () => window.removeEventListener('tenant_hub_db_updated', handleUpdate);
  }, []);

  const handleOpenCreateModal = () => {
    setEditingNoticeId(null);
    setTitle('');
    setDescription('');
    setCategory('Maintenance');
    setPriority('NORMAL');
    setShowModal(true);
  };

  const handleOpenEditModal = (n: NoticeRecord) => {
    setEditingNoticeId(n.id);
    setTitle(n.title);
    setDescription(n.description);
    setCategory(n.category);
    setPriority(n.priority);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    if (editingNoticeId) {
      DatabaseService.updateNotice(editingNoticeId, {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
      });
      setStatusMessage('✓ Announcement updated successfully.');
    } else {
      DatabaseService.createNotice({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
      });
      setStatusMessage(
        priority === 'URGENT'
          ? '🚨 Urgent announcement published! Broadcasted in-app alert & SMS to all tenants.'
          : '✓ New announcement published successfully.'
      );
    }

    setShowModal(false);
    loadNotices();
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleDelete = (id: string, noticeTitle: string) => {
    if (confirm(`Are you sure you want to remove the announcement "${noticeTitle}"?`)) {
      DatabaseService.deleteNotice(id);
      loadNotices();
      setStatusMessage('✓ Announcement removed.');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleBroadcastUrgent = (id: string, noticeTitle: string) => {
    DatabaseService.publishUrgentNotice(id);
    loadNotices();
    setStatusMessage(
      `🚨 URGENT BROADCAST SENT: "${noticeTitle}" was pushed to all tenant dashboards with SMS dispatched.`
    );
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const filteredNotices = notices.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.description.toLowerCase().includes(q) ||
      n.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 flex flex-col">
      <AdminNavBar currentPage="adminannouncements" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
              <Megaphone className="w-4 h-4" />
              <span>Residency Bulletins & Notices</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Residency Announcements
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Publish building notices, water shutdowns, security updates, and urgent alerts to all occupants.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadNotices}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Refresh bulletins"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Announcement</span>
            </button>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className="mb-6 p-3 bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 rounded-xl text-xs font-semibold flex items-center justify-between shadow">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} className="text-cyan-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-[#1C2541] p-4 rounded-2xl border border-slate-700/80 mb-6 flex items-center gap-3 shadow-lg">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search announcements by title, description, or category..."
            className="w-full bg-[#0B132B] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {filteredNotices.length === 0 ? (
            <div className="p-12 text-center bg-[#1C2541]/50 border border-slate-800 rounded-2xl">
              <Megaphone className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-400">No announcements found.</p>
              <button
                onClick={handleOpenCreateModal}
                className="mt-3 text-xs text-cyan-400 underline font-semibold"
              >
                Create your first announcement
              </button>
            </div>
          ) : (
            filteredNotices.map((n) => {
              const isUrgent = n.priority === 'URGENT';
              return (
                <div
                  key={n.id}
                  className={`bg-[#1C2541] rounded-2xl p-5 border shadow-xl transition-all ${
                    isUrgent
                      ? 'border-red-500/60 shadow-red-500/10'
                      : 'border-slate-700/80 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isUrgent
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1 animate-pulse'
                            : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        {isUrgent && <AlertTriangle className="w-3.5 h-3.5" />}
                        {n.priority}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                        {n.category}
                      </span>
                      <span className="text-xs text-slate-400">{n.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isUrgent && (
                        <button
                          onClick={() => handleBroadcastUrgent(n.id, n.title)}
                          className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[11px] font-bold flex items-center gap-1 transition"
                          title="Upgrade to Urgent and send in-app broadcast + SMS to all tenants"
                        >
                          <Send className="w-3 h-3" />
                          <span>Broadcast Urgent</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEditModal(n)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                        title="Edit Announcement"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(n.id, n.title)}
                        className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition"
                        title="Delete Announcement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-white mb-2">{n.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-[#0B132B]/80 p-3.5 rounded-xl border border-slate-800/80">
                    {n.description}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Create / Edit Announcement Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C2541] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-700">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-cyan-400" />
                <span>{editingNoticeId ? 'Edit Announcement' : 'Publish New Announcement'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Announcement Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Water Tank Maintenance - Supply Pause"
                  className="w-full bg-[#0B132B] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#0B132B] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Maintenance">Maintenance</option>
                    <option value="Security">Security</option>
                    <option value="Payment">Payment</option>
                    <option value="Event">Event</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-[#0B132B] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="NORMAL">Normal Notice</option>
                    <option value="URGENT">URGENT (Broadcasts Alert & SMS)</option>
                  </select>
                </div>
              </div>

              {priority === 'URGENT' && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 text-[11px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>
                    Marking this bulletin as <strong>URGENT</strong> will trigger high-priority alerts across all resident dashboards and send automated SMS messages.
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Announcement Details <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Type full instructions, dates, timings, or precautions for residents..."
                  className="w-full bg-[#0B132B] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  {editingNoticeId ? 'Save Changes' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
