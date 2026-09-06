import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../services/dbStore';
import { TENANT_TABLE_MAP, formatINR } from '../../data/tenantMapping';

interface InfoAllPageProps {
  onNavigate: (page: string, param?: string) => void;
  onSelectTenant?: (tenantNum: string) => void;
}

export const InfoAllPageDisplay: React.FC<InfoAllPageProps> = ({ onNavigate, onSelectTenant }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setTick((t) => t + 1);
    window.addEventListener('tenant_hub_db_updated', handleUpdate);
    return () => window.removeEventListener('tenant_hub_db_updated', handleUpdate);
  }, []);

  const handleSelectUnit = (unit: string) => {
    if (onSelectTenant) onSelectTenant(unit);
    onNavigate('infoeditpage', unit);
  };

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto my-6 p-6 sm:p-8 hub-panel">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-center tracking-wider uppercase mb-2 text-white drop-shadow-md">
        TENANT INFORMATION DIRECTORY (ADMIN)
      </h1>
      <p className="text-center text-xs text-white/80 mb-6">
        Select a tenant unit below to manage profile, lease agreement, advance deposit, and increments.
      </p>

      {/* 7 Unit Selection Buttons */}
      <div className="bg-white/5 border border-white/15 rounded-2xl p-5 mb-8 shadow-lg">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white/70 text-center mb-3">
          Direct Unit Edit Selectors (INFO_11 .. INFO_41)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {Object.keys(TENANT_TABLE_MAP).map((num) => (
            <button
              key={num}
              id={`btn${num}`}
              onClick={() => handleSelectUnit(num)}
              className="hub-btn py-3 px-2 text-xs font-bold flex flex-col items-center justify-center hover:scale-105 transition"
            >
              <span className="text-[10px] text-white/70">Flat {num}</span>
              <span className="text-sm font-black text-white">Unit {num}</span>
              <span className="text-[9px] text-emerald-300 font-mono">INFO_{num}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Comprehensive Tenant Information GridView */}
      <div className="overflow-x-auto rounded-xl border border-white/15 mb-6 shadow-xl">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-white/10 text-white text-xs uppercase tracking-wider">
              <th className="p-3 border-b border-white/10">Tenant</th>
              <th className="p-3 border-b border-white/10">Legal Name</th>
              <th className="p-3 border-b border-white/10">Phone Number</th>
              <th className="p-3 border-b border-white/10">Arrival Date</th>
              <th className="p-3 border-b border-white/10">Advance Paid</th>
              <th className="p-3 border-b border-white/10">Current Rent</th>
              <th className="p-3 border-b border-white/10">Annual Incr.</th>
              <th className="p-3 border-b border-white/10">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {Object.keys(TENANT_TABLE_MAP).map((num) => {
              const info = TENANT_TABLE_MAP[num];
              const rec = DatabaseService.getInfoRecord(num);
              return (
                <tr key={num} className="hover:bg-white/5 transition">
                  <td className="p-3 font-bold text-white">Flat {num}</td>
                  <td className="p-3 font-medium text-white/95">{rec?.NAME || info.tenantName}</td>
                  <td className="p-3 text-white/80 font-mono text-xs">{rec?.PHONE_NUMBER || info.phone}</td>
                  <td className="p-3 text-emerald-300 font-mono text-xs">{rec?.ARRIVED_DATE || '2023-01-15'}</td>
                  <td className="p-3 text-amber-300 font-semibold">{formatINR(Number(rec?.ADVANCE_PAID || 50000))}</td>
                  <td className="p-3 font-bold text-white">{formatINR(Number(rec?.CURRENT_RENT || 12000))}</td>
                  <td className="p-3 text-white/80 text-xs">+{formatINR(Number(rec?.CURRENT_INCREMENT || 600))} ({rec?.YEARLY_INCREMENT || 5}%)</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleSelectUnit(num)}
                      className="px-3 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-semibold text-white transition border border-white/20"
                    >
                      Edit Info
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-center">
        <button
          id="btnBack"
          onClick={() => onNavigate('adminmainpage')}
          className="hub-btn px-8 py-2.5 text-xs uppercase tracking-wider font-bold"
        >
          Back to Admin Hub
        </button>
      </div>
    </div>
  );
};
