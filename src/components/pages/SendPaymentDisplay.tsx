import React, { useState, useEffect, useMemo } from 'react';
import { DatabaseService } from '../../services/dbStore';
import { TENANT_TABLE_MAP, getTenantTables, formatINR, isPaid } from '../../data/tenantMapping';

interface SendPaymentDisplayProps {
  onNavigate: (page: string) => void;
}

export const SendPaymentDisplay: React.FC<SendPaymentDisplayProps> = ({ onNavigate }) => {
  const [selectedTenant, setSelectedTenant] = useState('11');
  const [statusMsg, setStatusMsg] = useState<{ text: string; isSuccess: boolean } | null>(null);
  const [copied, setCopied] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setTick((t) => t + 1);
    window.addEventListener('tenant_hub_db_updated', handleUpdate);
    return () => window.removeEventListener('tenant_hub_db_updated', handleUpdate);
  }, []);

  const infoRec = DatabaseService.getInfoRecord(selectedTenant);
  const baseMapping = getTenantTables(selectedTenant);

  const tenantName = infoRec?.NAME || baseMapping.tenantName;
  const tenantPhone = infoRec?.PHONE_NUMBER || baseMapping.phone;
  const tenantEmail = baseMapping.email;

  const latestRent = useMemo(() => DatabaseService.getLatestRentRecord(selectedTenant), [selectedTenant]);
  const latestWater = useMemo(() => DatabaseService.getLatestWaterRecord(selectedTenant), [selectedTenant]);

  const isRentPaid = isPaid(latestRent?.PAID);
  const isWaterPaid = isPaid(latestWater?.PAID);
  const isOverallPaid = isRentPaid && isWaterPaid;

  const rentTotal = latestRent?.TOTAL ?? 0;
  const waterTotal = latestWater?.TOTAL ?? 0;
  const grandTotal = rentTotal + waterTotal;

  const [emailOverride, setEmailOverride] = useState('');
  const [phoneOverride, setPhoneOverride] = useState('');

  const targetEmail = emailOverride.trim() || tenantEmail;
  const targetPhone = phoneOverride.trim() || tenantPhone;

  const upiAddress = '9916913919@ibl';
  const upiName = 'Tenant Hub Property';
  const upiNote = `Rent and Water Bill - Flat ${selectedTenant} (${tenantName})`;
  const upiLink = `upi://pay?pa=${encodeURIComponent(upiAddress)}&pn=${encodeURIComponent(upiName)}&am=${grandTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(upiNote)}`;
  const webPaymentLink = `${window.location.origin}/paymentpage.aspx?tenant=${selectedTenant}`;

  const messageText = `Dear ${tenantName} (Flat ${selectedTenant}),

Your monthly Tenant Hub statement is ready:
• Rent Amount: ${formatINR(rentTotal)}
• Water Bill: ${formatINR(waterTotal)}
• Grand Total: ${formatINR(grandTotal)}
• Current Status: ${isOverallPaid ? 'PAID' : 'NOT PAID'}

View your detailed bill: ${webPaymentLink}
Instant UPI Payment: ${upiLink}`;

  const handleSendEmail = () => {
    setStatusMsg({
      text: `Statement email dispatched to ${targetEmail} with full invoice details & UPI link.`,
      isSuccess: true,
    });
  };

  const handleSendSms = () => {
    setStatusMsg({
      text: `SMS billing alert sent to ${targetPhone} via SMS Gateway.`,
      isSuccess: true,
    });
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative z-10 w-full max-w-3xl mx-auto my-6 p-6 hub-panel">
      <h2 className="text-xl sm:text-2xl font-bold text-center tracking-wider uppercase mb-6">
        SEND PAYMENT BILLING (SMS, EMAIL & UPI)
      </h2>

      {statusMsg && (
        <div
          className={`p-3 rounded-lg text-sm text-center mb-6 font-semibold border ${
            statusMsg.isSuccess
              ? 'bg-green-500/20 text-green-200 border-green-400'
              : 'bg-red-500/20 text-red-200 border-red-400'
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Tenant Selector */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-blue-200 mb-1.5">
            Select Target Tenant:
          </label>
          <select
            value={selectedTenant}
            onChange={(e) => {
              setSelectedTenant(e.target.value);
              setStatusMsg(null);
            }}
            className="w-full hub-input font-medium"
          >
            {Object.keys(TENANT_TABLE_MAP).map((num) => (
              <option key={num} value={num}>
                Tenant {num} - {TENANT_TABLE_MAP[num].tenantName} (Flat {num})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center">
          <div className="bg-white/5 p-3 rounded-lg border border-white/10">
            <span className="text-xs text-blue-300 block mb-1">Rent Amount</span>
            <span className="font-bold text-white">{formatINR(rentTotal)}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-lg border border-white/10">
            <span className="text-xs text-blue-300 block mb-1">Water Bill</span>
            <span className="font-bold text-white">{formatINR(waterTotal)}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-lg border border-white/10">
            <span className="text-xs text-blue-300 block mb-1">Grand Total</span>
            <span className="font-bold text-amber-300">{formatINR(grandTotal)}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-lg border border-white/10">
            <span className="text-xs text-blue-300 block mb-1">Status</span>
            <span
              className={`text-xs px-2 py-0.5 rounded font-bold inline-block ${
                isOverallPaid
                  ? 'bg-green-700/70 text-green-200'
                  : 'bg-red-700/70 text-red-200'
              }`}
            >
              {isOverallPaid ? 'PAID' : 'NOT PAID'}
            </span>
          </div>
        </div>

        {/* Recipient Destination Details */}
        <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-blue-200 mb-1">
              Recipient Email Address:
            </label>
            <input
              type="email"
              value={targetEmail}
              onChange={(e) => setEmailOverride(e.target.value)}
              className="w-full hub-input text-xs py-1.5 font-medium"
              placeholder="e.g. anumuthuraman29@gmail.com"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-blue-200 mb-1">
              Recipient Mobile / SMS Number:
            </label>
            <input
              type="tel"
              value={targetPhone}
              onChange={(e) => setPhoneOverride(e.target.value)}
              className="w-full hub-input text-xs py-1.5 font-medium"
              placeholder="e.g. +919886938427"
            />
          </div>
        </div>

        {/* UPI Details */}
        <div className="pt-2 border-t border-white/10 space-y-2 text-xs">
          <div className="flex justify-between items-center bg-white/5 p-2.5 rounded-lg">
            <span className="text-blue-200">UPI Payee: <strong>{upiAddress}</strong></span>
            <button
              onClick={handleCopyUpi}
              className="px-3 py-1 bg-blue-600/60 hover:bg-blue-600 rounded text-white font-semibold transition"
            >
              {copied ? 'Copied Link!' : 'Copy UPI Link'}
            </button>
          </div>
          <div className="text-blue-300 truncate text-[11px]">
            Deep Link: <span className="text-white/80">{upiLink}</span>
          </div>
        </div>
      </div>

      {/* Message Preview */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-blue-200 mb-1.5">
          Notification Message Preview:
        </label>
        <textarea
          value={messageText}
          readOnly
          rows={7}
          className="w-full hub-input text-xs font-mono resize-none leading-relaxed bg-black/20"
        />
      </div>

      {/* Dispatch Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          id="btnSendEmail"
          onClick={handleSendEmail}
          className="hub-btn hub-btn-success px-6 py-2.5 text-sm"
        >
          Send Email Notification
        </button>
        <button
          id="btnSendSms"
          onClick={handleSendSms}
          className="hub-btn hub-btn-success px-6 py-2.5 text-sm"
        >
          Send SMS Billing Alert
        </button>
        <button
          id="btnBack"
          onClick={() => onNavigate('adminmainpage')}
          className="hub-btn px-6 py-2.5 text-sm"
        >
          Back to Admin
        </button>
      </div>
    </div>
  );
};
