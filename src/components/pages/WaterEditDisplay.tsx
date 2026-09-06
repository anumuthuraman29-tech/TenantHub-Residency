import React, { useState, useEffect, useCallback } from 'react';
import { DatabaseService } from '../../services/dbStore';
import { WaterRecord } from '../../types';

interface WaterEditDisplayProps {
  initialTenantNumber?: string;
  table?: string;
  userRole?: 'Admin' | 'Customer';
  onNavigate: (page: string, param?: string) => void;
}

const ALLOWED_TABLES = [
  'Water_11',
  'Water_12',
  'Water_21',
  'Water_22',
  'Water_31',
  'Water_32',
  'Water_41',
] as const;

type AllowedTable = (typeof ALLOWED_TABLES)[number];

function sanitizeTable(input?: string): AllowedTable {
  if (!input) return 'Water_11';
  let clean = input.trim();
  const lower = clean.toLowerCase();
  if (lower.startsWith('water_')) {
    const suffix = clean.substring(6);
    clean = `Water_${suffix}`;
  } else {
    clean = `Water_${clean}`;
  }
  const matched = ALLOWED_TABLES.find((t) => t.toLowerCase() === clean.toLowerCase());
  return matched || 'Water_11';
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

export const WaterEditDisplay: React.FC<WaterEditDisplayProps> = ({
  initialTenantNumber,
  table,
  userRole = 'Admin',
  onNavigate,
}) => {
  // Authentication Check: Administrator Access
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
  const [records, setRecords] = useState<WaterRecord[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string | number | null>(null);

  // Status/Alert Message
  const [message, setMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Form Fields State (in exact order: 1. Date, 2. Day, 3. Rate Per Unit, 4. Current Readings, 5. Previous Readings, 6. Kitchen, 7. Total Bill, 8. Balance, 9. Paid, 10. Total)
  const [date, setDate] = useState<string>('');
  const [day, setDay] = useState<string>('');
  const [ratePerUnit, setRatePerUnit] = useState<string>('10');
  const [currentReadings, setCurrentReadings] = useState<string>('');
  const [previousReadings, setPreviousReadings] = useState<string>('');
  const [kitchen, setKitchen] = useState<string>('50');
  const [totalBill, setTotalBill] = useState<string>('0.00');
  const [balance, setBalance] = useState<string>('0.00');
  const [paid, setPaid] = useState<string>('PAID');
  const [total, setTotal] = useState<string>('0.00');

  // Load records for active table
  const loadRecords = useCallback((tableName: AllowedTable) => {
    const data = DatabaseService.getWaterRecordsByTable(tableName);
    setRecords(data);
  }, []);

  // Compute Total Bill and Total using the required calculation logic
  const calculateBillAndTotal = useCallback(
    (
      currentStr: string,
      previousStr: string,
      rateStr: string,
      kitchenStr: string,
      balanceStr: string
    ) => {
      const current = parseFloat(currentStr);
      const previous = parseFloat(previousStr);
      const rate = parseFloat(rateStr);
      const kitch = parseFloat(kitchenStr);
      const bal = parseFloat(balanceStr);

      const validRate = isNaN(rate) ? 0 : rate;
      const validKitch = isNaN(kitch) ? 0 : kitch;
      const validBal = isNaN(bal) ? 0 : bal;

      let bill = 0;
      if (!isNaN(current) && !isNaN(previous)) {
        let currentCalc = current * 10;
        let previousCalc = previous * 10;

        if (currentCalc < previousCalc) {
          const temp = currentCalc;
          currentCalc = previousCalc;
          previousCalc = temp;
        }

        const unitsUsed = currentCalc - previousCalc;
        bill = unitsUsed * validRate + validKitch;
      } else if (!isNaN(current) && isNaN(previous)) {
        bill = validKitch;
      } else {
        bill = validKitch;
      }

      const billFormatted = bill.toFixed(2);
      const totalFormatted = (bill + validBal).toFixed(2);

      return {
        totalBill: billFormatted,
        total: totalFormatted,
      };
    },
    []
  );

  // Clear Form handler and load latest Current Reading as next Previous Reading
  const handleClear = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    setDay(calculateDayOfWeek(today));
    setRatePerUnit('10');
    setCurrentReadings('');

    // Load latest Current Reading from the selected water table as the Previous Reading
    const latestCurrent = DatabaseService.getLatestWaterCurrentReading(activeTable);
    const prevReadingStr = latestCurrent !== null ? String(latestCurrent) : '';
    setPreviousReadings(prevReadingStr);

    setKitchen('50');

    // Get outstanding balance (sum of TOTAL_BILL where PAID is NOT PAID)
    const outstanding = DatabaseService.getOutstandingWaterBalance(activeTable);
    const balStr = outstanding.toFixed(2);
    setBalance(balStr);

    setPaid('PAID');
    setSelectedRecordId(null);

    const { totalBill: calcBill, total: calcTotal } = calculateBillAndTotal(
      '',
      prevReadingStr,
      '10',
      '50',
      balStr
    );
    setTotalBill(calcBill);
    setTotal(calcTotal);
  }, [activeTable, calculateBillAndTotal]);

  // Initialize and reload on table switch
  useEffect(() => {
    loadRecords(activeTable);
    handleClear();
    setMessage(null);
  }, [activeTable, loadRecords, handleClear]);

  // Automatically update Day whenever Date changes
  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    const dayOfWeek = calculateDayOfWeek(newDate);
    setDay(dayOfWeek);
  };

  // Live calculation handlers
  const handleRateChange = (newRate: string) => {
    setRatePerUnit(newRate);
    const { totalBill: calcBill, total: calcTotal } = calculateBillAndTotal(
      currentReadings,
      previousReadings,
      newRate,
      kitchen,
      balance
    );
    setTotalBill(calcBill);
    setTotal(calcTotal);
  };

  const handleCurrentChange = (newCurrent: string) => {
    setCurrentReadings(newCurrent);
    const { totalBill: calcBill, total: calcTotal } = calculateBillAndTotal(
      newCurrent,
      previousReadings,
      ratePerUnit,
      kitchen,
      balance
    );
    setTotalBill(calcBill);
    setTotal(calcTotal);
  };

  const handlePreviousChange = (newPrevious: string) => {
    setPreviousReadings(newPrevious);
    const { totalBill: calcBill, total: calcTotal } = calculateBillAndTotal(
      currentReadings,
      newPrevious,
      ratePerUnit,
      kitchen,
      balance
    );
    setTotalBill(calcBill);
    setTotal(calcTotal);
  };

  const handleKitchenChange = (newKitchen: string) => {
    setKitchen(newKitchen);
    const { totalBill: calcBill, total: calcTotal } = calculateBillAndTotal(
      currentReadings,
      previousReadings,
      ratePerUnit,
      newKitchen,
      balance
    );
    setTotalBill(calcBill);
    setTotal(calcTotal);
  };

  // Select a row from the GridView / table
  const handleSelectRow = (record: WaterRecord) => {
    const recordId = record.id ?? record.DATE;
    setSelectedRecordId(recordId);

    setDate(record.DATE);
    setDay(record.DAY || calculateDayOfWeek(record.DATE));
    setRatePerUnit('10');
    setCurrentReadings(String(record.CURRENT_READINGS ?? ''));
    setPreviousReadings(String(record.PREVIOUS_READINGS ?? ''));
    setKitchen(String(record.KITCHEN ?? '0'));
    setTotalBill((record.TOTAL_BILL ?? 0).toFixed(2));
    setBalance((record.BALANCE ?? 0).toFixed(2));
    setPaid((record.PAID || 'PAID').toUpperCase());
    setTotal((record.TOTAL ?? 0).toFixed(2));

    setMessage({
      text: `Selected water record for ${record.DATE} (${activeTable})`,
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

    const currentVal = parseFloat(currentReadings);
    if (isNaN(currentVal) || currentVal < 0) {
      setMessage({ text: 'Please enter a valid Current Readings number.', isError: true });
      return;
    }

    const previousVal = parseFloat(previousReadings);
    if (isNaN(previousVal) || previousVal < 0) {
      setMessage({ text: 'Please enter a valid Previous Readings number.', isError: true });
      return;
    }

    const rateVal = parseFloat(ratePerUnit);
    if (isNaN(rateVal) || rateVal < 0) {
      setMessage({ text: 'Please enter a valid Rate Per Unit.', isError: true });
      return;
    }

    const kitchenVal = parseFloat(kitchen);
    if (isNaN(kitchenVal) || kitchenVal < 0) {
      setMessage({ text: 'Please enter a valid Kitchen amount.', isError: true });
      return;
    }

    const currentDay = day || calculateDayOfWeek(date);

    // Calculate Total Bill
    let currentCalc = currentVal * 10;
    let previousCalc = previousVal * 10;
    if (currentCalc < previousCalc) {
      const temp = currentCalc;
      currentCalc = previousCalc;
      previousCalc = temp;
    }
    const unitsUsed = currentCalc - previousCalc;
    const finalTotalBill = unitsUsed * rateVal + kitchenVal;

    // Determine outstanding balance from previous unpaid records
    const outstanding = DatabaseService.getOutstandingWaterBalance(activeTable);
    const finalBalance = outstanding;
    const finalTotal = finalTotalBill + finalBalance;
    const normalizedPaid = (paid.trim() || 'NOT PAID').toUpperCase();

    // Insert record and recalculate balances chronologically
    DatabaseService.insertWaterRecord(activeTable, {
      DATE: date,
      DAY: currentDay,
      CURRENT_READINGS: currentVal,
      PREVIOUS_READINGS: previousVal,
      KITCHEN: kitchenVal,
      TOTAL_BILL: finalTotalBill,
      BALANCE: finalBalance,
      TOTAL: finalTotal,
      PAID: normalizedPaid,
    });

    setMessage({
      text: `Water record for ${date} added successfully to [${activeTable}]!`,
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

    const currentVal = parseFloat(currentReadings);
    if (isNaN(currentVal) || currentVal < 0) {
      setMessage({ text: 'Please enter a valid Current Readings number.', isError: true });
      return;
    }

    const previousVal = parseFloat(previousReadings);
    if (isNaN(previousVal) || previousVal < 0) {
      setMessage({ text: 'Please enter a valid Previous Readings number.', isError: true });
      return;
    }

    const rateVal = parseFloat(ratePerUnit);
    if (isNaN(rateVal) || rateVal < 0) {
      setMessage({ text: 'Please enter a valid Rate Per Unit.', isError: true });
      return;
    }

    const kitchenVal = parseFloat(kitchen);
    if (isNaN(kitchenVal) || kitchenVal < 0) {
      setMessage({ text: 'Please enter a valid Kitchen amount.', isError: true });
      return;
    }

    const currentDay = day || calculateDayOfWeek(date);

    // Recalculate Total Bill
    let currentCalc = currentVal * 10;
    let previousCalc = previousVal * 10;
    if (currentCalc < previousCalc) {
      const temp = currentCalc;
      currentCalc = previousCalc;
      previousCalc = temp;
    }
    const unitsUsed = currentCalc - previousCalc;
    const finalTotalBill = unitsUsed * rateVal + kitchenVal;
    const normalizedPaid = (paid.trim() || 'NOT PAID').toUpperCase();

    // Update and recalculate balances chronologically
    DatabaseService.updateWaterRecord(activeTable, selectedRecordId, {
      DATE: date,
      DAY: currentDay,
      CURRENT_READINGS: currentVal,
      PREVIOUS_READINGS: previousVal,
      KITCHEN: kitchenVal,
      TOTAL_BILL: finalTotalBill,
      PAID: normalizedPaid,
    });

    setMessage({
      text: `Water record updated successfully in [${activeTable}]!`,
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

    DatabaseService.deleteWaterRecord(activeTable, selectedRecordId);

    setMessage({
      text: `Water record deleted and balances recalculated for [${activeTable}]!`,
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
          You must be logged in with administrator credentials to access the Water Edit portal.
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
    <div className="relative z-10 w-full max-w-6xl mx-auto my-6 p-4 sm:p-6 lg:p-8 hub-panel">
      {/* Main Container Content */}
      <div>
        {/* Header Bar: Top-Left WATER EDIT Heading, Top-Right Back Button */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1
              id="water-edit-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-wider uppercase text-white drop-shadow-md"
            >
              WATER EDIT
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-white/80 font-semibold uppercase tracking-wide">
                Active Table:
              </span>
              <span className="bg-white/15 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold text-amber-300 border border-white/20">
                [{activeTable}] — {DatabaseService.getTenantResidentName(activeTable.replace('Water_', ''))}
              </span>
            </div>
          </div>

          <button
            id="btnBack"
            type="button"
            onClick={() => onNavigate('waterallpage')}
            className="hub-btn hub-btn-primary px-6 py-2.5 font-semibold text-sm text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
          >
            Back
          </button>
        </div>

        {/* Table Selector Pills */}
        <div className="bg-white/5 border border-white/15 rounded-2xl p-3 mb-6 backdrop-blur-md shadow-md">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-white/80 uppercase tracking-wider px-2">
              Select Water Table:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {ALLOWED_TABLES.map((tName) => {
                const isActive = activeTable === tName;
                const unitNum = tName.replace('Water_', '');
                return (
                  <button
                    key={tName}
                    type="button"
                    onClick={() => setActiveTable(tName)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                      isActive
                        ? 'hub-btn-primary text-white border border-white/40 shadow-md scale-105'
                        : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
                    }`}
                  >
                    Unit {unitNum} <span className="text-[10px] opacity-75 font-mono">({tName})</span>
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
          id="waterFormContainer"
          className="bg-white/5 border border-white/15 rounded-2xl p-5 sm:p-7 mb-8 shadow-xl transition-all"
        >
          <div className="mb-4 flex items-center justify-between border-b border-white/15 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/90">
              {selectedRecordId ? `Editing Record (${date})` : 'New Water Bill Entry'}
            </h2>
            {selectedRecordId && (
              <span className="text-xs bg-amber-400/20 text-amber-200 px-2.5 py-1 rounded-full border border-amber-400/30 font-semibold">
                Selected for Update / Delete
              </span>
            )}
          </div>

          <form onSubmit={handleAdd}>
            {/* 10 Required Form Fields in EXACT Order */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
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
                  className="w-full hub-input font-medium"
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

              {/* 3. Rate Per Unit */}
              <div className="flex flex-col">
                <label
                  htmlFor="txtRatePerUnit"
                  className="text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider"
                >
                  3. Rate Per Unit <span className="text-pink-300">*</span>
                </label>
                <input
                  id="txtRatePerUnit"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="10"
                  value={ratePerUnit}
                  onChange={(e) => handleRateChange(e.target.value)}
                  required
                  className="w-full hub-input font-mono font-medium"
                />
              </div>

              {/* 4. Current Readings */}
              <div className="flex flex-col">
                <label
                  htmlFor="txtCurrentReadings"
                  className="text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider"
                >
                  4. Current Readings <span className="text-pink-300">*</span>
                </label>
                <input
                  id="txtCurrentReadings"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 1450"
                  value={currentReadings}
                  onChange={(e) => handleCurrentChange(e.target.value)}
                  required
                  className="w-full hub-input font-mono font-medium"
                />
              </div>

              {/* 5. Previous Readings */}
              <div className="flex flex-col">
                <label
                  htmlFor="txtPreviousReadings"
                  className="text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider"
                >
                  5. Previous Readings <span className="text-pink-300">*</span>
                </label>
                <input
                  id="txtPreviousReadings"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 1390"
                  value={previousReadings}
                  onChange={(e) => handlePreviousChange(e.target.value)}
                  required
                  className="w-full hub-input font-mono font-medium"
                />
              </div>

              {/* 6. Kitchen */}
              <div className="flex flex-col">
                <label
                  htmlFor="txtKitchen"
                  className="text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider"
                >
                  6. Kitchen (₹) <span className="text-pink-300">*</span>
                </label>
                <input
                  id="txtKitchen"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="50"
                  value={kitchen}
                  onChange={(e) => handleKitchenChange(e.target.value)}
                  required
                  className="w-full hub-input font-mono font-medium"
                />
              </div>

              {/* 7. Total Bill (Read-only calculated) */}
              <div className="flex flex-col">
                <label
                  htmlFor="txtTotalBill"
                  className="text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider flex items-center justify-between"
                >
                  <span>7. Total Bill (₹)</span>
                  <span className="text-[10px] text-cyan-300 font-normal">(Units×10×Rate)+K</span>
                </label>
                <input
                  id="txtTotalBill"
                  type="text"
                  value={totalBill}
                  readOnly
                  tabIndex={-1}
                  className="w-full hub-input opacity-80 text-cyan-300 cursor-not-allowed font-mono font-bold"
                />
              </div>

              {/* 8. Balance (Read-only calculated) */}
              <div className="flex flex-col">
                <label
                  htmlFor="txtBalance"
                  className="text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider flex items-center justify-between"
                >
                  <span>8. Balance (₹)</span>
                  <span className="text-[10px] text-amber-300 font-normal">Unpaid Previous</span>
                </label>
                <input
                  id="txtBalance"
                  type="text"
                  value={balance}
                  readOnly
                  tabIndex={-1}
                  className="w-full hub-input opacity-80 text-amber-300 cursor-not-allowed font-mono font-bold"
                />
              </div>

              {/* 9. Paid (Status text input: PAID / NOT PAID) */}
              <div className="flex flex-col">
                <label
                  htmlFor="txtPaid"
                  className="text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider"
                >
                  9. Paid Status
                </label>
                <div className="flex items-center gap-2 w-full">
                  <input
                    id="txtPaid"
                    type="text"
                    placeholder="PAID / NOT PAID"
                    value={paid}
                    onChange={(e) => setPaid(e.target.value.toUpperCase())}
                    className="flex-1 min-w-0 h-11 hub-input font-bold uppercase tracking-wider text-xs sm:text-sm"
                  />
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

              {/* 10. Total (Read-only calculated Total = Total Bill + Balance) */}
              <div className="flex flex-col">
                <label
                  htmlFor="txtTotal"
                  className="text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider flex items-center justify-between"
                >
                  <span>10. Total (₹)</span>
                  <span className="text-[10px] text-emerald-300 font-normal">Bill + Bal</span>
                </label>
                <input
                  id="txtTotal"
                  type="text"
                  value={total}
                  readOnly
                  tabIndex={-1}
                  className="w-full hub-input opacity-90 text-emerald-300 cursor-not-allowed font-mono font-black"
                />
              </div>
            </div>

            {/* Form Action Buttons: Add, Update, Delete, Clear */}
            <div className="pt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  id="btnAdd"
                  type="submit"
                  className="w-full hub-btn hub-btn-primary py-3 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center"
                >
                  ADD
                </button>

                <button
                  id="btnUpdate"
                  type="button"
                  onClick={handleUpdate}
                  className="w-full hub-btn hub-btn-primary py-3 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center"
                >
                  UPDATE
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  id="btnDelete"
                  type="button"
                  onClick={handleDelete}
                  className="w-full hub-btn hub-btn-danger py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center"
                >
                  Delete
                </button>

                <button
                  id="btnClear"
                  type="button"
                  onClick={handleClear}
                  className="w-full hub-btn py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center"
                >
                  Clear
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Water Record Table (GridView equivalent) */}
        <div className="bg-white/5 border border-white/15 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="px-5 py-3.5 bg-white/10 border-b border-white/15 flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Water Meter Records & Billing — Table [{activeTable}]
            </h3>
            <span className="text-xs text-white/80">
              Total Records: <strong>{records.length}</strong> (Processed in Date Order)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table id="gvWater" className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-white/10 text-white text-xs uppercase tracking-wider font-semibold border-b border-white/15">
                  <th className="py-3 px-3.5 text-center">1. Select</th>
                  <th className="py-3 px-3.5">2. Date</th>
                  <th className="py-3 px-3.5">3. Day</th>
                  <th className="py-3 px-3.5 text-right">4. Current</th>
                  <th className="py-3 px-3.5 text-right">5. Previous</th>
                  <th className="py-3 px-3.5 text-right">6. Kitchen (₹)</th>
                  <th className="py-3 px-3.5 text-right">7. Total Bill (₹)</th>
                  <th className="py-3 px-3.5 text-right">8. Balance (₹)</th>
                  <th className="py-3 px-3.5 text-center">9. Paid</th>
                  <th className="py-3 px-3.5 text-right">10. Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-white/60 text-sm italic">
                      No water records found for table [{activeTable}]. Use the form above to add a new record.
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
                        <td className="py-2.5 px-3.5 text-center">
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
                        <td className="py-2.5 px-3.5 font-mono font-medium text-white whitespace-nowrap">
                          {r.DATE}
                        </td>

                        {/* 3. Day */}
                        <td className="py-2.5 px-3.5 text-white/80 whitespace-nowrap">
                          {r.DAY}
                        </td>

                        {/* 4. Current Readings */}
                        <td className="py-2.5 px-3.5 text-right font-mono font-medium text-cyan-300 whitespace-nowrap">
                          {r.CURRENT_READINGS}
                        </td>

                        {/* 5. Previous Readings */}
                        <td className="py-2.5 px-3.5 text-right font-mono text-white/70 whitespace-nowrap">
                          {r.PREVIOUS_READINGS}
                        </td>

                        {/* 6. Kitchen */}
                        <td className="py-2.5 px-3.5 text-right font-mono text-white/90 whitespace-nowrap">
                          {Number(r.KITCHEN ?? 0).toFixed(2)}
                        </td>

                        {/* 7. Total Bill */}
                        <td className="py-2.5 px-3.5 text-right font-mono font-bold text-white whitespace-nowrap">
                          {Number(r.TOTAL_BILL ?? 0).toFixed(2)}
                        </td>

                        {/* 8. Balance */}
                        <td className="py-2.5 px-3.5 text-right font-mono font-bold text-amber-300 whitespace-nowrap">
                          {Number(r.BALANCE ?? 0).toFixed(2)}
                        </td>

                        {/* 9. Paid */}
                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider ${
                              isRecordPaid
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            }`}
                          >
                            {r.PAID || 'NOT PAID'}
                          </span>
                        </td>

                        {/* 10. Total */}
                        <td className="py-2.5 px-3.5 text-right font-mono font-extrabold text-emerald-300 whitespace-nowrap">
                          {Number(r.TOTAL ?? 0).toFixed(2)}
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
