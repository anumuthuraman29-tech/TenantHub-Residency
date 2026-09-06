import React, { useState, useEffect, useMemo } from 'react';
import { DatabaseService } from '../../services/dbStore';
import { ComplaintRecord } from '../../types';
import {
  Wrench,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  MessageSquare,
  ArrowLeft,
  Flame,
} from 'lucide-react';
import { AdminNavBar } from '../admin/AdminNavBar';

interface AdminMaintenanceProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const AdminMaintenanceDisplay: React.FC<AdminMaintenanceProps> = ({
  onNavigate,
  onLogout,
}) => {
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'IN PROGRESS' | 'RESOLVED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [roomFilter, setRoomFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // New ticket modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTenantNumber, setNewTenantNumber] = useState('11');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ComplaintRecord['category']>('Plumbing');
  const [newPriority, setNewPriority] = useState<ComplaintRecord['priority']>('MEDIUM');
  const [newDescription, setNewDescription] = useState('');

  const loadData = () => {
    const list = DatabaseService.getComplaints();
    setComplaints([...list]);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('tenant_hub_db_updated', handleUpdate);
    return () => window.removeEventListener('tenant_hub_db_updated', handleUpdate);
  }, []);

  const handleStatusChange = (
    complaintId: string,
    newStatus: 'OPEN' | 'IN PROGRESS' | 'RESOLVED'
  ) => {
    DatabaseService.updateComplaintStatus(complaintId, newStatus);
    loadData();
    setStatusNotice(`✓ Ticket status updated to "${newStatus}"! Tenant notification & SMS dispatched.`);
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    DatabaseService.submitComplaint({
      tenantNumber: newTenantNumber,
      title: newTitle.trim(),
      category: newCategory,
      priority: newPriority,
      description: newDescription.trim(),
      room: `Flat ${newTenantNumber}`,
    });

    setShowAddModal(false);
    setNewTitle('');
    setNewDescription('');
    loadData();
    setStatusNotice('✓ New maintenance ticket created successfully!');
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (categoryFilter !== 'ALL' && c.category !== categoryFilter) return false;
      if (roomFilter !== 'ALL' && c.tenantNumber !== roomFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchDesc = c.description.toLowerCase().includes(q);
        const matchTenant = c.tenantName.toLowerCase().includes(q);
        const matchRoom = c.room.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchTenant && !matchRoom) return false;
      }
      return true;
    });
  }, [complaints, statusFilter, categoryFilter, roomFilter, searchQuery]);

  const stats = useMemo(() => {
    const open = complaints.filter((c) => c.status === 'OPEN').length;
    const inProgress = complaints.filter((c) => c.status === 'IN PROGRESS').length;
    const resolved = complaints.filter((c) => c.status === 'RESOLVED').length;
    return { open, inProgress, resolved, total: complaints.length };
  }, [complaints]);

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 flex flex-col">
      <AdminNavBar currentPage="adminmaintenance" onNavigate={onNavigate} onLogout={onLogout} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
              <Wrench className="w-4 h-4" />
              <span>Operations & Facilities</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Maintenance Requests & Work Orders
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage plumbing, electrical, and general repair tickets submitted by residency occupants.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Refresh tickets"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Log New Work Order</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {statusNotice && (
          <div className="mb-6 p-3 bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 rounded-xl text-xs font-semibold flex items-center justify-between shadow">
            <span>{statusNotice}</span>
            <button onClick={() => setStatusNotice(null)} className="text-cyan-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Status Counts Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
          <div
            onClick={() => setStatusFilter('ALL')}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-[#1C2541] border-cyan-500/50 shadow-md shadow-cyan-500/10'
                : 'bg-[#1C2541]/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Requests</div>
            <div className="text-2xl font-black text-white mt-1">{stats.total}</div>
          </div>

          <div
            onClick={() => setStatusFilter('OPEN')}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              statusFilter === 'OPEN'
                ? 'bg-[#1C2541] border-amber-500/50 shadow-md shadow-amber-500/10'
                : 'bg-[#1C2541]/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[11px] text-amber-400 font-semibold uppercase flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Open / Pending</span>
            </div>
            <div className="text-2xl font-black text-amber-300 mt-1">{stats.open}</div>
          </div>

          <div
            onClick={() => setStatusFilter('IN PROGRESS')}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              statusFilter === 'IN PROGRESS'
                ? 'bg-[#1C2541] border-cyan-500/50 shadow-md shadow-cyan-500/10'
                : 'bg-[#1C2541]/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[11px] text-cyan-400 font-semibold uppercase flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>In Progress</span>
            </div>
            <div className="text-2xl font-black text-cyan-300 mt-1">{stats.inProgress}</div>
          </div>

          <div
            onClick={() => setStatusFilter('RESOLVED')}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              statusFilter === 'RESOLVED'
                ? 'bg-[#1C2541] border-emerald-500/50 shadow-md shadow-emerald-500/10'
                : 'bg-[#1C2541]/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[11px] text-emerald-400 font-semibold uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Resolved</span>
            </div>
            <div className="text-2xl font-black text-emerald-300 mt-1">{stats.resolved}</div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-[#1C2541] p-4 rounded-2xl border border-slate-700/80 mb-6 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket title, flat, resident name..."
              className="w-full bg-[#0B132B] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Category:
            </span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#0B132B] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Categories</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Carpentry">Carpentry</option>
              <option value="Appliance">Appliance</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Security">Security</option>
              <option value="General">General</option>
            </select>
          </div>

          {/* Flat / Room Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Flat:</span>
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="bg-[#0B132B] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Flats</option>
              <option value="11">Flat 11</option>
              <option value="12">Flat 12</option>
              <option value="21">Flat 21</option>
              <option value="22">Flat 22</option>
              <option value="31">Flat 31</option>
              <option value="32">Flat 32</option>
              <option value="41">Flat 41</option>
            </select>
          </div>
        </div>

        {/* Tickets Grid / List */}
        <div className="space-y-3.5">
          {filteredComplaints.length === 0 ? (
            <div className="p-12 text-center bg-[#1C2541]/50 border border-slate-800 rounded-2xl">
              <Wrench className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-400">No maintenance tickets match this filter.</p>
              <button
                onClick={() => {
                  setStatusFilter('ALL');
                  setCategoryFilter('ALL');
                  setRoomFilter('ALL');
                  setSearchQuery('');
                }}
                className="mt-3 text-xs text-cyan-400 underline font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredComplaints.map((item) => {
              const isOpen = item.status === 'OPEN';
              const isInProgress = item.status === 'IN PROGRESS';
              const isResolved = item.status === 'RESOLVED';

              return (
                <div
                  key={item.id}
                  className="bg-[#1C2541] border border-slate-700/80 hover:border-cyan-500/40 rounded-2xl p-5 shadow-lg transition-all"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                        {item.id}
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <span>{item.title}</span>
                          {item.priority === 'HIGH' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1">
                              <Flame className="w-3 h-3" /> HIGH PRIORITY
                            </span>
                          )}
                        </h3>
                        <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-200">{item.tenantName}</span>
                          <span>•</span>
                          <span className="text-cyan-300">{item.room}</span>
                          <span>•</span>
                          <span>Category: <strong className="text-slate-300">{item.category}</strong></span>
                          <span>•</span>
                          <span>Submitted: {item.createdAt}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill Badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                          isResolved
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : isInProgress
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        }`}
                      >
                        {isResolved ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : isInProgress ? (
                          <Clock className="w-3.5 h-3.5" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5" />
                        )}
                        <span>{item.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div className="bg-[#0B132B] p-3 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed mb-4">
                    {item.description}
                  </div>

                  {/* Status Timeline & Admin Action Controls */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs pt-1">
                    <div className="text-slate-400 text-[11px]">
                      {item.resolvedAt ? (
                        <span className="text-emerald-400 font-medium">
                          Resolved on: {item.resolvedAt}
                        </span>
                      ) : item.lastUpdated ? (
                        <span>Last updated: {item.lastUpdated}</span>
                      ) : (
                        <span>Awaiting assignment</span>
                      )}
                    </div>

                    {/* Status Transition Action Buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">Change Status:</span>

                      <button
                        onClick={() => handleStatusChange(item.id, 'OPEN')}
                        disabled={isOpen}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                          isOpen
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 cursor-default opacity-60'
                            : 'bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700'
                        }`}
                      >
                        Mark Open
                      </button>

                      <button
                        onClick={() => handleStatusChange(item.id, 'IN PROGRESS')}
                        disabled={isInProgress}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                          isInProgress
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 cursor-default opacity-60'
                            : 'bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700'
                        }`}
                      >
                        In Progress
                      </button>

                      <button
                        onClick={() => handleStatusChange(item.id, 'RESOLVED')}
                        disabled={isResolved}
                        className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition ${
                          isResolved
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-default opacity-60'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                        }`}
                      >
                        ✓ Mark Resolved
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Log New Work Order Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C2541] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-700">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-cyan-400" />
                <span>Log Maintenance Work Order</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tenant Flat / Unit
                </label>
                <select
                  value={newTenantNumber}
                  onChange={(e) => setNewTenantNumber(e.target.value)}
                  className="w-full bg-[#0B132B] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="11">Flat 11 — Muhammad Faiz</option>
                  <option value="12">Flat 12 — Raju</option>
                  <option value="21">Flat 21 — Vijay</option>
                  <option value="22">Flat 22 — Kala</option>
                  <option value="31">Flat 31 — Sangeetha</option>
                  <option value="32">Flat 32 — Ankith Das</option>
                  <option value="41">Flat 41 — Sreenivasulu</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Issue Summary / Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Geyser thermostat trip in bathroom"
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
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-[#0B132B] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-[#0B132B] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High (Urgent)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Detailed Notes / Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe location, symptoms, or contractor instructions..."
                  className="w-full bg-[#0B132B] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  Submit Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
