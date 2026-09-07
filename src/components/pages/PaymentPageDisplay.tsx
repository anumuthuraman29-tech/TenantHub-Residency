import React, { useState, useEffect, useMemo } from 'react';
import { DatabaseService } from '../../services/dbStore';
import { getTenantTables, isPaid, formatINR } from '../../data/tenantMapping';

interface PaymentPageDisplayProps {
  tenantNumber: string;
  onNavigate: (page: string) => void;
  userRole?: 'Admin' | 'Customer';
}

export const PaymentPageDisplay: React.FC<PaymentPageDisplayProps> = ({
  tenantNumber,
  onNavigate,
  userRole,
}) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setTick((t) => t + 1);
    window.addEventListener('tenant_hub_db_updated', handleUpdate);
    DatabaseService.syncFromSupabase().catch(() => {});
    return () => window.removeEventListener('tenant_hub_db_updated', handleUpdate);
  }, []);

  const tenantInfo = useMemo(() => {
    try {
      return getTenantTables(tenantNumber);
    } catch {
      return null;
    }
  }, [tenantNumber, tick]);

  const latestRent = useMemo(() => {
    if (!tenantNumber) return null;
    return DatabaseService.getLatestRentRecord(tenantNumber);
  }, [tenantNumber, tick]);

  const latestWater = useMemo(() => {
    if (!tenantNumber) return null;
    return DatabaseService.getLatestWaterRecord(tenantNumber);
  }, [tenantNumber, tick]);

  const billSummary = useMemo(() => {
    return DatabaseService.getTenantPaymentSummary(tenantNumber || '11');
  }, [tenantNumber, tick]);

  const {
    isRentPaid,
    isWaterPaid,
    rentOutstanding,
    waterOutstanding,
    grandTotal,
    isOverallPaid,
    status: overallStatus,
    pendingSubmission: pendingPayment,
  } = billSummary;

  const rentTotal = latestRent?.TOTAL ?? 0;
  const waterTotal = latestWater?.TOTAL ?? 0;
  const residentName = DatabaseService.getTenantResidentName(tenantNumber || '11');

  if (!tenantInfo) {
    return (
      <div className="relative z-10 max-w-lg mx-auto mt-20 p-8 hub-panel text-center">
        <h2 className="text-xl font-bold text-red-300 mb-4">Invalid Tenant Number</h2>
        <p className="text-sm text-white/90 mb-6">
          No matching tables found for tenant suffix: &apos;{tenantNumber}&apos;.
        </p>
        <button onClick={() => onNavigate('customerloginpage')} className="hub-btn px-6 py-2">
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full max-w-4xl mx-auto my-6 p-6 sm:p-8 hub-panel">
      {/* Centered Page Title */}
      <h1 className="header-title">
        PAYMENT DETAILS
      </h1>

      {/* Centered Payment Status Box */}
      <div className={`status-box ${isOverallPaid ? 'status-box-paid' : 'status-box-unpaid'}`}>
        <div className="status-label">Payment Status</div>
        <div className={isOverallPaid ? 'status-value-paid' : 'status-value-unpaid'}>
          {isOverallPaid ? 'PAID' : 'NOT PAID'}
        </div>
      </div>

      {/* Two Column Grid: Left = Water Details, Right = Rent Details */}
      <div className="details-grid">
        {/* Left Panel: Water Bill Details */}
        <div className="panel">
          <h2 className="panel-title">
            Water Bill Details ({tenantInfo.waterTable})
          </h2>

          <div className="space-y-1">
            <div className="data-row">
              <span className="data-label">DATE</span>
              <span className="data-value">{latestWater ? latestWater.DATE : '-'}</span>
            </div>
            <div className="data-row">
              <span className="data-label">DAY</span>
              <span className="data-value">{latestWater ? latestWater.DAY : '-'}</span>
            </div>
            <div className="data-row">
              <span className="data-label">CURRENT READINGS</span>
              <span className="data-value font-mono">{latestWater ? latestWater.CURRENT_READINGS : '-'}</span>
            </div>
            <div className="data-row">
              <span className="data-label">PREVIOUS READINGS</span>
              <span className="data-value font-mono">{latestWater ? latestWater.PREVIOUS_READINGS : '-'}</span>
            </div>
            <div className="data-row">
              <span className="data-label">KITCHEN</span>
              <span className="data-value">{latestWater ? formatINR(latestWater.KITCHEN) : '-'}</span>
            </div>
            <div className="data-row">
              <span className="data-label">TOTAL BILL</span>
              <span className="data-value">{latestWater ? formatINR(latestWater.TOTAL_BILL) : '-'}</span>
            </div>
            <div className="data-row">
              <span className="data-label">BALANCE</span>
              <span className="data-value">{latestWater ? formatINR(latestWater.BALANCE) : '-'}</span>
            </div>
            <div className="data-row">
              <span className="data-label">TOTAL</span>
              <span className="data-value font-bold text-white/95">{latestWater ? formatINR(latestWater.TOTAL) : '-'}</span>
            </div>
            <div className="data-row border-none">
              <span className="data-label">PAID</span>
              <span
                className={`data-value px-2.5 py-0.5 rounded text-xs ${
                  isWaterPaid ? 'bg-emerald-500/30 text-emerald-200 font-bold border border-emerald-400/40' : 'bg-red-500/30 text-red-200 font-bold border border-red-400/40'
                }`}
              >
                {latestWater ? latestWater.PAID : 'NO RECORD'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Panel: Rent Details */}
        <div className="panel">
          <h2 className="panel-title">
            Rent Details ({tenantInfo.rentTable})
          </h2>

          <div className="space-y-1">
            <div className="data-row">
              <span className="data-label">DATE</span>
              <span className="data-value">{latestRent ? latestRent.DATE : '-'}</span>
            </div>
            <div className="data-row">
              <span className="data-label">DAY</span>
              <span className="data-value">{latestRent ? latestRent.DAY : '-'}</span>
            </div>
            <div className="data-row">
              <span className="data-label">PAYMENT</span>
              <span className="data-value">{latestRent ? formatINR(latestRent.PAYMENT) : '-'}</span>
            </div>
            <div className="data-row">
              <span className="data-label">BALANCE</span>
              <span className="data-value">{latestRent ? formatINR(latestRent.BALANCE) : '-'}</span>
            </div>
            <div className="data-row">
              <span className="data-label">TOTAL</span>
              <span className="data-value font-bold text-white/95">{latestRent ? formatINR(latestRent.TOTAL) : '-'}</span>
            </div>
            <div className="data-row">
              <span className="data-label">MODE OF PAYMENT</span>
              <span className="data-value">{latestRent ? latestRent['MODE OF PAYMENT'] : '-'}</span>
            </div>
            <div className="data-row border-none">
              <span className="data-label">PAID</span>
              <span
                className={`data-value px-2.5 py-0.5 rounded text-xs ${
                  isRentPaid ? 'bg-emerald-500/30 text-emerald-200 font-bold border border-emerald-400/40' : 'bg-red-500/30 text-red-200 font-bold border border-red-400/40'
                }`}
              >
                {latestRent ? latestRent.PAID : 'NO RECORD'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Centered Grand Total Box at the bottom */}
      <div className="flex justify-center mb-4">
        <div className="grand-total-box w-full max-w-md shadow-2xl">
          <div className="grand-total-label">Grand Total (Rent + Water)</div>
          <div className="grand-total-value text-amber-300">{formatINR(grandTotal)}</div>
        </div>
      </div>

      {/* Direct Action Button: Pay Now via PhonePe QR Code */}
      <div className="text-center mb-6">
        <button
          id="btnPayment"
          onClick={() => onNavigate('paypage')}
          className="hub-btn hub-btn-success py-3.5 px-8 text-base font-extrabold uppercase tracking-wider shadow-2xl animate-bounce hover:animate-none flex items-center justify-center gap-2 mx-auto"
        >
          <span className="text-xl">💳</span>
          <span>Pay {formatINR(grandTotal)} via PhonePe & UPI QR</span>
        </button>
      </div>

      {/* UPI Payment Link text */}
      <div className="upi-link text-center text-xs">
        UPI Payee: 9916913919@ibl • Instant settlement with real-time verification
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/10">
        <div className="text-xs text-white/80">
          Viewing: <span className="font-semibold text-white">Flat {tenantNumber} ({residentName})</span>
        </div>
        <button
          id="btnBack"
          onClick={() => onNavigate(userRole === 'Admin' ? 'adminmainpage' : 'customermainpage')}
          className="back-btn"
        >
          Back
        </button>
      </div>
    </div>
  );
};
