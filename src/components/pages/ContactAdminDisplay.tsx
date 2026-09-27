import React, { useState, useEffect, useMemo } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  AlertTriangle,
  Send,
  CheckCircle2,
  Clock,
  Shield,
  HelpCircle,
  ExternalLink,
  ArrowLeft,
  User,
  Building,
} from 'lucide-react';
import { DatabaseService } from '../../services/dbStore';
import { ContactRequest } from '../../types';
import { RefreshDataButton } from '../common/RefreshDataButton';

interface ContactAdminProps {
  tenantNumber?: string;
  onNavigate?: (page: string, tab?: string) => void;
  showBackButton?: boolean;
}

const SUBJECT_OPTIONS = [
  'General Enquiry',
  'Maintenance Issue',
  'Rent / Payment Issue',
  'Complaint',
  'Water / Electricity',
  'Room Issue',
  'Emergency',
  'Other',
] as const;

export const ContactAdminDisplay: React.FC<ContactAdminProps> = ({
  tenantNumber = '11',
  onNavigate,
  showBackButton = false,
}) => {
  const residentName = useMemo(() => {
    return DatabaseService.getTenantResidentName(tenantNumber);
  }, [tenantNumber]);

  const residentPhone = useMemo(() => {
    return DatabaseService.getTenantPhone(tenantNumber);
  }, [tenantNumber]);

  // Form State
  const [name, setName] = useState(residentName || '');
  const [flatNumber, setFlatNumber] = useState(tenantNumber || '11');
  const [phone, setPhone] = useState(residentPhone || '');
  const [subject, setSubject] = useState<string>('General Enquiry');
  const [message, setMessage] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [myRequests, setMyRequests] = useState<ContactRequest[]>([]);
  const [activeView, setActiveView] = useState<'form' | 'history'>('form');

  // Track if user has typed in unsaved message
  const isDirty = useMemo(() => {
    return message.trim().length > 0;
  }, [message]);

  const reloadRequests = () => {
    const list = DatabaseService.getContactRequests(tenantNumber);
    setMyRequests(list);
  };

  useEffect(() => {
    setName(residentName || '');
    setPhone(residentPhone || '');
    setFlatNumber(tenantNumber || '11');
    reloadRequests();
  }, [tenantNumber, residentName, residentPhone]);

  useEffect(() => {
    const handleDbUpdate = () => reloadRequests();
    window.addEventListener('tenant_hub_db_updated', handleDbUpdate);
    return () => window.removeEventListener('tenant_hub_db_updated', handleDbUpdate);
  }, [tenantNumber]);

  const handleRefreshData = async () => {
    await DatabaseService.syncFromSupabase();
    reloadRequests();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (!name.trim()) {
      setErrorMsg('Please enter your Tenant Name.');
      return;
    }
    if (!flatNumber.trim()) {
      setErrorMsg('Please provide your Room / Flat Number.');
      return;
    }
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit Phone Number.');
      return;
    }
    if (!subject.trim()) {
      setErrorMsg('Please select a Subject / Reason.');
      return;
    }
    if (!message.trim()) {
      setErrorMsg('Please describe your issue or question in the Message field.');
      return;
    }

    setIsSubmitting(true);
    try {
      await DatabaseService.submitContactRequest({
        tenantNumber: flatNumber.trim(),
        tenantName: name.trim(),
        phone: cleanPhone,
        subject: subject.trim(),
        message: message.trim(),
      });

      setSuccessMsg('Your request has been submitted successfully. The admin will contact you soon.');
      setMessage('');
      reloadRequests();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fullAddress =
    'No 836, 2nd Cross, Weavers Colony, Near Govt School, Bannerghatta Road, Gottigere, Kolifarm Gate, Bangalore - 560083';

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  const whatsappUrl = 'https://wa.me/919916913919?text=Hello%20Anu%20M%2C%20I%20am%20a%20resident%20at%20Tenant%20Hub%20Residency.';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 sm:py-6 space-y-6">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border border-slate-700/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {showBackButton && onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('customermainpage', 'dashboard')}
                className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 hover:text-teal-300 transition mb-3 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Tenant Dashboard</span>
              </button>
            )}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Residency Helpdesk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              CONTACT ADMIN
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl font-medium">
              Need help with your residency? Contact the admin for assistance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* 🔄 Reusable Refresh Data Button */}
            <RefreshDataButton
              onRefresh={handleRefreshData}
              isDirty={isDirty}
              unsavedWarningMessage="You have typed a message in the request form. Refreshing data may discard it. Continue?"
            />

            <button
              type="button"
              onClick={() => setActiveView('form')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeView === 'form'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/25'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send a Request</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('history')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 relative cursor-pointer ${
                activeView === 'history'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/25'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>My Requests</span>
              {myRequests.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900 text-teal-300 font-extrabold border border-teal-400/40">
                  {myRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Grid: 6 Structured Contact Information Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Admin */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-700/80 p-5 shadow-lg backdrop-blur-xl flex flex-col justify-between hover:border-teal-500/40 transition">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                ADMIN
              </span>
              <span className="text-base font-extrabold text-white">Anu M</span>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Residency Manager & Administrator for Tenant Hub.
          </p>
        </div>

        {/* 2. Phone */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-700/80 p-5 shadow-lg backdrop-blur-xl flex flex-col justify-between hover:border-teal-500/40 transition">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  PHONE
                </span>
                <span className="text-base font-black font-mono text-white tracking-wide">
                  9916913919
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800">
            <a
              href="tel:9916913919"
              className="w-full py-2 px-3 rounded-xl bg-teal-500/15 hover:bg-teal-500 text-teal-300 hover:text-slate-950 border border-teal-500/30 font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>📞 Call Admin</span>
            </a>
          </div>
        </div>

        {/* 3. WhatsApp */}
        <div className="rounded-2xl bg-emerald-950/20 border border-emerald-500/30 p-5 shadow-lg backdrop-blur-xl flex flex-col justify-between hover:border-emerald-400/50 transition">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                  WHATSAPP
                </span>
                <span className="text-base font-black font-mono text-white tracking-wide">
                  9916913919
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-emerald-900/40">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>💬 Chat on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* 4. Email */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-700/80 p-5 shadow-lg backdrop-blur-xl flex flex-col justify-between hover:border-teal-500/40 transition">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  EMAIL
                </span>
                <span className="text-xs sm:text-sm font-semibold text-white truncate block" title="anumuthuraman29@gmail.com">
                  anumuthuraman29@gmail.com
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800">
            <a
              href="mailto:anumuthuraman29@gmail.com"
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-teal-500 text-slate-200 hover:text-slate-950 border border-slate-700 hover:border-teal-400 font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>✉️ Email Admin</span>
            </a>
          </div>
        </div>

        {/* 5. Residency Address (Span 2 cols on lg) */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-700/80 p-5 shadow-lg backdrop-blur-xl flex flex-col justify-between hover:border-teal-500/40 transition sm:col-span-2 lg:col-span-2">
          <div>
            <div className="flex items-start gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    RESIDENCY ADDRESS
                  </span>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold inline-flex items-center gap-1"
                  >
                    <span>Open in Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 font-medium mt-1 leading-relaxed">
                  {fullAddress}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 text-[11px] text-slate-400">
            Landmark: Near Govt School, Bannerghatta Road, Gottigere, Kolifarm Gate
          </div>
        </div>
      </div>

      {/* 6. Emergency Contacts Box (Visibly separated) */}
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/40 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rose-500/20 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🚨</span>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-rose-300 uppercase tracking-wider">
                Emergency Contacts
              </h2>
              <p className="text-xs text-slate-300">
                For urgent safety hazards, severe pipe bursts, power failure, or medical alerts.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 self-start sm:self-auto">
            24/7 Available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Emergency Contact 1: 9972331839 */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-rose-500/30 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wider block">
                Emergency Contact 1
              </span>
              <span className="font-mono font-black text-white text-base tracking-wide">
                9972331839
              </span>
            </div>
            <a
              href="tel:9972331839"
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>📞 Call</span>
            </a>
          </div>

          {/* Emergency Contact 2: 9886938427 */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-rose-500/30 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wider block">
                Emergency Contact 2
              </span>
              <span className="font-mono font-black text-white text-base tracking-wide">
                9886938427
              </span>
            </div>
            <a
              href="tel:9886938427"
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>📞 Call</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Section: Either Request Form OR My Requests History */}
      {activeView === 'form' ? (
        <div className="rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-xl backdrop-blur-xl">
          <div className="border-b border-slate-800 pb-4 mb-6">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <Send className="w-4 h-4 text-teal-400" />
              <span>Send a Request</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Submit your enquiry, complaint, or request directly to the administrator.
            </p>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-xs sm:text-sm font-semibold flex items-start gap-3 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div>{successMsg}</div>
                <button
                  type="button"
                  onClick={() => setActiveView('history')}
                  className="mt-2 text-xs text-emerald-300 underline font-bold hover:text-white cursor-pointer"
                >
                  View your request status in "My Requests" →
                </button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/20 border border-rose-400/50 text-rose-200 text-xs sm:text-sm font-semibold flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Tenant Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tenant Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Muhammad Faiz"
                  required
                  className="w-full hub-input text-xs sm:text-sm"
                />
              </div>

              {/* Room/Flat Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Room / Flat Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={flatNumber}
                  onChange={(e) => setFlatNumber(e.target.value)}
                  placeholder="e.g. 11, 12, 21..."
                  required
                  className="w-full hub-input font-mono text-xs sm:text-sm"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Phone Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  required
                  className="w-full hub-input font-mono text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Subject Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Subject <span className="text-rose-400">*</span>
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full hub-input text-xs sm:text-sm bg-slate-900"
              >
                {SUBJECT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-slate-900 text-white">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Message Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Message <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue, question, or request in detail so admin can assist you efficiently..."
                rows={4}
                required
                className="w-full hub-input text-xs sm:text-sm leading-relaxed resize-y"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                🔒 Requests are delivered directly to the residency administration desk.
              </span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto min-w-[200px] px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* History View: My Submitted Requests */
        <div className="rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-xl backdrop-blur-xl">
          <div className="border-b border-slate-800 pb-4 mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                <span>My Submitted Requests</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Track status updates from residency administration for Flat {tenantNumber}.
              </p>
            </div>
            <button
              onClick={() => setActiveView('form')}
              className="text-xs font-bold text-teal-400 hover:text-teal-300 underline cursor-pointer"
            >
              + New Request
            </button>
          </div>

          {myRequests.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-slate-800/40 border border-dashed border-slate-700/80">
              <HelpCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <div className="text-sm font-bold text-white">No requests submitted yet</div>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Have a question, maintenance issue, or billing query? Use the form to reach out to the admin.
              </p>
              <button
                onClick={() => setActiveView('form')}
                className="mt-4 px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md hover:bg-teal-400 transition cursor-pointer"
              >
                Submit a Request
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-400">
                        #{req.id}
                      </span>
                      <span className="text-xs font-extrabold text-white">
                        {req.subject}
                      </span>
                    </div>

                    <span
                      className={`self-start sm:self-auto text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        req.status === 'RESOLVED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                          : req.status === 'IN PROGRESS'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3 whitespace-pre-wrap">
                    {req.message}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-700/60">
                    <span>Submitted on: {req.createdAt}</span>
                    {req.resolvedAt && (
                      <span className="text-emerald-400 font-medium">
                        Resolved: {req.resolvedAt}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
