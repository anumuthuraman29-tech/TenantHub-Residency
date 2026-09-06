import React, { useState, useEffect, useMemo } from 'react';
import { DatabaseService } from '../../services/dbStore';
import { getTenantTables, formatINR } from '../../data/tenantMapping';

interface CustomerInfoProps {
  tenantNumber: string;
  onNavigate: (page: string) => void;
}

export const CustomerInfoDisplay: React.FC<CustomerInfoProps> = ({ tenantNumber, onNavigate }) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setTick((t) => t + 1);
    window.addEventListener('tenant_hub_db_updated', handleUpdate);
    return () => window.removeEventListener('tenant_hub_db_updated', handleUpdate);
  }, []);

  const tenantInfo = useMemo(() => {
    try {
      return getTenantTables(tenantNumber || '11');
    } catch {
      return null;
    }
  }, [tenantNumber, tick]);

  const customerRecord = useMemo(() => {
    return DatabaseService.getInfoRecord(tenantNumber || '11');
  }, [tenantNumber, tick]);

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
    <div className="relative z-10 w-full max-w-2xl mx-auto my-8 p-6 sm:p-8 hub-panel">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-center tracking-wider uppercase mb-6 text-white drop-shadow-md">
        TENANT PROFILE & LEASE INFORMATION
      </h1>

      <div className="bg-white/5 border border-white/15 rounded-2xl p-6 mb-6 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm divide-y sm:divide-y-0 sm:gap-y-4">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-white/70 uppercase">Username / Tenant ID</span>
            <span className="text-base font-bold text-white font-mono">
              {customerRecord?.USERNAME || tenantNumber}
            </span>
          </div>

          <div className="flex flex-col pt-2 sm:pt-0">
            <span className="text-xs font-semibold text-white/70 uppercase">Full Legal Name</span>
            <span className="text-base font-bold text-white">
              {customerRecord?.NAME || tenantInfo.tenantName}
            </span>
          </div>

          <div className="flex flex-col pt-2 sm:pt-0">
            <span className="text-xs font-semibold text-white/70 uppercase">Registered Phone</span>
            <span className="text-base font-bold text-white">
              {customerRecord?.PHONE_NUMBER || tenantInfo.phone}
            </span>
          </div>

          <div className="flex flex-col pt-2 sm:pt-0">
            <span className="text-xs font-semibold text-white/70 uppercase">Arrival / Move-In Date</span>
            <span className="text-base font-bold text-emerald-300 font-mono">
              {customerRecord?.ARRIVED_DATE || '2023-01-15'}
            </span>
          </div>

          <div className="flex flex-col pt-2 sm:pt-0">
            <span className="text-xs font-semibold text-white/70 uppercase">Advance Deposit Paid</span>
            <span className="text-base font-bold text-amber-300">
              {formatINR(Number(customerRecord?.ADVANCE_PAID || 50000))}
            </span>
          </div>

          <div className="flex flex-col pt-2 sm:pt-0">
            <span className="text-xs font-semibold text-white/70 uppercase">Base Monthly Rent</span>
            <span className="text-base font-bold text-white">
              {formatINR(Number(customerRecord?.CURRENT_RENT || 12000))}
            </span>
          </div>

          <div className="flex flex-col pt-2 sm:pt-0">
            <span className="text-xs font-semibold text-white/70 uppercase">Current Annual Increment</span>
            <span className="text-base font-bold text-white">
              {formatINR(Number(customerRecord?.CURRENT_INCREMENT || 600))}
            </span>
          </div>

          <div className="flex flex-col pt-2 sm:pt-0">
            <span className="text-xs font-semibold text-white/70 uppercase">Yearly Increment Rate</span>
            <span className="text-base font-bold text-blue-200">
              {customerRecord?.YEARLY_INCREMENT || '5'} % per annum
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <button
          onClick={() => onNavigate('paymentpage')}
          className="hub-btn hub-btn-success px-6 py-2.5 text-xs font-bold"
        >
          Proceed to Payments
        </button>
        <button
          id="btnBack"
          onClick={() => onNavigate('customermainpage')}
          className="hub-btn px-6 py-2.5 text-xs font-bold"
        >
          Back
        </button>
      </div>
    </div>
  );
};
