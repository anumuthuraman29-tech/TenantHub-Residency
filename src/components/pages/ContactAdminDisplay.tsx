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
  ChevronRight,
  ArrowLeft,
  Building,
  User,
  Hash,
} from 'lucide-react';
import { DatabaseService } from '../../services/dbStore';
import { ContactRequest } from '../../types';

interface ContactAdminProps {
  tenantNumber?: string;
  onNavigate?: (page: string, tab?: string) => void;
  showBackButton?: boolean;
}

const SUBJECT_OPTIONS = [
  'General Enquiry',
  'Maintenance Issue',
  'Payment / Billing Issue',
  'Complaint',
  'Water / Electricity Issue',
  'Room / Property Issue',
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

  const addressText =
    'No 836, 2nd Cross, Weavers Colony, Near Govt School, Bannerghatta Road, Gottigere, Kolifarm Gate, Bangalore - 560083';
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    'No 836, 2nd Cross, Weavers Colony, Near Govt School, Bannerghatta Road, Gottigere, Kolifarm Gate, Bangalore - 560083'
  )}`;

  const whatsappMessage = encodeURIComponent(
    `Hello Anu M, I am a resident from Flat ${tenantNumber || '11'}. I have an enquiry regarding my stay at Tenant Hub Residency.`
  );
  const whatsappUrl = `https://wa.me/919916913919?text=${whatsappMessage}`;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4 sm:py-6 space-y-6">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border border-slate-700/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {showBackButton && onNavigate && (
              <button
                onClick={() => onNavigate('customermainpage', 'dashboard')}
                className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 hover:text-teal-300 transition mb-3"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Tenant Dashboard</span>
              </button>
            )}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Residency Help & Support</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Contact Admin
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl font-medium">
              Need help with your stay? We're here to assist. Connect directly with our residency administrator or submit a service request below.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveView('form')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeView === 'form'
                  ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/25'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Request</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 relative ${
                activeView === 'history'
                  ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/25'
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

      {/* Grid: Admin Contacts + Emergency Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: Direct Admin Contacts */}
        <div className="md:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Residency Administrator
                </h2>
                <div className="text-xs text-teal-400 font-semibold">Anu M</div>
              </div>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 font-semibold">
              Available 9 AM – 9 PM
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Phone Call Link */}
            <a
              href="tel:9916913919"
              className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-teal-500/50 transition group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Call Admin
                </span>
                <Phone className="w-4 h-4 text-teal-400 group-hover:scale-110 transition" />
              </div>
              <div>
                <div className="font-mono font-bold text-white text-sm">9916913919</div>
                <div className="text-[10px] text-teal-400 mt-1 flex items-center gap-1 font-semibold">
                  <span>Click to call</span>
                  <span>→</span>
                </div>
              </div>
            </a>

            {/* WhatsApp Chat Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-500/40 hover:border-emerald-400 transition group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-emerald-300 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  WhatsApp
                </span>
                <MessageCircle className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
              </div>
              <div>
                <div className="font-mono font-bold text-white text-sm">9916913919</div>
                <div className="text-[10px] text-emerald-300 mt-1 flex items-center gap-1 font-bold">
                  <span>Chat on WhatsApp</span>
                  <span>→</span>
                </div>
              </div>
            </a>

            {/* Email Link */}
            <a
              href="mailto:anumuthuraman29@gmail.com?subject=Tenant%20Hub%20Residency%20Enquiry"
              className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-teal-500/50 transition group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Email
                </span>
                <Mail className="w-4 h-4 text-teal-400 group-hover:scale-110 transition" />
              </div>
              <div>
                <div className="font-mono font-medium text-white text-xs truncate" title="anumuthuraman29@gmail.com">
                  anumuthuraman29@gmail.com
                </div>
                <div className="text-[10px] text-teal-400 mt-1 flex items-center gap-1 font-semibold">
                  <span>Send Email</span>
                  <span>→</span>
                </div>
              </div>
            </a>
          </div>

          {/* Residency Physical Address Card */}
          <div className="pt-2">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/80 hover:border-teal-500/50 transition group"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Residency Address
                    </span>
                    <span className="text-[10px] text-teal-400 font-semibold inline-flex items-center gap-1">
                      <span>Open Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {addressText}
                  </p>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Card 2: 🚨 Emergency Contacts (Visually distinct, professional) */}
        <div className="rounded-2xl bg-gradient-to-b from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/40 p-5 sm:p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🚨</span>
              <h2 className="text-sm font-extrabold text-rose-300 uppercase tracking-wider">
                Emergency Contacts
              </h2>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mb-4">
              For urgent & critical situations only (e.g. medical emergencies, severe water leaks, electrical hazards, or security threats).
            </p>

            <div className="space-y-3">
              <a
                href="tel:9972331839"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-white transition group"
              >
                <div>
                  <div className="text-[10px] text-rose-300 font-bold uppercase tracking-wider">
                    Emergency Line 1
                  </div>
                  <div className="font-mono font-bold text-sm text-white">9972331839</div>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-rose-600 group-hover:bg-rose-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm">
                  <Phone className="w-3 h-3" />
                  <span>Call Now</span>
                </div>
              </a>

              <a
                href="tel:9886938427"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-white transition group"
              >
                <div>
                  <div className="text-[10px] text-rose-300 font-bold uppercase tracking-wider">
                    Emergency Line 2
                  </div>
                  <div className="font-mono font-bold text-sm text-white">9886938427</div>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-rose-600 group-hover:bg-rose-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm">
                  <Phone className="w-3 h-3" />
                  <span>Call Now</span>
                </div>
              </a>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-rose-500/20 text-[10px] text-slate-400 text-center">
            Residency Desk • 24/7 Rapid Response
          </div>
        </div>
      </div>

      {/* Main Section: Either Request Form OR My Requests History */}
      {activeView === 'form' ? (
        <div className="rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-xl backdrop-blur-xl">
          <div className="border-b border-slate-800 pb-4 mb-6">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <Send className="w-4 h-4 text-teal-400" />
              <span>Send a Request to Admin</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Fill out the details below. Our management team will receive and review your ticket promptly.
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
                  className="mt-2 text-xs text-emerald-300 underline font-bold hover:text-white"
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
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Bhavya"
                    required
                    className="w-full hub-input text-xs sm:text-sm"
                  />
                </div>
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
                Subject / Reason <span className="text-rose-400">*</span>
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
                Message / Description <span className="text-rose-400">*</span>
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
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                <span>My Submitted Requests</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Track status updates from residency administration for Flat {tenantNumber}.
              </p>
            </div>
            <button
              onClick={() => setActiveView('form')}
              className="text-xs font-bold text-teal-400 hover:text-teal-300 underline"
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
                className="mt-4 px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md hover:bg-teal-400 transition"
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
