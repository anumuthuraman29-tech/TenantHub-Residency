import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../services/dbStore';
import { TENANT_TABLE_MAP, formatINR, isPaid } from '../../data/tenantMapping';

interface WaterAllPageProps {
  onNavigate: (page: string, param?: string) => void;
  onSelectTenant?: (tenantNum: string) => void;
}

export const WaterAllPageDisplay: React.FC<WaterAllPageProps> = ({ onNavigate, onSelectTenant }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setTick((t) => t + 1);
    window.addEventListener('tenant_hub_db_updated', handleUpdate);
    return () => window.removeEventListener('tenant_hub_db_updated', handleUpdate);
  }, []);

  const handleSelectUnit = (unit: string) => {
    if (onSelectTenant) onSelectTenant(unit);
    onNavigate('wateredit', unit);
  };

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto my-6 p-6 sm:p-8 hub-panel">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-center tracking-wider uppercase mb-2 text-white drop-shadow-md">
        WATER BILL DIRECTORY & OVERVIEW (ADMIN)
      </h1>
      <p className="text-center text-xs text-white/80 mb-6">
        Select a tenant unit below to manage monthly water meter readings and billing in tables [Water_11 .. Water_41]
      </p>

      {/* 7 Unit Selection Buttons matching waterallpage.aspx */}
      <div className="bg-white/5 border border-white/15 rounded-2xl p-5 mb-8 shadow-lg">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white/70 text-center mb-3">
          Direct Water Table Selectors (Water_11 .. Water_41)
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
              <span className="text-[9px] text-blue-200 font-mono">Water_{num}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Comprehensive Water GridView */}
      <div className="overflow-x-auto rounded-xl border border-white/15 mb-6 shadow-xl">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-white/10 text-white text-xs uppercase tracking-wider">
              <th className="p-3 border-b border-white/10">Tenant</th>
              <th className="p-3 border-b border-white/10">Resident</th>
              <th className="p-3 border-b border-white/10">Table</th>
              <th className="p-3 border-b border-white/10">Current</th>
              <th className="p-3 border-b border-white/10">Previous</th>
              <th className="p-3 border-b border-white/10">Kitchen</th>
              <th className="p-3 border-b border-white/10">Bill</th>
              <th className="p-3 border-b border-white/10">Total</th>
              <th className="p-3 border-b border-white/10">Status</th>
              <th className="p-3 border-b border-white/10">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {Object.keys(TENANT_TABLE_MAP).map((num) => {
              const info = TENANT_TABLE_MAP[num];
              const residentName = DatabaseService.getTenantResidentName(num);
              const water = DatabaseService.getLatestWaterRecord(num);
              const waterTot = water?.TOTAL ?? 0;
              const wPaid = isPaid(water?.PAID);

              return (
                <tr key={num} className="hover:bg-white/5 transition">
                  <td className="p-3 font-bold text-white">Flat {num}</td>
                  <td className="p-3 text-white/90">{residentName}</td>
                  <td className="p-3 font-mono text-xs text-white/75">[{info.waterTable}]</td>
                  <td className="p-3 font-mono text-xs text-emerald-300">{water?.CURRENT_READINGS ?? '-'}</td>
                  <td className="p-3 font-mono text-xs text-white/70">{water?.PREVIOUS_READINGS ?? '-'}</td>
                  <td className="p-3">{formatINR(water?.KITCHEN ?? 0)}</td>
                  <td className="p-3">{formatINR(water?.TOTAL_BILL ?? 0)}</td>
                  <td className="p-3 font-bold text-amber-300">{formatINR(waterTot)}</td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded font-bold ${
                        wPaid
                          ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                          : 'bg-red-500/30 text-red-200 border border-red-400/40'
                      }`}
                    >
                      {water?.PAID || 'NOT PAID'}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleSelectUnit(num)}
                      className="px-3 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-semibold text-white transition border border-white/20"
                    >
                      Edit Water
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
