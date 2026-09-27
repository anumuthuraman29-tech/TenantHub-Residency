import React, { useState, useEffect, useMemo } from 'react';
import {
  Phone,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  Search,
  RefreshCw,
  Mail,
  User,
  Building,
  HelpCircle,
} from 'lucide-react';
import { DatabaseService } from '../../services/dbStore';
import { ContactRequest } from '../../types';
import { AdminNavBar } from '../admin/AdminNavBar';
import { RefreshDataButton } from '../common/RefreshDataButton';

interface AdminContactRequestsProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const AdminContactRequestsDisplay: React.FC<AdminContactRequestsProps> = ({
  onNavigate,
  onLogout,
}) => {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'NEW' | 'IN PROGRESS' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadRequests = () => {
    const list = DatabaseService.getContactRequests();
    setRequests(list);
  };

  useEffect(() => {
    loadRequests();
    const handleUpdate = () => loadRequests();
    window.addEventListener('tenant_hub_db_updated', handleUpdate);
    return () => window.removeEventListener('tenant_hub_db_updated', handleUpdate);
  }, []);

  const handleStatusChange = async (
    id: string,
    newStatus: 'NEW' | 'IN PROGRESS' | 'RESOLVED'
  ) => {
    setUpdatingId(id);
    try {
      await DatabaseService.updateContactRequestStatus(id, newStatus);
      loadRequests();
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesFilter = filterStatus === 'ALL' || req.status === filterStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        req.tenantName.toLowerCase().includes(q) ||
        req.tenantNumber.toLowerCase().includes(q) ||
        req.subject.toLowerCase().includes(q) ||
        req.phone.includes(q) ||
        req.message.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [requests, filterStatus, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: requests.length,
      new: requests.filter((r) => r.status === 'NEW').length,
      inProgress: requests.filter((r) => r.status === 'IN PROGRESS').length,
      resolved: requests.filter((r) => r.status === 'RESOLVED').length,
    };
  }, [requests]);

  return (
    <AdminNavBar currentPage="admincontactrequests" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#1C2541] via-[#1C2541]/90 to-[#0B132B] p-6 rounded-3xl border border-teal-500/30 shadow-2xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold mb-2 uppercase tracking-wider">
              <Phone className="w-3.5 h-3.5" />
              <span>Resident Inquiries & Helpdesk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              Contact Admin Requests
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Review and attend to queries, maintenance reports, billing questions, and emergency requests submitted by tenants.
            </p>
          </div>

          <RefreshDataButton
            onRefresh={async () => {
              await DatabaseService.syncFromSupabase();
              loadRequests();
            }}
          />
        </div>

        {/* Metric Badges & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                filterStatus === 'ALL'
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'bg-[#1C2541] text-slate-300 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              <span>All Requests</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60 font-mono">
                {counts.all}
              </span>
            </button>

            <button
              onClick={() => setFilterStatus('NEW')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                filterStatus === 'NEW'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-[#1C2541] text-slate-300 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              <span>New</span>
              {counts.new > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-950 font-extrabold font-mono">
                  {counts.new}
                </span>
              )}
            </button>

            <button
              onClick={() => setFilterStatus('IN PROGRESS')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                filterStatus === 'IN PROGRESS'
                  ? 'bg-sky-400 text-slate-950 shadow-md'
                  : 'bg-[#1C2541] text-slate-300 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              <span>In Progress</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60 font-mono">
                {counts.inProgress}
              </span>
            </button>

            <button
              onClick={() => setFilterStatus('RESOLVED')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                filterStatus === 'RESOLVED'
                  ? 'bg-emerald-400 text-slate-950 shadow-md'
                  : 'bg-[#1C2541] text-slate-300 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              <span>Resolved</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60 font-mono">
                {counts.resolved}
              </span>
            </button>
          </div>

          {/* Search box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tenant, flat, or subject..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[#1C2541] border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-teal-400"
            />
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl bg-[#1C2541]/50 border border-dashed border-slate-700">
            <HelpCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Contact Requests Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No requests matching "${searchQuery}". Clear your search query.`
                : 'There are currently no requests under this filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((req) => {
              const waLink = `https://wa.me/91${req.phone.replace(
                /\D/g,
                ''
              )}?text=${encodeURIComponent(
                `Hello ${req.tenantName}, this is Anu M from Tenant Hub Residency regarding your request: "${req.subject}".`
              )}`;

              return (
                <div
                  key={req.id}
                  className="p-5 sm:p-6 rounded-2xl bg-[#1C2541] border border-slate-700/80 shadow-lg hover:border-slate-600 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 font-bold text-sm">
                        {req.tenantNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm sm:text-base">
                            {req.tenantName}
                          </span>
                          <span className="text-xs font-mono text-teal-400 font-bold">
                            (Flat {req.tenantNumber})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Ticket ID: <span className="font-mono text-slate-300">#{req.id}</span> • {req.createdAt}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge & Dropdown */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                          req.status === 'RESOLVED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                            : req.status === 'IN PROGRESS'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                        }`}
                      >
                        {req.status}
                      </span>

                      <select
                        value={req.status}
                        disabled={updatingId === req.id}
                        onChange={(e) =>
                          handleStatusChange(
                            req.id,
                            e.target.value as 'NEW' | 'IN PROGRESS' | 'RESOLVED'
                          )
                        }
                        className="text-xs py-1 px-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:outline-none focus:border-teal-400 cursor-pointer"
                      >
                        <option value="NEW">Set NEW</option>
                        <option value="IN PROGRESS">Set IN PROGRESS</option>
                        <option value="RESOLVED">Set RESOLVED</option>
                      </select>
                    </div>
                  </div>

                  {/* Subject & Message */}
                  <div>
                    <div className="text-xs font-bold text-teal-300 uppercase tracking-wider mb-1 flex items-center gap-2">
                      <span>Reason:</span>
                      <span className="text-white font-normal bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                        {req.subject}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-200 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 leading-relaxed whitespace-pre-wrap">
                      {req.message}
                    </div>
                  </div>

                  {/* Contact Actions Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Contact:</span>
                      <a
                        href={`tel:${req.phone}`}
                        className="font-mono text-teal-400 font-bold hover:underline"
                      >
                        {req.phone}
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${req.phone}`}
                        className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 font-bold flex items-center gap-1.5 transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Resident</span>
                      </a>
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1.5 transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminNavBar>
  );
};
