import React, { useState, useEffect, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { DatabaseService } from '../../services/dbStore';
import { getTenantTables, formatINR } from '../../data/tenantMapping';
import phonePeQrAsset from '../../assets/images/exact_phonepe_qr_1788086932803.jpg';

interface PayPageDisplayProps {
  tenantNumber: string;
  onNavigate: (page: string) => void;
  userRole?: 'Admin' | 'Customer';
}

export const PayPageDisplay: React.FC<PayPageDisplayProps> = ({
  tenantNumber,
  onNavigate,
  userRole,
}) => {
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentMode, setPaymentMode] = useState('PhonePe UPI');
  const [notes, setNotes] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [customQrImage, setCustomQrImage] = useState<string | null>(() => {
    return localStorage.getItem('tenant_hub_custom_qr_image') || null;
  });
  const [qrMode, setQrMode] = useState<'scannable' | 'uploaded'>(() => {
    return localStorage.getItem('tenant_hub_custom_qr_image') ? 'uploaded' : 'scannable';
  });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setTick((t) => t + 1);
    window.addEventListener('tenant_hub_db_updated', handleUpdate);
    return () => window.removeEventListener('tenant_hub_db_updated', handleUpdate);
  }, []);

  const handleCustomQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (result) {
          setCustomQrImage(result);
          localStorage.setItem('tenant_hub_custom_qr_image', result);
          setQrMode('uploaded');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetDefaultQr = () => {
    setCustomQrImage(null);
    localStorage.removeItem('tenant_hub_custom_qr_image');
    setQrMode('scannable');
  };

  const tenantInfo = useMemo(() => {
    try {
      return getTenantTables(tenantNumber || '11');
    } catch {
      return null;
    }
  }, [tenantNumber, tick]);

  const latestRent = useMemo(() => {
    return DatabaseService.getLatestRentRecord(tenantNumber || '11');
  }, [tenantNumber, tick]);

  const latestWater = useMemo(() => {
    return DatabaseService.getLatestWaterRecord(tenantNumber || '11');
  }, [tenantNumber, tick]);

  const residentName = DatabaseService.getTenantResidentName(tenantNumber || '11');
  const rentTotal = latestRent?.TOTAL ?? 0;
  const waterTotal = latestWater?.TOTAL ?? 0;
  const grandTotal = rentTotal + waterTotal;
  const totalAmountToPay = grandTotal;

  const upiId = '9916913919@ibl';
  const payeeName = 'Tenant Hub Property';
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${totalAmountToPay.toFixed(2)}&cu=INR&tn=${encodeURIComponent(
    `Rent and Water Bill Grand Total - Flat ${tenantNumber}`
  )}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      alert('Please enter your UPI Reference / UTR Number or Transaction ID');
      return;
    }

    const sub = DatabaseService.submitPaymentProof(
      tenantNumber || '11',
      totalAmountToPay,
      utrNumber.trim(),
      paymentMode,
      notes.trim() || `Online UPI payment for Flat ${tenantNumber} (Grand Total ${formatINR(totalAmountToPay)})`
    );

    setSubmissionSuccess(
      `Payment proof for ${formatINR(totalAmountToPay)} submitted successfully! Tracking Ref: ${sub.id}. Admin will verify shortly.`
    );
    setUtrNumber('');
    setNotes('');
  };

  if (!tenantInfo) {
    return (
      <div className="relative z-10 max-w-md mx-auto my-12 p-8 hub-panel text-center">
        <h2 className="text-xl font-bold text-red-300 mb-4">Tenant Not Found</h2>
        <button onClick={() => onNavigate('customermainpage')} className="hub-btn px-6 py-2">
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full max-w-4xl mx-auto my-6 p-6 sm:p-8 hub-panel">
      {/* Top Header */}
      <div className="text-center mb-6 border-b border-white/15 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider uppercase text-white drop-shadow-md">
          PHONEPE & UPI PAYMENT CHECKOUT
        </h1>
        <p className="text-xs text-white/80 mt-1">
          Scan the PhonePe QR code or click UPI deep link to complete your payment for{' '}
          <strong className="text-white">Flat {tenantNumber} ({residentName})</strong>
        </p>
      </div>

      {submissionSuccess && (
        <div className="p-4 bg-emerald-500/25 border border-emerald-400 text-emerald-100 rounded-xl text-sm font-semibold text-center mb-6 shadow-lg animate-pulse">
          ✓ {submissionSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: PhonePe QR Code Banner */}
        <div className="md:col-span-6 flex flex-col items-center bg-gradient-to-b from-[#5f259f]/90 via-[#441275]/95 to-[#2c0b4d]/95 p-6 rounded-2xl border border-purple-300/30 shadow-2xl text-white">
          {/* PhonePe Header */}
          <div className="w-full flex items-center justify-between pb-3 border-b border-white/20 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md">
                <span className="text-[#5f259f] font-black text-lg leading-none">पे</span>
              </div>
              <div>
                <span className="font-extrabold text-base tracking-wide block">PhonePe</span>
                <span className="text-[10px] text-purple-200 uppercase tracking-wider block leading-tight">
                  Accepted Here
                </span>
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-purple-900/60 border border-purple-400/30 text-[11px] font-semibold text-purple-200">
              UPI Auto-Detect
            </div>
          </div>

          {/* Amount Badge */}
          <div className="text-center mb-4 w-full bg-black/40 py-3 px-4 rounded-xl border border-purple-300/30">
            <span className="text-xs text-purple-200 block uppercase font-medium">Grand Total Due</span>
            <span className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight block my-0.5">
              {formatINR(totalAmountToPay)}
            </span>
            <span className="text-[11px] text-purple-200/90 block">
              Rent: {formatINR(rentTotal)} + Water: {formatINR(waterTotal)}
            </span>
          </div>

          {/* QR Code Container */}
          <div className="relative p-4 bg-white rounded-2xl shadow-2xl border-4 border-purple-300/50 flex flex-col items-center w-full max-w-[280px]">
            {/* View Mode switcher tabs */}
            <div className="w-full flex items-center justify-center gap-1 mb-2.5 p-1 bg-purple-100/90 rounded-lg border border-purple-200 text-xs">
              <button
                type="button"
                onClick={() => setQrMode('uploaded')}
                className={`flex-1 py-1 px-2 rounded-md font-bold transition text-[11px] ${
                  qrMode === 'uploaded'
                    ? 'bg-[#5f259f] text-white shadow'
                    : 'text-purple-900 hover:bg-purple-200'
                }`}
              >
                Exact QR Pic
              </button>
              <button
                type="button"
                onClick={() => setQrMode('scannable')}
                className={`flex-1 py-1 px-2 rounded-md font-bold transition text-[11px] ${
                  qrMode === 'scannable'
                    ? 'bg-[#5f259f] text-white shadow'
                    : 'text-purple-900 hover:bg-purple-200'
                }`}
              >
                Dynamic UPI
              </button>
            </div>

            <div className="relative w-56 h-56 rounded-xl overflow-hidden flex items-center justify-center bg-black p-2 border border-black/80">
              {qrMode === 'uploaded' ? (
                /* Exact Uploaded PhonePe QR Picture */
                <img
                  src={customQrImage || phonePeQrAsset}
                  alt="PhonePe QR Code - 9916913919@ibl"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                /* Live Generated Scannable PhonePe QR Vector */
                <div className="relative flex items-center justify-center w-full h-full bg-white rounded-lg p-1">
                  <QRCodeSVG
                    value={upiDeepLink}
                    size={200}
                    level="H"
                    includeMargin={false}
                    fgColor="#000000"
                    bgColor="#ffffff"
                  />
                  {/* Center PhonePe पे Emblem */}
                  <div className="absolute w-10 h-10 rounded-full bg-black border-2 border-white flex items-center justify-center shadow-lg">
                    <span className="text-white font-black text-base leading-none select-none">पे</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-purple-950 bg-purple-100 px-3 py-1 rounded-full border border-purple-200 text-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Scan via PhonePe, GPay, Paytm or UPI
            </div>

            {/* Direct Upload pay.jpeg button */}
            <div className="w-full mt-3 flex items-center justify-between gap-2 border-t border-purple-100 pt-2 text-[11px]">
              <label
                htmlFor="customQrUploadInput"
                className="cursor-pointer text-[#5f259f] hover:text-[#441275] font-bold underline flex items-center gap-1"
                title="Select your pay.jpeg file from device"
              >
                <span>📁 Upload / Replace Pic</span>
              </label>
              <input
                id="customQrUploadInput"
                type="file"
                accept="image/*"
                onChange={handleCustomQrUpload}
                className="hidden"
              />
              {customQrImage && (
                <button
                  type="button"
                  onClick={handleResetDefaultQr}
                  className="text-red-500 hover:text-red-700 font-semibold"
                  title="Reset to default image"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* UPI ID Copy bar */}
          <div className="w-full mt-4 bg-white/10 p-2.5 rounded-xl flex items-center justify-between border border-white/15">
            <div className="truncate text-xs">
              <span className="text-purple-300 block text-[10px]">UPI VPA Address</span>
              <span className="font-mono font-bold text-white">{upiId}</span>
            </div>
            <button
              onClick={handleCopyUpi}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-bold text-white transition shadow"
            >
              {copiedUpi ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <a
            href={upiDeepLink}
            className="w-full mt-3 py-2.5 bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs uppercase tracking-wider rounded-xl text-center shadow-lg transition"
          >
            Pay {formatINR(totalAmountToPay)} in UPI App
          </a>
        </div>

        {/* Right Column: Statement Breakdown & Proof Submission Form */}
        <div className="md:col-span-6 space-y-6">
          {/* Bill Breakdown Card */}
          <div className="bg-white/5 border border-white/15 rounded-2xl p-5 shadow-lg">
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Bill Breakdown</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white/90">
                Flat {tenantNumber} ({residentName})
              </span>
            </h3>

            <div className="space-y-2 text-sm divide-y divide-white/10">
              <div className="flex justify-between items-center pt-1">
                <span className="text-white/75">Rent Details ({tenantInfo.rentTable}):</span>
                <span className="font-bold text-white">{formatINR(rentTotal)}</span>
              </div>
              {latestRent && (latestRent.BALANCE > 0 || latestRent.PAYMENT !== latestRent.TOTAL) && (
                <div className="flex justify-between items-center text-xs text-white/60 pl-2">
                  <span>↳ Payment: {formatINR(latestRent.PAYMENT)} + Balance: {formatINR(latestRent.BALANCE)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2">
                <span className="text-white/75">Water Bill ({tenantInfo.waterTable}):</span>
                <span className="font-bold text-white">{formatINR(waterTotal)}</span>
              </div>
              {latestWater && (latestWater.BALANCE > 0 || latestWater.TOTAL_BILL !== latestWater.TOTAL) && (
                <div className="flex justify-between items-center text-xs text-white/60 pl-2">
                  <span>↳ Bill: {formatINR(latestWater.TOTAL_BILL)} + Balance: {formatINR(latestWater.BALANCE)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 text-base">
                <div>
                  <span className="font-bold text-amber-300 block">Grand Total Payable:</span>
                  <span className="text-[10px] text-white/60">From Payment Details statement</span>
                </div>
                <span className="text-xl font-black text-amber-300">{formatINR(totalAmountToPay)}</span>
              </div>
            </div>
          </div>

          {/* Payment Verification Submission Form */}
          <form onSubmit={handleSubmitProof} className="bg-white/5 border border-white/15 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2">
              Submit Payment Reference (UTR)
            </h3>
            <p className="text-xs text-white/70">
              After completing your {formatINR(totalAmountToPay)} UPI payment, enter the 12-digit UPI Reference Number / Transaction ID below so the admin can verify and update your records to PAID.
            </p>

            <div className="bg-white/10 px-3 py-2 rounded-lg border border-white/10 flex justify-between items-center text-xs">
              <span className="text-white/80">Exact Amount Paid:</span>
              <span className="font-bold text-amber-300 text-sm">{formatINR(totalAmountToPay)}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/90 mb-1">
                Payment Mode:
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full hub-input text-xs"
              >
                <option value="PhonePe UPI">PhonePe UPI</option>
                <option value="Google Pay">Google Pay (GPay)</option>
                <option value="Paytm UPI">Paytm UPI</option>
                <option value="BHIM UPI">BHIM UPI</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Cash / Cheque">Cash / Cheque Handover</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/90 mb-1">
                UPI Reference No / UTR / Transaction ID <span className="text-red-400">*</span>:
              </label>
              <input
                type="text"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                placeholder="e.g. 428190348219 or UPI/TXN-12345"
                className="w-full hub-input text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/90 mb-1">
                Optional Notes / Screenshot Reference:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Paid via ICICI bank account at 3:15 PM"
                className="w-full hub-input text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full hub-btn hub-btn-success py-3 text-sm font-bold uppercase tracking-wider shadow-lg"
            >
              Submit Proof for Verification
            </button>
          </form>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => onNavigate('paymentpage')}
              className="hub-btn px-5 py-2 text-xs"
            >
              Back to Payment Details
            </button>
            <button
              onClick={() => onNavigate(userRole === 'Admin' ? 'adminmainpage' : 'customermainpage')}
              className="hub-btn px-5 py-2 text-xs"
            >
              Back to Main Hub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
