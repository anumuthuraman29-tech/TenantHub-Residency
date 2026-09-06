import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../services/dbStore';
import { TENANT_TABLE_MAP, getTenantTables, formatINR } from '../../data/tenantMapping';
import { CustomerInfoRecord } from '../../types';

interface InfoEditDisplayProps {
  initialTenantNumber?: string;
  onNavigate: (page: string) => void;
}

export const InfoEditDisplay: React.FC<InfoEditDisplayProps> = ({
  initialTenantNumber = '11',
  onNavigate,
}) => {
  const [selectedTenant, setSelectedTenant] = useState(initialTenantNumber);
  const [records, setRecords] = useState<CustomerInfoRecord[]>([]);
  const [message, setMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Form Fields matching ASP.NET TextBoxes
  const [userName, setUserName] = useState(initialTenantNumber);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [arrivedDate, setArrivedDate] = useState('');
  const [advancePaid, setAdvancePaid] = useState('0');
  const [currentRent, setCurrentRent] = useState('0');
  const [currentIncrement, setCurrentIncrement] = useState('0');
  const [yearlyIncrement, setYearlyIncrement] = useState('5');
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  const loadData = () => {
    try {
      const list = DatabaseService.getInfoRecords(selectedTenant);
      setRecords(list);
      if (list.length > 0) {
        populateForm(list[0]);
      } else {
        clearForm();
      }
    } catch (e: any) {
      setMessage({ text: e.message, isError: true });
    }
  };

  useEffect(() => {
    loadData();
    setMessage(null);
  }, [selectedTenant]);

  const populateForm = (r: CustomerInfoRecord) => {
    setSelectedId(r.id || r.USERNAME);
    setUserName(r.USERNAME);
    setName(r.NAME);
    setPhoneNumber(r.PHONE_NUMBER);
    setArrivedDate(r.ARRIVED_DATE);
    setAdvancePaid(String(r.ADVANCE_PAID));
    setCurrentRent(String(r.CURRENT_RENT));
    setCurrentIncrement(String(r.CURRENT_INCREMENT));
    setYearlyIncrement(String(r.YEARLY_INCREMENT));
  };

  const clearForm = () => {
    setUserName(selectedTenant);
    setName('');
    setPhoneNumber('');
    setArrivedDate(new Date().toISOString().split('T')[0]);
    setAdvancePaid('0');
    setCurrentRent('0');
    setCurrentIncrement('0');
    setYearlyIncrement('5');
    setSelectedId(null);
  };

  const handleSelectRow = (r: CustomerInfoRecord) => {
    populateForm(r);
    setMessage({ text: `Loaded info record for ${r.NAME} (${r.USERNAME})` });
  };

  const handleInsert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !name.trim()) {
      setMessage({ text: 'Username and Name are required.', isError: true });
      return;
    }

    DatabaseService.insertInfoRecord(selectedTenant, {
      USERNAME: userName.trim(),
      NAME: name.trim(),
      PHONE_NUMBER: phoneNumber.trim(),
      ARRIVED_DATE: arrivedDate,
      ADVANCE_PAID: parseFloat(advancePaid) || 0,
      CURRENT_RENT: parseFloat(currentRent) || 0,
      CURRENT_INCREMENT: parseFloat(currentIncrement) || 0,
      YEARLY_INCREMENT: parseFloat(yearlyIncrement) || 0,
    });

    setMessage({ text: `Tenant info record for [${name}] inserted into [INFO_${selectedTenant}]!` });
    loadData();
  };

  const handleUpdate = () => {
    if (!selectedId) {
      setMessage({ text: 'Select a record to update or insert a new one.', isError: true });
      return;
    }

    DatabaseService.updateInfoRecord(selectedTenant, selectedId, {
      USERNAME: userName.trim(),
      NAME: name.trim(),
      PHONE_NUMBER: phoneNumber.trim(),
      ARRIVED_DATE: arrivedDate,
      ADVANCE_PAID: parseFloat(advancePaid) || 0,
      CURRENT_RENT: parseFloat(currentRent) || 0,
      CURRENT_INCREMENT: parseFloat(currentIncrement) || 0,
      YEARLY_INCREMENT: parseFloat(yearlyIncrement) || 0,
    });

    setMessage({ text: `Tenant info updated successfully in [INFO_${selectedTenant}]!` });
    loadData();
  };

  const handleDelete = () => {
    if (!selectedId) {
      setMessage({ text: 'Select a record from the table first to delete.', isError: true });
      return;
    }
    DatabaseService.deleteInfoRecord(selectedTenant, selectedId);
    setMessage({ text: `Record deleted from [INFO_${selectedTenant}]!` });
    loadData();
    clearForm();
  };

  const tenantInfo = getTenantTables(selectedTenant);

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto my-6 p-6 hub-panel">
      <h2 className="text-xl sm:text-2xl font-bold text-center tracking-wider uppercase mb-2 text-white">
        TENANT INFORMATION MANAGEMENT (INFO_{selectedTenant})
      </h2>
      <p className="text-center text-xs text-white/80 mb-6">
        ASP.NET Code-Behind Simulation for Table: <strong className="text-white">[{tenantInfo.infoTable}]</strong>
      </p>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm text-center mb-4 font-semibold ${
            message.isError
              ? 'bg-red-500/20 text-red-200 border border-red-400'
              : 'bg-emerald-500/20 text-emerald-200 border border-emerald-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Form Fields corresponding to ASP.NET TextBoxes */}
      <form onSubmit={handleInsert} className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6 shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1">
              Select Info Table:
            </label>
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="w-full hub-input"
            >
              {Object.keys(TENANT_TABLE_MAP).map((num) => (
                <option key={num} value={num}>
                  Tenant {num} (INFO_{num})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1">txtUserName:</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. 11"
              className="w-full hub-input"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1">txtName:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full hub-input"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1">txtPhoneNumber:</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full hub-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1">txtArrivedDate:</label>
            <input
              type="date"
              value={arrivedDate}
              onChange={(e) => setArrivedDate(e.target.value)}
              className="w-full hub-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1">txtAdvancePaid (₹):</label>
            <input
              type="number"
              value={advancePaid}
              onChange={(e) => setAdvancePaid(e.target.value)}
              placeholder="0.00"
              className="w-full hub-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1">txtCurrentRent (₹):</label>
            <input
              type="number"
              value={currentRent}
              onChange={(e) => {
                setCurrentRent(e.target.value);
                const rentVal = parseFloat(e.target.value) || 0;
                const incPct = parseFloat(yearlyIncrement) || 5;
                setCurrentIncrement(String((rentVal * incPct) / 100));
              }}
              placeholder="0.00"
              className="w-full hub-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1">txtCurrentIncrement (₹):</label>
            <input
              type="number"
              value={currentIncrement}
              onChange={(e) => setCurrentIncrement(e.target.value)}
              placeholder="0.00"
              className="w-full hub-input"
            />
          </div>
        </div>

        {/* Buttons corresponding to ASP.NET btnAdd, btnUpdate, btnDelete, btnClear, btnBack */}
        <div className="flex flex-wrap gap-2.5 justify-center pt-2">
          <button type="submit" id="btnAdd" className="hub-btn px-5 py-2 text-xs font-bold">
            Add Record
          </button>
          <button
            type="button"
            id="btnUpdate"
            onClick={handleUpdate}
            className="hub-btn px-5 py-2 text-xs font-bold"
          >
            Update Record
          </button>
          <button
            type="button"
            id="btnDelete"
            onClick={handleDelete}
            className="hub-btn hub-btn-danger px-5 py-2 text-xs font-bold"
          >
            Delete Record
          </button>
          <button
            type="button"
            id="btnClear"
            onClick={clearForm}
            className="hub-btn px-5 py-2 text-xs font-bold"
          >
            Clear Form
          </button>
          <button
            type="button"
            id="btnBack"
            onClick={() => onNavigate('infoallpage')}
            className="hub-btn px-5 py-2 text-xs font-bold"
          >
            Back to Info Directory
          </button>
        </div>
      </form>

      {/* GridView: gvInfo */}
      <div className="overflow-x-auto rounded-xl border border-white/15 shadow-xl">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-white/10 text-white text-xs uppercase tracking-wider">
              <th className="p-3 border-b border-white/10">Action</th>
              <th className="p-3 border-b border-white/10">USERNAME</th>
              <th className="p-3 border-b border-white/10">NAME</th>
              <th className="p-3 border-b border-white/10">PHONE NUMBER</th>
              <th className="p-3 border-b border-white/10">ARRIVED DATE</th>
              <th className="p-3 border-b border-white/10">ADVANCE PAID</th>
              <th className="p-3 border-b border-white/10">CURRENT RENT</th>
              <th className="p-3 border-b border-white/10">INCREMENT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {records.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-white/50">
                  No records found in table [{tenantInfo.infoTable}].
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr
                  key={r.id || r.USERNAME}
                  className={`hover:bg-white/5 transition ${
                    selectedId === (r.id || r.USERNAME) ? 'bg-white/10' : ''
                  }`}
                >
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => handleSelectRow(r)}
                      className="text-xs px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded text-white font-semibold"
                    >
                      Select
                    </button>
                  </td>
                  <td className="p-3 font-mono font-bold text-white">{r.USERNAME}</td>
                  <td className="p-3 text-white/95 font-medium">{r.NAME}</td>
                  <td className="p-3 text-white/80 font-mono text-xs">{r.PHONE_NUMBER}</td>
                  <td className="p-3 text-emerald-300 font-mono text-xs">{r.ARRIVED_DATE}</td>
                  <td className="p-3 text-amber-300 font-medium">{formatINR(Number(r.ADVANCE_PAID))}</td>
                  <td className="p-3 font-bold text-white">{formatINR(Number(r.CURRENT_RENT))}</td>
                  <td className="p-3 text-white/80 text-xs">
                    +{formatINR(Number(r.CURRENT_INCREMENT))} ({r.YEARLY_INCREMENT}%)
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
