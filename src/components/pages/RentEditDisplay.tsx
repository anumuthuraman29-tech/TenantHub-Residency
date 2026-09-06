import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DatabaseService } from '../../services/dbStore';
import { RentRecord } from '../../types';
import { Cloud, RefreshCw, CheckCircle2 } from 'lucide-react';

interface RentEditDisplayProps {
  initialTenantNumber?: string;
  table?: string;
  userRole?: 'Admin' | 'Customer';
  onNavigate: (page: string, param?: string) => void;
}

const ALLOWED_TABLES = [
  'RENT_11',
  'RENT_12',
  'RENT_21',
  'RENT_22',
  'RENT_31',
  'RENT_32',
  'RENT_41',
] as const;

type AllowedTable = typeof ALLOWED_TABLES[number];

function sanitizeTable(input?: string): AllowedTable {
  if (!input) return 'RENT_11';
  let clean = input.trim().toUpperCase();
  if (!clean.startsWith('RENT_')) {
    clean = `RENT_${clean}`;
  }
  if (ALLOWED_TABLES.includes(clean as AllowedTable)) {
    return clean as AllowedTable;
  }
  return 'RENT_11';
}

function calculateDayOfWeek(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return '';
  
  const d = new Date(year, month, day);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[d.getDay()] || '';
}

export const RentEditDisplay: React.FC<RentEditDisplayProps> = ({
  initialTenantNumber,
  table,
  userRole = 'Admin',
  onNavigate,
}) => {
  // Authentication check: Must be Admin
  const isAdmin = userRole === 'Admin';

  useEffect(() => {
    if (!isAdmin) {
      onNavigate('adminloginpage');
    }
  }, [isAdmin, onNavigate]);

  // Determine current active table (context)
  const initialTable = sanitizeTable(table || initialTenantNumber);
  const [activeTable, setActiveTable] = useState<AllowedTable>(initialTable);

  // Table records
  const [records, setRecords] = useState<RentRecord[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string | number | null>(null);

  // Status/Alert Message
  const [message, setMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState<boolean>(false);

  const handleSyncSupabase = async () => {
    setIsSyncingSupabase(true);
    try {
      const result = await DatabaseService.pushAllToSupabase();
      if (result.success) {
        setMessage({
          text: `Direct sync complete! Synced ${result.rentCount} rent records and ${result.waterCount} water records directly to Supabase.`,
          isError: false,
        });
      } else {
        setMessage({
          text: `Supabase sync alert: ${result.error || 'Check network connection'}`,
          isError: true,
        });
      }
    } catch (e: any) {
      setMessage({
        text: `Sync error: ${e?.message || 'Failed to sync with Supabase'}`,
        isError: true,
      });
    } finally {
      setIsSyncingSupabase(false);
      loadRecords(activeTable);
    }
  };

  // Form Fields State (in exact order: Date, Day, Payment, Balance, Total, Mode of Payment, Paid)
  const [date, setDate] = useState<string>('');
  const [day, setDay] = useState<string>('');
  const [payment, setPayment] = useState<string>('');
  const [balance, setBalance] = useState<string>('0.00');
  const [total, setTotal] = useState<string>('0.00');
  const [modeOfPayment, setModeOfPayment] = useState<string>('');
  const [paid, setPaid] = useState<string>('PAID');

  // Load records for active table
  const loadRecords = useCallback((tableName: AllowedTable) => {
    const data = DatabaseService.getRentRecordsByTable(tableName);
    setRecords(data);
  }, []);

  // Initialize and reload on table switch
  useEffect(() => {
    loadRecords(activeTable);
    handleClear();
    setMessage(null);
  }, [activeTable, loadRecords]);

  // Compute Outstanding Balance for NEW entry (sum of unpaid records)
  const getCalculatedOutstandingBalance = useCallback((): number => {
    return DatabaseService.getOutstandingRentBalance(activeTable);
  }, [activeTable]);

  // Automatically update Day whenever Date changes
  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    const dayOfWeek = calculateDayOfWeek(newDate);
    setDay(dayOfWeek);
  };

  // Update Total = Payment + Balance client-side
  const updateCalculations = (newPaymentStr: string, currentBalanceStr: string) => {
    const p = parseFloat(newPaymentStr);
    const b = parseFloat(currentBalanceStr);
    const payVal = isNaN(p) ? 0 : p;
    const balVal = isNaN(b) ? 0 : b;
    const tot = (payVal + balVal).toFixed(2);
    setTotal(tot);
  };

  const handlePaymentChange = (newPayment: string) => {
    setPayment(newPayment);
    updateCalculations(newPayment, balance);
  };

  // Reset form fields
  const handleClear = () => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    setDay(calculateDayOfWeek(today));
    setPayment('');
    
    // When clearing for a fresh new record, set balance to outstanding unpaid sum
    const outstanding = getCalculatedOutstandingBalance();
    const balStr = outstanding.toFixed(2);
    setBalance(balStr);
    setTotal((0 + outstanding).toFixed(2));
    
    setModeOfPayment('UPI / PhonePe');
    setPaid('PAID');
    setSelectedRecordId(null);
  };

  // Select a row from the table
  const handleSelectRow = (record: RentRecord) => {
    const recordId = record.id ?? record.DATE;
    setSelectedRecordId(recordId);

    setDate(record.DATE);
    setDay(record.DAY || calculateDayOfWeek(record.DATE));
    
    const payStr = (record.PAYMENT ?? 0).toFixed(2);
    const balStr = (record.BALANCE ?? 0).toFixed(2);
    const totStr = (record.TOTAL ?? 0).toFixed(2);
    
    setPayment(payStr);
    setBalance(balStr);
    setTotal(totStr);
    
    setModeOfPayment(record['MODE OF PAYMENT'] || '');
    setPaid((record.PAID || 'PAID').toUpperCase());

    setMessage({
      text: `Selected rent record for ${record.DATE} (${activeTable})`,
      isError: false,
    });
  };

  // Add Button Handler
  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!date) {
      setMessage({ text: 'Please select a valid Date.', isError: true });
      return;
    }

    const payVal = parseFloat(payment);
    if (isNaN(payVal) || payVal < 0) {
      setMessage({ text: 'Please enter a valid Payment amount.', isError: true });
      return;
    }

    const currentDay = day || calculateDayOfWeek(date);
    const outstanding = getCalculatedOutstandingBalance();
    const finalBalance = outstanding;
    const finalTotal = payVal + finalBalance;
    const normalizedPaid = (paid.trim() || 'NOT PAID').toUpperCase();
    const normalizedMode = modeOfPayment.trim() || 'UPI';

    // Insert and trigger chronological balance recalculation
    DatabaseService.insertRentRecord(activeTable, {
      DATE: date,
      DAY: currentDay,
      PAYMENT: payVal,
      BALANCE: finalBalance,
      TOTAL: finalTotal,
      'MODE OF PAYMENT': normalizedMode,
      PAID: normalizedPaid,
    });

    setMessage({
      text: `Rent record for ${date} added and synced with Supabase for [${activeTable}]!`,
      isError: false,
    });

    loadRecords(activeTable);
    handleClear();
  };

  // Update Button Handler
  const handleUpdate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedRecordId) {
      setMessage({
        text: 'Please select a record from the table first using the "Select" button.',
        isError: true,
      });
      return;
    }

    if (!date) {
      setMessage({ text: 'Please select a valid Date.', isError: true });
      return;
    }

    const payVal = parseFloat(payment);
    if (isNaN(payVal) || payVal < 0) {
      setMessage({ text: 'Please enter a valid Payment amount.', isError: true });
      return;
    }

    const currentDay = day || calculateDayOfWeek(date);
    const normalizedPaid = (paid.trim() || 'NOT PAID').toUpperCase();
    const normalizedMode = modeOfPayment.trim() || 'UPI';

    // Update and recalculate balances chronologically
    DatabaseService.updateRentRecord(activeTable, selectedRecordId, {
      DATE: date,
      DAY: currentDay,
      PAYMENT: payVal,
      'MODE OF PAYMENT': normalizedMode,
      PAID: normalizedPaid,
    });

    setMessage({
      text: `Rent record updated and synced with Supabase in [${activeTable}]!`,
      isError: false,
    });

    loadRecords(activeTable);
    handleClear();
  };

  // Delete Button Handler
  const handleDelete = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedRecordId) {
      setMessage({
        text: 'Please select a record from the table first to delete.',
        isError: true,
      });
      return;
    }

    DatabaseService.deleteRentRecord(activeTable, selectedRecordId);

    setMessage({
      text: `Rent record deleted and synchronized with Supabase for [${activeTable}]!`,
      isError: false,
    });

    loadRecords(activeTable);
    handleClear();
  };

  if (!isAdmin) {
    return (
      <div className="relative z-10 w-full max-w-md mx-auto my-12 p-8 hub-panel text-center">
        <h2 className="text-xl font-bold mb-2 text-white">Administrator Access Required</h2>
        <p className="text-sm text-white/80 mb-6">
          You must be logged in with administrator credentials to access the Rent Edit portal.
        </p>
        <button
          onClick={() => onNavigate('adminloginpage')}
          className="hub-btn hub-btn-primary px-6 py-2.5 font-semibold text-white shadow-lg transition"
        >
          Go to Admin Login
        </button>
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto my-4 sm:my-6 p-3.5 sm:p-6 lg:p-8 hub-panel">
      {/* Main Container Content */}
      <div>
        {/* Header Bar: Top-Left RENT EDIT Heading, Top-Right Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h1
              id="rent-edit-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-wider uppercase text-white drop-shadow-md"
            >
              RENT EDIT
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-xs text-white/80 font-semibold uppercase tracking-wide">
                Active Ledger:
              </span>
              <span className="bg-white/15 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold text-amber-300 border border-white/20">
                [{activeTable}] — {DatabaseService.getTenantResidentName(activeTable.replace('RENT_', ''))}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 self-stretch sm:self-auto justify-end">
            <button
              id="btnSyncSupabase"
              type="button"
              onClick={handleSyncSupabase}
              disabled={isSyncingSupabase}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-400/40 text-emerald-100 text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer min-h-[42px] whitespace-nowrap"
              title="Sync all local records directly to Supabase cloud database"
            >
              {isSyncingSupabase ? (
                <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
              ) : (
                <Cloud className="w-4 h-4 text-emerald-300 shrink-0" />
              )}
              <span>{isSyncingSupabase ? 'Syncing...' : 'Sync Supabase'}</span>
            </button>

            <button
              id="btnBack"
              type="button"
              onClick={() => onNavigate('rentallpage')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-2.5 font-semibold text-xs sm:text-sm text-white hub-btn hub-btn-primary shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer min-h-[42px] whitespace-nowrap"
            >
              Back
            </button>
          </div>
        </div>

        {/* Table Selector Pills */}
        <div className="bg-white/5 border border-white/15 rounded-2xl p-3 sm:p-4 mb-6 backdrop-blur-md shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <span className="text-xs font-bold text-white/80 uppercase tracking-wider px-1 shrink-0">
              Select Table:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:flex md:flex-wrap items-center gap-2 w-full md:w-auto">
              {ALLOWED_TABLES.map((tName) => {
                const isActive = activeTable === tName;
                const unitNum = tName.replace('RENT_', '');
                return (
                  <button
                    key={tName}
                    type="button"
                    onClick={() => setActiveTable(tName)}
                    className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all duration-150 text-center flex items-center justify-center gap-1 cursor-pointer ${
                      isActive
                        ? 'hub-btn-primary text-white border border-white/40 shadow-md scale-102'
                        : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
                    }`}
                  >
                    <span>Unit {unitNum}</span>
                    <span className="text-[10px] opacity-75 font-mono">({tName})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Notification / Status Message */}
        {message && (
          <div
            id="lblMessage"
            className={`p-3.5 rounded-xl text-sm font-semibold mb-6 text-center border backdrop-blur-md shadow-md transition-all ${
              message.isError
                ? 'bg-red-500/25 text-red-100 border-red-400/50'
                : 'bg-emerald-500/25 text-emerald-100 border-emerald-400/50'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Centered Translucent / Glass-Style Form Container */}
        <div
          id="rentFormContainer"
          className="bg-white/5 border border-white/15 rounded-2xl p-5 sm:p-7 mb-8 shadow-xl transition-all"
        >
          <div className="mb-4 flex items-center justify-between border-b border-white/15 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/90">
              {selectedRecordId ? `Editing Record (${date})` : 'New Rent Record Entry'}
            </h2>
            {selectedRecordId && (
              <span className="text-xs bg-amber-400/20 text-amber-200 px-2.5 py-1 rounded-full border border-amber-400/30 font-semibold">
                Selected for Update / Delete
              </span>
            )}
          </div>

          <form onSubmit={handleAdd}>
            {/* 7 Required Form Fields in Exact Order */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {/* 1. Date */}
              <div className="flex flex-col">
                <label
                  htmlFor="txtDate"
                  className="text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider"
                >
                  1. Date <span className="text-pink-300">*</span>
                </label>
                <input
                  id="txtDate"
                  type="date"
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  required
                  className="w-full hub-input"
                />
              </div>

              {/* 2. Day (Read-only, auto-populated) */}
              <div className="flex flex-col">
                <label
                  htmlFor="txtDay"
                  className="text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider"
                >
                  2. Day (Auto)
                </label>
                <input
                  id="txtDay"
                  type="text"
                  value={day}
                  readOnly
                  tabIndex={-1}
                  className="w-full hub-input opacity-70 cursor-not-allowed font-medium"
                />
              </div>

              {/* 3. Payment */}
              <div className="flex flex-col">
                <label
                  htmlFor="txtPayment"
                  className="text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider"
                >
                  3. Payment (₹) <span className="text-pink-300">*</span>
                </label>
                <input
                  id="txtPayment"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={payment}
                  onChange={(e) => handlePaymentChange(e.target.value)}
                  required
                  className="w-full hub-input font-mono"
                />
              </div>

              {/* 4. Balance (Read-only / calculated) */}
              <div className="flex flex-col">
                <label
                  htmlFor="txtBalance"
                  className="text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider flex items-center justify-between"
                >
                  <span>4. Balance (₹)</span>
                  <span className="text-[10px] text-amber-300 font-normal">Unpaid Previous</span>
                </label>
                <input
                  id="txtBalance"
                  type="text"
                  value={balance}
                  readOnly
                  tabIndex={-1}
                  className="w-full hub-input opacity-80 text-amber-300 cursor-not-allowed font-mono font-semibold"
                />
              </div>

              {/* 5. Total (Read-only / calculated Total = Payment + Balance) */}
              <div className="flex flex-col">
                <label
                  htmlFor="txtTotal"
                  className="text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider flex items-center justify-between"
                >
                  <span>5. Total (₹)</span>
                  <span className="text-[10px] text-emerald-300 font-normal">Pay + Bal</span>
                </label>
                <input
                  id="txtTotal"
                  type="text"
                  value={total}
                  readOnly
                  tabIndex={-1}
                  className="w-full hub-input opacity-90 text-emerald-300 cursor-not-allowed font-mono font-bold"
                />
              </div>

              {/* 6. Mode of Payment */}
              <div className="flex flex-col">
                <label
                  htmlFor="txtMode"
                  className="text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider"
                >
                  6. Mode of Payment
                </label>
                <input
                  id="txtMode"
                  type="text"
                  placeholder="e.g. PhonePe UPI, Net Banking"
                  value={modeOfPayment}
                  onChange={(e) => setModeOfPayment(e.target.value)}
                  className="w-full hub-input"
                />
              </div>

              {/* 7. Paid (Status text input: PAID / NOT PAID) */}
              <div className="flex flex-col sm:col-span-2 md:col-span-1 lg:col-span-2">
                <label
                  htmlFor="txtPaid"
                  className="text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider flex items-center justify-between"
                >
                  <span>7. Paid Status</span>
                  <span className="text-[10px] text-white/70">PAID / NOT PAID</span>
                </label>
                <div className="flex items-center gap-2 w-full">
                  <input
                    id="txtPaid"
                    type="text"
                    placeholder="PAID or NOT PAID"
                    value={paid}
                    onChange={(e) => setPaid(e.target.value.toUpperCase())}
                    className="flex-1 min-w-0 h-11 hub-input font-bold uppercase tracking-wider text-xs sm:text-sm"
                  />
                  {/* Quick Toggle Buttons for Convenience */}
                  <button
                    type="button"
                    onClick={() => setPaid('PAID')}
                    className="h-11 px-3 sm:px-4 text-xs font-bold rounded-xl border border-emerald-400 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all whitespace-nowrap shrink-0 flex items-center justify-center"
                  >
                    PAID
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaid('NOT PAID')}
                    className="h-11 px-3 sm:px-4 text-xs font-bold rounded-xl border border-rose-400 bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all whitespace-nowrap shrink-0 flex items-center justify-center"
                  >
                    NOT PAID
                  </button>
                </div>
              </div>
            </div>

            {/* Form Action Buttons: Add, Update, Delete, Clear */}
            <div className="pt-4 border-t border-white/10 mt-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                <button
                  id="btnAdd"
                  type="submit"
                  className="w-full hub-btn hub-btn-primary min-h-[44px] py-2.5 px-4 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  ADD RECORD
                </button>

                <button
                  id="btnUpdate"
                  type="button"
                  onClick={handleUpdate}
                  className="w-full hub-btn hub-btn-primary min-h-[44px] py-2.5 px-4 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  UPDATE
                </button>

                <button
                  id="btnDelete"
                  type="button"
                  onClick={handleDelete}
                  className="w-full hub-btn hub-btn-danger min-h-[44px] py-2.5 px-4 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  DELETE
                </button>

                <button
                  id="btnClear"
                  type="button"
                  onClick={handleClear}
                  className="w-full hub-btn min-h-[44px] py-2.5 px-4 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center border border-white/20 bg-white/10 hover:bg-white/20 text-white shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  CLEAR FORM
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Rent Record Table (GridView equivalent) */}
        <div className="bg-white/5 border border-white/15 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="px-4 sm:px-5 py-3.5 bg-white/10 border-b border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Rent Ledger Records — Table [{activeTable}]
            </h3>
            <span className="text-xs text-white/80">
              Total Records: <strong>{records.length}</strong> (Processed in Date Order)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table id="gvRent" className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-white/10 text-white text-xs uppercase tracking-wider font-semibold border-b border-white/15">
                  <th className="py-3 px-4 text-center">1. Select</th>
                  <th className="py-3 px-4">2. Date</th>
                  <th className="py-3 px-4">3. Day</th>
                  <th className="py-3 px-4 text-right">4. Payment (₹)</th>
                  <th className="py-3 px-4 text-right">5. Balance (₹)</th>
                  <th className="py-3 px-4 text-right">6. Total (₹)</th>
                  <th className="py-3 px-4">7. Mode of Payment</th>
                  <th className="py-3 px-4 text-center">8. Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-white/60 text-sm italic">
                      No rent records found for table [{activeTable}]. Use the form above to add a new record.
                    </td>
                  </tr>
                ) : (
                  records.map((r, idx) => {
                    const recordId = r.id ?? r.DATE;
                    const isSelected = selectedRecordId === recordId;
                    const isRecordPaid = (r.PAID || '').trim().toUpperCase() === 'PAID';

                    return (
                      <tr
                        key={recordId || idx}
                        className={`transition-colors duration-150 ${
                          isSelected
                            ? 'bg-white/20 font-semibold'
                            : idx % 2 === 0
                            ? 'bg-transparent hover:bg-white/5'
                            : 'bg-white/[0.02] hover:bg-white/5'
                        }`}
                      >
                        {/* 1. Select */}
                        <td className="py-2.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleSelectRow(r)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition shadow-sm ${
                              isSelected
                                ? 'bg-amber-400 text-amber-950 hover:bg-amber-300'
                                : 'hub-btn px-2.5 py-0.5 text-xs'
                            }`}
                          >
                            {isSelected ? '✓ Active' : 'Select'}
                          </button>
                        </td>

                        {/* 2. Date */}
                        <td className="py-2.5 px-4 font-mono font-medium text-white whitespace-nowrap">
                          {r.DATE}
                        </td>

                        {/* 3. Day */}
                        <td className="py-2.5 px-4 text-white/80 whitespace-nowrap">
                          {r.DAY}
                        </td>

                        {/* 4. Payment */}
                        <td className="py-2.5 px-4 text-right font-mono text-white whitespace-nowrap">
                          {Number(r.PAYMENT ?? 0).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>

                        {/* 5. Balance */}
                        <td className="py-2.5 px-4 text-right font-mono text-amber-300 whitespace-nowrap">
                          {Number(r.BALANCE ?? 0).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>

                        {/* 6. Total */}
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-300 whitespace-nowrap">
                          {Number(r.TOTAL ?? 0).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>

                        {/* 7. Mode of Payment */}
                        <td className="py-2.5 px-4 text-white/90 whitespace-nowrap">
                          {r['MODE OF PAYMENT'] || '—'}
                        </td>

                        {/* 8. Paid */}
                        <td className="py-2.5 px-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider ${
                              isRecordPaid
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                            }`}
                          >
                            {r.PAID || 'NOT PAID'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
