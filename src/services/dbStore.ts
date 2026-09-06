import {
  RentRecord,
  WaterRecord,
  CustomerInfoRecord,
  PaymentSubmission,
  ComplaintRecord,
  NoticeRecord,
  NotificationRecord,
} from '../types';
import { TENANT_TABLE_MAP, getTenantTables, formatINR, isPaid } from '../data/tenantMapping';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { SmsService } from './smsService';

const STORAGE_KEY = 'TENANT_HUB_SQL_DB_V3';

export interface CustomerLoginRecord {
  id: number;
  USERNAME: string;
  PASSWORD: string;
}

export interface SqlDatabaseState {
  rentTables: Record<string, RentRecord[]>;
  waterTables: Record<string, WaterRecord[]>;
  infoTables: Record<string, CustomerInfoRecord[]>;
  customerLogins: CustomerLoginRecord[];
  paymentSubmissions: PaymentSubmission[];
  complaints?: ComplaintRecord[];
  notices?: NoticeRecord[];
  notifications?: NotificationRecord[];
  adminUser: { username: string; passwordHash: string };
  passwords: Record<string, string>;
}

const INITIAL_DB: SqlDatabaseState = {
  adminUser: {
    username: 'Anu',
    passwordHash: '9916913919',
  },
  passwords: {
    '11': 'tenant11',
    '12': 'tenant12',
    '21': 'tenant21',
    '22': 'tenant22',
    '31': 'tenant31',
    '32': 'tenant32',
    '41': 'tenant41',
  },
  customerLogins: [
    { id: 1, USERNAME: '11', PASSWORD: 'tenant11' },
    { id: 2, USERNAME: '12', PASSWORD: 'tenant12' },
    { id: 3, USERNAME: '21', PASSWORD: 'tenant21' },
    { id: 4, USERNAME: '22', PASSWORD: 'tenant22' },
    { id: 5, USERNAME: '31', PASSWORD: 'tenant31' },
    { id: 6, USERNAME: '32', PASSWORD: 'tenant32' },
    { id: 7, USERNAME: '41', PASSWORD: 'tenant41' },
  ],
  paymentSubmissions: [
    {
      id: 'PAY-1001',
      tenantNumber: '12',
      tenantName: 'Raju',
      amount: 6550,
      utrNumber: 'UPI/984321774391',
      paymentMode: 'PhonePe UPI',
      timestamp: '2026-08-28 14:32:10',
      status: 'PENDING',
      notes: 'Monthly Rent + Water Bill for Flat 102',
    },
    {
      id: 'PAY-1002',
      tenantNumber: '22',
      tenantName: 'Kala',
      amount: 6220,
      utrNumber: 'UPI/440912837465',
      paymentMode: 'Google Pay',
      timestamp: '2026-08-27 18:15:40',
      status: 'PENDING',
      notes: 'Rent and Water Bill settlement for Flat 202',
    },
    {
      id: 'PAY-1000',
      tenantNumber: '11',
      tenantName: 'Muhammad Faiz',
      amount: 7000,
      utrNumber: 'UPI/382910482910',
      paymentMode: 'PhonePe QR',
      timestamp: '2026-08-01 10:20:00',
      status: 'VERIFIED',
      notes: 'August 2026 Payment Approved',
    },
  ],
  complaints: [
    {
      id: 'CMP-101',
      tenantNumber: '11',
      tenantName: 'Muhammad Faiz',
      title: 'Kitchen sink drainage slow',
      category: 'Plumbing',
      description: 'The kitchen sink drain is taking considerable time to clear after washing dishes.',
      room: 'Flat 11',
      priority: 'MEDIUM',
      status: 'IN PROGRESS',
      createdAt: '2026-09-02 11:30 AM',
    },
    {
      id: 'CMP-102',
      tenantNumber: '12',
      tenantName: 'Raju',
      title: 'Balcony sliding latch loose',
      category: 'Carpentry',
      description: 'The balcony sliding lock is slightly misaligned and difficult to latch securely at night.',
      room: 'Flat 12',
      priority: 'LOW',
      status: 'RESOLVED',
      createdAt: '2026-08-24 03:15 PM',
      resolvedAt: '2026-08-26 10:00 AM',
    },
    {
      id: 'CMP-103',
      tenantNumber: '21',
      tenantName: 'Vijay',
      title: 'Hall ceiling fan light humming noise',
      category: 'Electrical',
      description: 'Ceiling fan makes a mild humming sound at regulator speed 3.',
      room: 'Flat 21',
      priority: 'LOW',
      status: 'OPEN',
      createdAt: '2026-09-04 09:45 AM',
    },
  ],
  notices: [
    {
      id: 'NOT-01',
      title: 'Water Maintenance Notice',
      description: 'Water supply will be temporarily paused tomorrow from 10:00 AM to 01:00 PM for overhead tank cleaning and chlorination.',
      category: 'Maintenance',
      date: '05 Sep 2026',
      priority: 'URGENT',
      isRead: false,
    },
    {
      id: 'NOT-02',
      title: 'CCTV & Security Surveillance Upgraded',
      description: 'New 4K security cameras and biometric gate readers have been activated on all corridors and parking entries for your safety.',
      category: 'Security',
      date: '01 Sep 2026',
      priority: 'NORMAL',
      isRead: true,
    },
    {
      id: 'NOT-03',
      title: 'September Rent & Water Billing Live',
      description: 'The September billing cycles have been compiled. Please review your meter readings and clear outstanding dues before the 10th of this month.',
      category: 'Payment',
      date: '28 Aug 2026',
      priority: 'NORMAL',
      isRead: true,
    },
    {
      id: 'NOT-04',
      title: 'Diesel Generator Backup Routine Test',
      description: 'Quarterly standby diesel generator load testing will be conducted this Saturday between 3:00 PM and 3:30 PM.',
      category: 'General',
      date: '25 Aug 2026',
      priority: 'NORMAL',
      isRead: true,
    },
  ],
  notifications: [
    {
      id: 'NOTIF-1',
      tenantNumber: '11',
      title: 'Payment Approved ✅',
      message: 'Your payment proof of ₹7,000.00 for Flat 101 has been verified and approved.',
      type: 'PAYMENT_APPROVED',
      urgency: 'NORMAL',
      createdAt: '01 Aug 2026, 10:25 AM',
      isRead: true,
    },
    {
      id: 'NOTIF-2',
      tenantNumber: 'ALL',
      title: '🚨 Water Maintenance Notice',
      message: 'Water supply will be temporarily paused tomorrow 10:00 AM to 01:00 PM for overhead tank cleaning.',
      type: 'URGENT_ANNOUNCEMENT',
      urgency: 'URGENT',
      createdAt: '05 Sep 2026, 08:00 AM',
      isRead: false,
    },
    {
      id: 'NOTIF-3',
      tenantNumber: 'ADMIN',
      title: 'New Maintenance Ticket Submitted',
      message: 'Muhammad Faiz (Flat 11) submitted a ticket: "Kitchen sink drainage slow".',
      type: 'MAINTENANCE_UPDATE',
      urgency: 'NORMAL',
      createdAt: '02 Sep 2026, 11:30 AM',
      isRead: false,
    },
  ],
  infoTables: {
    INFO_11: [
      {
        id: 1,
        USERNAME: '11',
        NAME: 'Muhammad Faiz',
        PHONE_NUMBER: '8129046082',
        ARRIVED_DATE: '2025-02-10',
        ADVANCE_PAID: 20000,
        CURRENT_RENT: 6250,
        CURRENT_INCREMENT: 250,
        YEARLY_INCREMENT: 5,
      },
    ],
    INFO_12: [
      {
        id: 1,
        USERNAME: '12',
        NAME: 'Raju',
        PHONE_NUMBER: '7411464030',
        ARRIVED_DATE: '2023-12-03',
        ADVANCE_PAID: 40000,
        CURRENT_RENT: 5500,
        CURRENT_INCREMENT: 500,
        YEARLY_INCREMENT: 5,
      },
    ],
    INFO_21: [
      {
        id: 1,
        USERNAME: '21',
        NAME: 'Sumanth',
        PHONE_NUMBER: '9740288342',
        ARRIVED_DATE: '2024-05-31',
        ADVANCE_PAID: 40000,
        CURRENT_RENT: 5750,
        CURRENT_INCREMENT: 250,
        YEARLY_INCREMENT: 5,
      },
    ],
    INFO_22: [
      {
        id: 1,
        USERNAME: '22',
        NAME: 'Kala',
        PHONE_NUMBER: '8217496986',
        ARRIVED_DATE: '2024-02-23',
        ADVANCE_PAID: 50000,
        CURRENT_RENT: 5250,
        CURRENT_INCREMENT: 250,
        YEARLY_INCREMENT: 5,
      },
    ],
    INFO_31: [
      {
        id: 1,
        USERNAME: '31',
        NAME: 'Pavan Naik',
        PHONE_NUMBER: '7619195999',
        ARRIVED_DATE: '2026-04-03',
        ADVANCE_PAID: 20000,
        CURRENT_RENT: 5000,
        CURRENT_INCREMENT: 0,
        YEARLY_INCREMENT: 5,
      },
    ],
    INFO_32: [
      {
        id: 1,
        USERNAME: '32',
        NAME: 'Ankith Das',
        PHONE_NUMBER: '6291416401',
        ARRIVED_DATE: '2025-04-26',
        ADVANCE_PAID: 40000,
        CURRENT_RENT: 5750,
        CURRENT_INCREMENT: 250,
        YEARLY_INCREMENT: 5,
      },
    ],
    INFO_41: [
      {
        id: 1,
        USERNAME: '41',
        NAME: 'Pavan Naik',
        PHONE_NUMBER: '7619195999',
        ARRIVED_DATE: '2026-04-03',
        ADVANCE_PAID: 20000,
        CURRENT_RENT: 5000,
        CURRENT_INCREMENT: 0,
        YEARLY_INCREMENT: 5,
      },
    ],
  },
  rentTables: {
    RENT_11: [
      {
        id: 1,
        DATE: '2026-08-01',
        DAY: 'Saturday',
        PAYMENT: 6250,
        BALANCE: 0,
        TOTAL: 6250,
        'MODE OF PAYMENT': 'UPI / PhonePe',
        PAID: 'PAID',
      },
      {
        id: 2,
        DATE: '2026-07-01',
        DAY: 'Wednesday',
        PAYMENT: 6250,
        BALANCE: 0,
        TOTAL: 6250,
        'MODE OF PAYMENT': 'Net Banking',
        PAID: 'PAID',
      },
    ],
    RENT_12: [
      {
        id: 1,
        DATE: '2026-08-01',
        DAY: 'Saturday',
        PAYMENT: 5500,
        BALANCE: 500,
        TOTAL: 6000,
        'MODE OF PAYMENT': 'Pending',
        PAID: 'NOT PAID',
      },
    ],
    RENT_21: [
      {
        id: 1,
        DATE: '2026-08-01',
        DAY: 'Saturday',
        PAYMENT: 5750,
        BALANCE: 0,
        TOTAL: 5750,
        'MODE OF PAYMENT': 'PhonePe',
        PAID: 'PAID',
      },
    ],
    RENT_22: [
      {
        id: 1,
        DATE: '2026-08-01',
        DAY: 'Saturday',
        PAYMENT: 5250,
        BALANCE: 500,
        TOTAL: 5750,
        'MODE OF PAYMENT': 'Pending',
        PAID: 'NOT PAID',
      },
    ],
    RENT_31: [
      {
        id: 1,
        DATE: '2026-08-01',
        DAY: 'Saturday',
        PAYMENT: 5000,
        BALANCE: 0,
        TOTAL: 5000,
        'MODE OF PAYMENT': 'UPI',
        PAID: 'PAID',
      },
    ],
    RENT_32: [
      {
        id: 1,
        DATE: '2026-08-01',
        DAY: 'Saturday',
        PAYMENT: 5750,
        BALANCE: 0,
        TOTAL: 5750,
        'MODE OF PAYMENT': 'Google Pay',
        PAID: 'PAID',
      },
    ],
    RENT_41: [
      {
        id: 1,
        DATE: '2026-08-01',
        DAY: 'Saturday',
        PAYMENT: 5000,
        BALANCE: 1000,
        TOTAL: 6000,
        'MODE OF PAYMENT': 'Pending',
        PAID: 'NOT PAID',
      },
    ],
  },
  waterTables: {
    Water_11: [
      {
        id: 1,
        DATE: '2026-08-01',
        DAY: 'Saturday',
        CURRENT_READINGS: 1450,
        PREVIOUS_READINGS: 1390,
        KITCHEN: 150,
        TOTAL_BILL: 750,
        BALANCE: 0,
        TOTAL: 750,
        PAID: 'PAID',
      },
      {
        id: 2,
        DATE: '2026-07-01',
        DAY: 'Wednesday',
        CURRENT_READINGS: 1390,
        PREVIOUS_READINGS: 1330,
        KITCHEN: 150,
        TOTAL_BILL: 720,
        BALANCE: 0,
        TOTAL: 720,
        PAID: 'PAID',
      },
    ],
    Water_12: [
      {
        id: 1,
        DATE: '2026-08-01',
        DAY: 'Saturday',
        CURRENT_READINGS: 2100,
        PREVIOUS_READINGS: 2020,
        KITCHEN: 200,
        TOTAL_BILL: 950,
        BALANCE: 100,
        TOTAL: 1050,
        PAID: 'NOT PAID',
      },
    ],
    Water_21: [
      {
        id: 1,
        DATE: '2026-08-01',
        DAY: 'Saturday',
        CURRENT_READINGS: 1890,
        PREVIOUS_READINGS: 1835,
        KITCHEN: 150,
        TOTAL_BILL: 680,
        BALANCE: 0,
        TOTAL: 680,
        PAID: 'PAID',
      },
    ],
    Water_22: [
      {
        id: 1,
        DATE: '2026-08-01',
        DAY: 'Saturday',
        CURRENT_READINGS: 1650,
        PREVIOUS_READINGS: 1590,
        KITCHEN: 180,
        TOTAL_BILL: 820,
        BALANCE: 150,
        TOTAL: 970,
        PAID: 'NOT PAID',
      },
    ],
    Water_31: [
      {
        id: 1,
        DATE: '2026-08-01',
        DAY: 'Saturday',
        CURRENT_READINGS: 1240,
        PREVIOUS_READINGS: 1195,
        KITCHEN: 150,
        TOTAL_BILL: 610,
        BALANCE: 0,
        TOTAL: 610,
        PAID: 'PAID',
      },
    ],
    Water_32: [
      {
        id: 1,
        DATE: '2026-08-01',
        DAY: 'Saturday',
        CURRENT_READINGS: 1980,
        PREVIOUS_READINGS: 1910,
        KITCHEN: 190,
        TOTAL_BILL: 880,
        BALANCE: 0,
        TOTAL: 880,
        PAID: 'PAID',
      },
    ],
    Water_41: [
      {
        id: 1,
        DATE: '2026-08-01',
        DAY: 'Saturday',
        CURRENT_READINGS: 2450,
        PREVIOUS_READINGS: 2360,
        KITCHEN: 220,
        TOTAL_BILL: 1100,
        BALANCE: 200,
        TOTAL: 1300,
        PAID: 'NOT PAID',
      },
    ],
  },
};

export class DatabaseService {
  public static getDB(): SqlDatabaseState {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return INITIAL_DB;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DB));
      return INITIAL_DB;
    }
    try {
      const parsed = JSON.parse(raw);
      // Ensure all fields exist
      if (!parsed.infoTables) parsed.infoTables = INITIAL_DB.infoTables;
      if (!parsed.customerLogins) parsed.customerLogins = INITIAL_DB.customerLogins;
      if (!parsed.paymentSubmissions) parsed.paymentSubmissions = INITIAL_DB.paymentSubmissions;
      if (!parsed.complaints || parsed.complaints.length === 0) parsed.complaints = INITIAL_DB.complaints;
      if (!parsed.notices || parsed.notices.length === 0) parsed.notices = INITIAL_DB.notices;
      if (!parsed.notifications || parsed.notifications.length === 0) parsed.notifications = INITIAL_DB.notifications;

      // Migrate tenant 32 spelling if cached as previous value
      if (parsed.infoTables?.INFO_32?.[0] && parsed.infoTables.INFO_32[0].NAME !== 'Ankith Das') {
        parsed.infoTables.INFO_32[0].NAME = 'Ankith Das';
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return INITIAL_DB;
    }
  }

  public static getTenantResidentName(tenantNumber: string): string {
    const rec = this.getInfoRecord(tenantNumber);
    if (rec?.NAME) return rec.NAME;
    try {
      const info = getTenantTables(tenantNumber);
      return info.tenantName.replace(/^Flat \d+ \(Tenant \d+ - (.*)\)$/, '$1');
    } catch {
      return `Tenant ${tenantNumber}`;
    }
  }

  public static getTenantPhone(tenantNumber: string): string {
    const rec = this.getInfoRecord(tenantNumber);
    if (rec?.PHONE_NUMBER) return rec.PHONE_NUMBER;
    try {
      return getTenantTables(tenantNumber).phone;
    } catch {
      return '';
    }
  }

  public static getTenantDisplayName(tenantNumber: string): string {
    const name = this.getTenantResidentName(tenantNumber);
    return `Flat ${tenantNumber} (Tenant ${tenantNumber} - ${name})`;
  }

  private static saveDB(db: SqlDatabaseState) {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    try {
      window.dispatchEvent(new CustomEvent('tenant_hub_db_updated'));
    } catch {
      // ignore
    }
  }

  public static resetDB() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DB));
    }
  }

  public static async syncFromSupabase(): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) {
      return false;
    }
    try {
      const db = this.getDB();

      // 1. Sync admin user
      const { data: adminData } = await supabase.from('admin_users').select('*').limit(1);
      if (adminData && adminData.length > 0) {
        db.adminUser.username = adminData[0].username;
        db.adminUser.passwordHash = adminData[0].password_hash;
      }

      // 2. Sync tenant passwords
      const { data: logins } = await supabase.from('customer_logins').select('*');
      if (logins && logins.length > 0) {
        logins.forEach((l: any) => {
          db.passwords[l.tenant_number] = l.password_hash;
        });
      }

      // 3. Sync tenant infos
      const { data: infos } = await supabase.from('tenant_infos').select('*');
      if (infos && infos.length > 0) {
        infos.forEach((inf: any) => {
          const key = `INFO_${inf.tenant_number}`;
          db.infoTables[key] = [
            {
              id: inf.id,
              USERNAME: inf.tenant_number,
              NAME: inf.name,
              PHONE_NUMBER: inf.phone,
              ARRIVED_DATE: inf.arrived_date || '',
              ADVANCE_PAID: Number(inf.advance_paid) || 0,
              CURRENT_RENT: Number(inf.current_rent) || 0,
              CURRENT_INCREMENT: Number(inf.current_increment) || 0,
              YEARLY_INCREMENT: Number(inf.yearly_increment) || 5,
            },
          ];
        });
      }

      // 4. Sync rent records
      const { data: rents } = await supabase.from('rent_records').select('*');
      if (rents && rents.length > 0) {
        rents.forEach((r: any) => {
          const tName = r.table_name || `RENT_${r.tenant_number}`;
          if (!db.rentTables[tName]) db.rentTables[tName] = [];
          const existingIdx = db.rentTables[tName].findIndex(
            (x) => String(x.id) === String(r.id) || x.DATE === r.date
          );
          const paymentVal = Number(r.payment) || 0;
          const isPaidStatus = (r.paid || '').toUpperCase() === 'PAID';
          const balanceVal = isPaidStatus
            ? 0
            : Number(
                r.unpaid !== undefined && r.unpaid !== null
                  ? r.unpaid
                  : (r.previous_balance !== undefined && r.previous_balance !== null
                      ? r.previous_balance
                      : (r.balance !== undefined ? r.balance : 0))
              ) || 0;
          const totalVal = isPaidStatus
            ? 0
            : Number(
                r.total !== undefined && r.total !== null
                  ? r.total
                  : (paymentVal + balanceVal)
              ) || 0;

          const formatted: RentRecord = {
            id: r.id,
            DATE: r.date,
            DAY: r.day || '',
            PAYMENT: paymentVal,
            BALANCE: balanceVal,
            TOTAL: totalVal,
            PAID: (r.paid || 'NOT PAID').toUpperCase(),
            'MODE OF PAYMENT': r.mode_of_payment || 'CASH',
          };
          if (existingIdx !== -1) {
            db.rentTables[tName][existingIdx] = formatted;
          } else {
            db.rentTables[tName].push(formatted);
          }
        });
      }

      // 5. Sync water records
      const { data: waters } = await supabase.from('water_records').select('*');
      if (waters && waters.length > 0) {
        waters.forEach((w: any) => {
          const tName = w.table_name || `Water_${w.tenant_number}`;
          if (!db.waterTables[tName]) db.waterTables[tName] = [];
          const existingIdx = db.waterTables[tName].findIndex(
            (x) => String(x.id) === String(w.id) || x.DATE === w.date
          );
          const isWaterPaidStatus = (w.paid || '').toUpperCase() === 'PAID';
          const balanceVal = isWaterPaidStatus ? 0 : Number(w.balance) || 0;
          const totalVal = isWaterPaidStatus ? 0 : Number(w.total) || 0;
          const formatted: WaterRecord = {
            id: w.id,
            DATE: w.date,
            DAY: w.day || '',
            PREVIOUS_READINGS: Number(w.previous_reading || w.previous_readings) || 0,
            CURRENT_READINGS: Number(w.current_reading || w.current_readings) || 0,
            KITCHEN: Number(w.kitchen) || 0,
            TOTAL_BILL: Number(w.total_bill) || 0,
            BALANCE: balanceVal,
            PAID: (w.paid || 'NOT PAID').toUpperCase(),
            TOTAL: totalVal,
          };
          if (existingIdx !== -1) {
            db.waterTables[tName][existingIdx] = formatted;
          } else {
            db.waterTables[tName].push(formatted);
          }
        });
      }

      // 6. Sync payment submissions
      const { data: submissions } = await supabase.from('payment_submissions').select('*');
      if (submissions && submissions.length > 0) {
        db.paymentSubmissions = submissions.map((s: any) => ({
          id: s.id,
          tenantNumber: s.tenant_number,
          tenantName: s.tenant_name || `Tenant ${s.tenant_number}`,
          amount: Number(s.amount) || 0,
          utrNumber: s.utr_number,
          paymentMode: s.payment_mode || 'UPI',
          notes: s.notes || '',
          timestamp: s.created_at || new Date().toISOString(),
          status: s.status || 'PENDING',
        }));
      }

      this.saveDB(db);
      return true;
    } catch (err) {
      console.error('Supabase sync error:', err);
      return false;
    }
  }

  // Get Latest Rent Record for Tenant
  public static getLatestRentRecord(tenantNumber: string): RentRecord | null {
    const { rentTable } = getTenantTables(tenantNumber);
    const db = this.getDB();
    const rows = db.rentTables[rentTable] || [];
    if (rows.length === 0) return null;
    const sorted = [...rows].sort((a, b) => (b.DATE > a.DATE ? 1 : -1));
    return sorted[0];
  }

  // Get Latest Water Record for Tenant
  public static getLatestWaterRecord(tenantNumber: string): WaterRecord | null {
    const { waterTable } = getTenantTables(tenantNumber);
    const db = this.getDB();
    const rows = db.waterTables[waterTable] || [];
    if (rows.length === 0) return null;
    const sorted = [...rows].sort((a, b) => (b.DATE > a.DATE ? 1 : -1));
    return sorted[0];
  }

  // Centralized Grand Total & Outstanding Balance Logic for Tenant Hub
  public static getTenantPaymentSummary(tenantNumber: string) {
    const latestRent = this.getLatestRentRecord(tenantNumber);
    const latestWater = this.getLatestWaterRecord(tenantNumber);

    const isRentPaid = isPaid(latestRent?.PAID);
    const isWaterPaid = isPaid(latestWater?.PAID);

    // Outstanding balance calculations:
    // 1. If RENT is PAID -> Rent contributes ₹0 to Grand Total
    // 2. If WATER is PAID -> Water contributes ₹0 to Grand Total
    // 3. If RENT is NOT PAID -> Add only the current outstanding rent balance
    // 4. If WATER is NOT PAID -> Add only the current outstanding water balance
    const rentOutstanding = isRentPaid
      ? 0
      : Number(latestRent?.TOTAL ?? (Number(latestRent?.PAYMENT || 0) + Number(latestRent?.BALANCE || 0)));
    const waterOutstanding = isWaterPaid
      ? 0
      : Number(latestWater?.TOTAL ?? (Number(latestWater?.TOTAL_BILL || 0) + Number(latestWater?.BALANCE || 0)));

    const grandTotal = rentOutstanding + waterOutstanding;
    const isOverallPaid = grandTotal === 0;

    const pendingSubmission = this.getPaymentSubmissions().find(
      (s) => s.tenantNumber === tenantNumber && s.status === 'PENDING'
    );

    const status: 'PAID' | 'PENDING' | 'NOT PAID' = isOverallPaid
      ? 'PAID'
      : pendingSubmission
      ? 'PENDING'
      : 'NOT PAID';

    return {
      latestRent,
      latestWater,
      isRentPaid,
      isWaterPaid,
      rentOutstanding,
      waterOutstanding,
      rentTotal: latestRent?.TOTAL ?? 0,
      waterTotal: latestWater?.TOTAL ?? 0,
      grandTotal,
      isOverallPaid,
      pendingSubmission,
      status,
    };
  }

  // Rent CRUD
  public static readonly ALLOWED_RENT_TABLES = [
    'RENT_11',
    'RENT_12',
    'RENT_21',
    'RENT_22',
    'RENT_31',
    'RENT_32',
    'RENT_41',
  ] as const;

  public static sanitizeRentTableName(tableOrTenant?: string): string {
    if (!tableOrTenant) return 'RENT_11';
    let clean = tableOrTenant.trim().toUpperCase();
    if (!clean.startsWith('RENT_')) {
      clean = `RENT_${clean}`;
    }
    if (DatabaseService.ALLOWED_RENT_TABLES.includes(clean as any)) {
      return clean;
    }
    return 'RENT_11';
  }

  public static getRentRecordsByTable(tableName: string): RentRecord[] {
    const validTable = this.sanitizeRentTableName(tableName);
    const db = this.getDB();
    const list = db.rentTables[validTable] || [];
    return [...list].sort((a, b) => a.DATE.localeCompare(b.DATE));
  }

  public static getOutstandingRentBalance(tableName: string): number {
    const validTable = this.sanitizeRentTableName(tableName);
    const db = this.getDB();
    const list = db.rentTables[validTable] || [];
    let unpaidSum = 0;
    for (const r of list) {
      if (String(r.PAID || '').trim().toUpperCase() === 'NOT PAID') {
        unpaidSum += Number(r.PAYMENT) || 0;
      }
    }
    return unpaidSum;
  }

  public static recalculateRentTable(tableName: string): RentRecord[] {
    const validTable = this.sanitizeRentTableName(tableName);
    const db = this.getDB();
    if (!db.rentTables[validTable]) {
      db.rentTables[validTable] = [];
    }

    const list = [...db.rentTables[validTable]].sort((a, b) => a.DATE.localeCompare(b.DATE));
    let previousUnpaid = 0;

    for (const record of list) {
      const payment = Number(record.PAYMENT) || 0;
      record.BALANCE = previousUnpaid;
      record.TOTAL = payment + previousUnpaid;

      const isUnpaid = String(record.PAID || '').trim().toUpperCase() === 'NOT PAID';
      if (isUnpaid) {
        previousUnpaid += payment;
      }
    }

    db.rentTables[validTable] = list;
    this.saveDB(db);
    return list;
  }

  public static getRentRecords(tenantNumber: string): RentRecord[] {
    const validTable = this.sanitizeRentTableName(tenantNumber);
    const db = this.getDB();
    return db.rentTables[validTable] || [];
  }

  public static async pushRentRecordsToSupabase(tableOrTenant?: string): Promise<{ success: boolean; count: number; error?: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, count: 0, error: 'Supabase client not configured' };
    }

    try {
      const db = this.getDB();
      const tablesToSync: string[] = tableOrTenant
        ? [this.sanitizeRentTableName(tableOrTenant)]
        : [...this.ALLOWED_RENT_TABLES];

      let totalPushed = 0;

      for (const tName of tablesToSync) {
        const records = db.rentTables[tName] || [];
        if (records.length === 0) continue;

        const tenantNum = tName.replace('RENT_', '');
        const rows = records.map((r, idx) => {
          const recordId = String(r.id).startsWith(`${tName}_`)
            ? String(r.id)
            : `${tName}_${r.id || idx}_${r.DATE}`;
          r.id = recordId;
          return {
            id: recordId,
            table_name: tName,
            tenant_number: tenantNum,
            date: r.DATE,
            previous_balance: Number(r.BALANCE) || 0,
            payment: Number(r.PAYMENT) || 0,
            unpaid: (r.PAID || '').toUpperCase() === 'PAID' ? 0 : Number(r.BALANCE) || 0,
            paid: (r.PAID || 'NOT PAID').toUpperCase(),
            mode_of_payment: r['MODE OF PAYMENT'] || 'UPI',
          };
        });

        const { error } = await supabase.from('rent_records').upsert(rows);
        if (error) {
          console.error(`Error pushing ${tName} to Supabase:`, error);
          return { success: false, count: totalPushed, error: error.message };
        }
        totalPushed += rows.length;
      }

      console.log(`[Supabase] Synced ${totalPushed} rent records successfully`);
      return { success: true, count: totalPushed };
    } catch (err: any) {
      console.error('Failed to push rent records to Supabase:', err);
      return { success: false, count: 0, error: err?.message || 'Unknown error' };
    }
  }

  public static insertRentRecord(tenantNumber: string, record: Omit<RentRecord, 'id'>) {
    const validTable = this.sanitizeRentTableName(tenantNumber);
    const db = this.getDB();
    if (!db.rentTables[validTable]) db.rentTables[validTable] = [];
    const newId = `rent_${tenantNumber.replace('RENT_', '')}_${Date.now()}`;
    db.rentTables[validTable].push({ ...record, id: newId });
    this.saveDB(db);
    const updated = this.recalculateRentTable(validTable);

    // Live push to Supabase
    this.pushRentRecordsToSupabase(validTable).catch((err) =>
      console.error('Supabase auto-sync failed on insertRentRecord:', err)
    );

    return updated;
  }

  public static updateRentRecord(tenantNumber: string, idOrDate: string | number, record: Partial<RentRecord>) {
    const validTable = this.sanitizeRentTableName(tenantNumber);
    const db = this.getDB();
    const list = db.rentTables[validTable] || [];
    const idx = list.findIndex((r) => String(r.id) === String(idOrDate) || r.DATE === String(idOrDate));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...record };
      this.saveDB(db);
    }
    const updated = this.recalculateRentTable(validTable);

    // Live push to Supabase
    this.pushRentRecordsToSupabase(validTable).catch((err) =>
      console.error('Supabase auto-sync failed on updateRentRecord:', err)
    );

    return updated;
  }

  public static deleteRentRecord(tenantNumber: string, idOrDate: string | number) {
    const validTable = this.sanitizeRentTableName(tenantNumber);
    const db = this.getDB();
    if (db.rentTables[validTable]) {
      const deletedItem = db.rentTables[validTable].find(
        (r) => String(r.id) === String(idOrDate) || r.DATE === String(idOrDate)
      );

      db.rentTables[validTable] = db.rentTables[validTable].filter(
        (r) => String(r.id) !== String(idOrDate) && r.DATE !== String(idOrDate)
      );
      this.saveDB(db);

      // Live delete from Supabase, then sync remaining
      if (deletedItem && isSupabaseConfigured() && supabase) {
        (async () => {
          try {
            await supabase
              .from('rent_records')
              .delete()
              .eq('id', String(deletedItem.id));
            this.pushRentRecordsToSupabase(validTable);
          } catch (err) {
            console.error('Supabase delete rent record error:', err);
          }
        })();
      }
    }
    return this.recalculateRentTable(validTable);
  }

  // Water CRUD
  public static readonly ALLOWED_WATER_TABLES = [
    'Water_11',
    'Water_12',
    'Water_21',
    'Water_22',
    'Water_31',
    'Water_32',
    'Water_41',
  ] as const;

  public static sanitizeWaterTableName(tableOrTenant?: string): string {
    if (!tableOrTenant) return 'Water_11';
    let clean = tableOrTenant.trim();
    // Normalize format: e.g. "11", "water_11", "WATER_11", "Water_11"
    const lower = clean.toLowerCase();
    if (lower.startsWith('water_')) {
      const suffix = clean.substring(6);
      clean = `Water_${suffix}`;
    } else {
      clean = `Water_${clean}`;
    }
    const matched = DatabaseService.ALLOWED_WATER_TABLES.find(
      (t) => t.toLowerCase() === clean.toLowerCase()
    );
    return matched || 'Water_11';
  }

  public static getWaterRecordsByTable(tableName: string): WaterRecord[] {
    const validTable = this.sanitizeWaterTableName(tableName);
    const db = this.getDB();
    const list = db.waterTables[validTable] || [];
    return [...list].sort((a, b) => a.DATE.localeCompare(b.DATE));
  }

  public static getLatestWaterCurrentReading(tableName: string): number | null {
    const records = this.getWaterRecordsByTable(tableName);
    if (records.length === 0) return null;
    // Get the most recent record by Date
    const sorted = [...records].sort((a, b) => b.DATE.localeCompare(a.DATE));
    return Number(sorted[0].CURRENT_READINGS) || 0;
  }

  public static getOutstandingWaterBalance(tableName: string): number {
    const records = this.getWaterRecordsByTable(tableName);
    let unpaidSum = 0;
    for (const r of records) {
      if (String(r.PAID || '').trim().toUpperCase() === 'NOT PAID') {
        unpaidSum += Number(r.TOTAL_BILL) || 0;
      }
    }
    return unpaidSum;
  }

  public static recalculateWaterTable(tableName: string): WaterRecord[] {
    const validTable = this.sanitizeWaterTableName(tableName);
    const db = this.getDB();
    if (!db.waterTables[validTable]) {
      db.waterTables[validTable] = [];
    }

    const list = [...db.waterTables[validTable]].sort((a, b) => a.DATE.localeCompare(b.DATE));
    let previousUnpaid = 0;

    for (const record of list) {
      const totalBill = Number(record.TOTAL_BILL) || 0;
      record.BALANCE = previousUnpaid;
      record.TOTAL = totalBill + previousUnpaid;

      const isUnpaid = String(record.PAID || '').trim().toUpperCase() === 'NOT PAID';
      if (isUnpaid) {
        previousUnpaid += totalBill;
      }
    }

    db.waterTables[validTable] = list;
    this.saveDB(db);
    return list;
  }

  public static getWaterRecords(tenantNumber: string): WaterRecord[] {
    const validTable = this.sanitizeWaterTableName(tenantNumber);
    const db = this.getDB();
    return db.waterTables[validTable] || [];
  }

  public static async pushWaterRecordsToSupabase(tableOrTenant?: string): Promise<{ success: boolean; count: number; error?: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, count: 0, error: 'Supabase client not configured' };
    }

    try {
      const db = this.getDB();
      const tablesToSync: string[] = tableOrTenant
        ? [this.sanitizeWaterTableName(tableOrTenant)]
        : [...this.ALLOWED_WATER_TABLES];

      let totalPushed = 0;

      for (const tName of tablesToSync) {
        const records = db.waterTables[tName] || [];
        if (records.length === 0) continue;

        const tenantNum = tName.replace('Water_', '');
        const rows = records.map((w, idx) => {
          const recordId = String(w.id).startsWith(`${tName}_`)
            ? String(w.id)
            : `${tName}_${w.id || idx}_${w.DATE}`;
          w.id = recordId;
          return {
            id: recordId,
            table_name: tName,
            tenant_number: tenantNum,
            date: w.DATE,
            previous_reading: Number(w.PREVIOUS_READINGS) || 0,
            current_reading: Number(w.CURRENT_READINGS) || 0,
            units: (Number(w.CURRENT_READINGS) || 0) - (Number(w.PREVIOUS_READINGS) || 0),
            cost_per_unit: 10,
            total_bill: Number(w.TOTAL_BILL) || 0,
            balance: Number(w.BALANCE) || 0,
            paid: (w.PAID || 'NOT PAID').toUpperCase(),
            total: Number(w.TOTAL) || 0,
          };
        });

        const { error } = await supabase.from('water_records').upsert(rows);
        if (error) {
          console.error(`Error pushing ${tName} to Supabase:`, error);
          return { success: false, count: totalPushed, error: error.message };
        }
        totalPushed += rows.length;
      }

      console.log(`[Supabase] Synced ${totalPushed} water records successfully`);
      return { success: true, count: totalPushed };
    } catch (err: any) {
      console.error('Failed to push water records to Supabase:', err);
      return { success: false, count: 0, error: err?.message || 'Unknown error' };
    }
  }

  public static async pushTenantInfosToSupabase(): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) return false;
    try {
      const db = this.getDB();
      const rows = Object.entries(db.infoTables).map(([key, list]) => {
        const tenantNum = key.replace('INFO_', '');
        const info = list[0] as CustomerInfoRecord | undefined;
        return {
          tenant_number: tenantNum,
          name: info?.NAME || `Tenant ${tenantNum}`,
          phone: info?.PHONE_NUMBER || '',
          arrived_date: info?.ARRIVED_DATE || '',
          advance_paid: Number(info?.ADVANCE_PAID) || 0,
          current_rent: Number(info?.CURRENT_RENT) || 0,
          current_increment: Number(info?.CURRENT_INCREMENT) || 0,
          yearly_increment: Number(info?.YEARLY_INCREMENT) || 5,
        };
      });
      const { error } = await supabase.from('tenant_infos').upsert(rows, { onConflict: 'tenant_number' });
      if (error) console.error('Tenant info push error:', error);
      return !error;
    } catch (err) {
      console.error('Failed to push tenant infos to Supabase:', err);
      return false;
    }
  }

  public static async pushAllToSupabase(): Promise<{
    rentCount: number;
    waterCount: number;
    success: boolean;
    error?: string;
  }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { rentCount: 0, waterCount: 0, success: false, error: 'Supabase client is not configured.' };
    }

    const rentRes = await this.pushRentRecordsToSupabase();
    const waterRes = await this.pushWaterRecordsToSupabase();
    await this.pushTenantInfosToSupabase();

    return {
      rentCount: rentRes.count,
      waterCount: waterRes.count,
      success: rentRes.success && waterRes.success,
      error: rentRes.error || waterRes.error,
    };
  }

  public static insertWaterRecord(tenantNumber: string, record: Omit<WaterRecord, 'id'>) {
    const validTable = this.sanitizeWaterTableName(tenantNumber);
    const db = this.getDB();
    if (!db.waterTables[validTable]) db.waterTables[validTable] = [];
    const newId = `water_${tenantNumber.replace('Water_', '')}_${Date.now()}`;
    db.waterTables[validTable].push({ ...record, id: newId });
    this.saveDB(db);
    const updated = this.recalculateWaterTable(validTable);

    // Live push to Supabase
    this.pushWaterRecordsToSupabase(validTable).catch((err) =>
      console.error('Supabase auto-sync failed on insertWaterRecord:', err)
    );

    return updated;
  }

  public static updateWaterRecord(tenantNumber: string, idOrDate: string | number, record: Partial<WaterRecord>) {
    const validTable = this.sanitizeWaterTableName(tenantNumber);
    const db = this.getDB();
    const list = db.waterTables[validTable] || [];
    const idx = list.findIndex((r) => String(r.id) === String(idOrDate) || r.DATE === String(idOrDate));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...record };
      this.saveDB(db);
    }
    const updated = this.recalculateWaterTable(validTable);

    // Live push to Supabase
    this.pushWaterRecordsToSupabase(validTable).catch((err) =>
      console.error('Supabase auto-sync failed on updateWaterRecord:', err)
    );

    return updated;
  }

  public static deleteWaterRecord(tenantNumber: string, idOrDate: string | number) {
    const validTable = this.sanitizeWaterTableName(tenantNumber);
    const db = this.getDB();
    if (db.waterTables[validTable]) {
      const deletedItem = db.waterTables[validTable].find(
        (r) => String(r.id) === String(idOrDate) || r.DATE === String(idOrDate)
      );

      db.waterTables[validTable] = db.waterTables[validTable].filter(
        (r) => String(r.id) !== String(idOrDate) && r.DATE !== String(idOrDate)
      );
      this.saveDB(db);

      // Live delete from Supabase, then sync remaining
      if (deletedItem && isSupabaseConfigured() && supabase) {
        (async () => {
          try {
            await supabase
              .from('water_records')
              .delete()
              .eq('id', String(deletedItem.id));
            this.pushWaterRecordsToSupabase(validTable);
          } catch (err) {
            console.error('Supabase delete water record error:', err);
          }
        })();
      }
    }
    return this.recalculateWaterTable(validTable);
  }

  // Info CRUD (INFO_11 .. INFO_41)
  public static getInfoRecords(tenantNumber: string): CustomerInfoRecord[] {
    const infoKey = `INFO_${tenantNumber}`;
    const db = this.getDB();
    return db.infoTables[infoKey] || [];
  }

  public static getInfoRecord(tenantNumber: string): CustomerInfoRecord | null {
    const list = this.getInfoRecords(tenantNumber);
    return list.length > 0 ? list[0] : null;
  }

  public static insertInfoRecord(tenantNumber: string, record: Omit<CustomerInfoRecord, 'id'>) {
    const infoKey = `INFO_${tenantNumber}`;
    const db = this.getDB();
    if (!db.infoTables[infoKey]) db.infoTables[infoKey] = [];
    const newId = Date.now();
    db.infoTables[infoKey].unshift({ ...record, id: newId });
    this.saveDB(db);
    this.pushTenantInfosToSupabase().catch(() => {});
  }

  public static updateInfoRecord(tenantNumber: string, id: string | number, record: Partial<CustomerInfoRecord>) {
    const infoKey = `INFO_${tenantNumber}`;
    const db = this.getDB();
    const list = db.infoTables[infoKey] || [];
    const idx = list.findIndex((r) => String(r.id) === String(id));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...record };
      this.saveDB(db);
      this.pushTenantInfosToSupabase().catch(() => {});
    }
  }

  public static deleteInfoRecord(tenantNumber: string, id: string | number) {
    const infoKey = `INFO_${tenantNumber}`;
    const db = this.getDB();
    if (db.infoTables[infoKey]) {
      db.infoTables[infoKey] = db.infoTables[infoKey].filter((r) => String(r.id) !== String(id));
      this.saveDB(db);
      this.pushTenantInfosToSupabase().catch(() => {});
    }
  }

  public static getTenantInfoList(): CustomerInfoRecord[] {
    const result: CustomerInfoRecord[] = [];
    for (const num of Object.keys(TENANT_TABLE_MAP)) {
      const rec = this.getInfoRecord(num);
      if (rec) {
        result.push(rec);
      } else {
        const mapInfo = TENANT_TABLE_MAP[num];
        result.push({
          id: num,
          USERNAME: num,
          NAME: mapInfo.tenantName,
          PHONE_NUMBER: mapInfo.phone,
          ARRIVED_DATE: '2023-01-15',
          ADVANCE_PAID: 50000,
          CURRENT_RENT: 12000,
          CURRENT_INCREMENT: 600,
          YEARLY_INCREMENT: 5,
        });
      }
    }
    return result;
  }

  public static getRentAllSummary(): { totalRent: number; totalPaid: number; pendingCount: number } {
    let totalRent = 0;
    let totalPaid = 0;
    let pendingCount = 0;
    for (const num of Object.keys(TENANT_TABLE_MAP)) {
      const rent = this.getLatestRentRecord(num);
      const tot = rent?.TOTAL ?? 0;
      totalRent += tot;
      if (isPaid(rent?.PAID)) {
        totalPaid += rent?.PAYMENT ?? tot;
      } else {
        pendingCount++;
      }
    }
    return { totalRent, totalPaid, pendingCount };
  }

  public static getWaterAllSummary(): { totalDue: number; totalPaid: number; pendingCount: number } {
    let totalDue = 0;
    let totalPaid = 0;
    let pendingCount = 0;
    for (const num of Object.keys(TENANT_TABLE_MAP)) {
      const water = this.getLatestWaterRecord(num);
      const tot = water?.TOTAL ?? 0;
      totalDue += tot;
      if (isPaid(water?.PAID)) {
        totalPaid += tot;
      } else {
        pendingCount++;
      }
    }
    return { totalDue, totalPaid, pendingCount };
  }

  // Customer Login Management (CUSTOMERLOGIN Table)
  public static getCustomerLogins(): CustomerLoginRecord[] {
    const db = this.getDB();
    return db.customerLogins || [];
  }

  public static insertCustomerLogin(username: string, password: string) {
    const db = this.getDB();
    const newId = Date.now();
    db.customerLogins.push({ id: newId, USERNAME: username, PASSWORD: password });
    db.passwords[username] = password;
    this.saveDB(db);
  }

  public static updateCustomerLogin(id: number, username: string, password: string) {
    const db = this.getDB();
    const idx = db.customerLogins.findIndex((c) => c.id === id);
    if (idx !== -1) {
      db.customerLogins[idx].USERNAME = username;
      db.customerLogins[idx].PASSWORD = password;
      db.passwords[username] = password;
      this.saveDB(db);
    }
  }

  public static deleteCustomerLogin(id: number) {
    const db = this.getDB();
    const target = db.customerLogins.find((c) => c.id === id);
    if (target) {
      delete db.passwords[target.USERNAME];
    }
    db.customerLogins = db.customerLogins.filter((c) => c.id !== id);
    this.saveDB(db);
  }

  // Payment Submissions & Admin Verification
  public static getPaymentSubmissions(): PaymentSubmission[] {
    const db = this.getDB();
    return db.paymentSubmissions || [];
  }

  public static submitPaymentProof(
    tenantNumber: string,
    amount: number,
    utrNumber: string,
    paymentMode: string = 'PhonePe UPI',
    notes?: string
  ): PaymentSubmission {
    const db = this.getDB();
    const tenantInfo = TENANT_TABLE_MAP[tenantNumber];
    const newSubmission: PaymentSubmission = {
      id: `PAY-${Date.now().toString().slice(-6)}`,
      tenantNumber,
      tenantName: tenantInfo ? tenantInfo.tenantName : `Tenant ${tenantNumber}`,
      amount,
      utrNumber: utrNumber.trim(),
      paymentMode,
      timestamp: new Date().toLocaleString(),
      status: 'PENDING',
      notes: notes || `Payment submitted via ${paymentMode}`,
    };
    db.paymentSubmissions.unshift(newSubmission);
    this.saveDB(db);
    return newSubmission;
  }

  public static approvePayment(submissionId: string) {
    const db = this.getDB();
    const sub = db.paymentSubmissions.find((s) => s.id === submissionId);
    if (!sub) return;

    sub.status = 'VERIFIED';

    // Mark latest Rent and Water as PAID and balance to 0
    const tenantNum = sub.tenantNumber;
    const info = TENANT_TABLE_MAP[tenantNum];
    if (info) {
      const rentList = db.rentTables[info.rentTable];
      if (rentList && rentList.length > 0) {
        rentList[0].PAID = 'PAID';
        rentList[0].BALANCE = 0;
        rentList[0].TOTAL = 0;
        rentList[0]['MODE OF PAYMENT'] = sub.paymentMode;
      }
      const waterList = db.waterTables[info.waterTable];
      if (waterList && waterList.length > 0) {
        waterList[0].PAID = 'PAID';
        waterList[0].BALANCE = 0;
        waterList[0].TOTAL = 0;
      }

      // Live push updated tables to Supabase
      this.pushRentRecordsToSupabase(info.rentTable).catch((err) =>
        console.error('Failed to sync rent to Supabase on approval:', err)
      );
      this.pushWaterRecordsToSupabase(info.waterTable).catch((err) =>
        console.error('Failed to sync water to Supabase on approval:', err)
      );
    }

    this.saveDB(db);

    // Update payment_submissions in Supabase
    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('payment_submissions')
        .update({ status: 'VERIFIED' })
        .eq('id', submissionId)
        .then(({ error }) => {
          if (error) console.warn('Supabase payment status update notice:', error.message);
        });

      // Explicitly ensure Supabase rent_records and water_records reflect PAID status and 0 balance
      supabase
        .from('rent_records')
        .update({ paid: 'PAID', unpaid: 0, previous_balance: 0 })
        .eq('tenant_number', tenantNum)
        .then(({ error }) => {
          if (error) console.warn('Supabase rent_records update notice on approval:', error.message);
        });

      supabase
        .from('water_records')
        .update({ paid: 'PAID', balance: 0, total: 0 })
        .eq('tenant_number', tenantNum)
        .then(({ error }) => {
          if (error) console.warn('Supabase water_records update notice on approval:', error.message);
        });
    }

    // Add In-App Notification for Tenant
    const residentName = this.getTenantResidentName(tenantNum);
    const tenantPhone = this.getTenantPhone(tenantNum);
    this.addNotification({
      tenantNumber: tenantNum,
      title: 'Payment Approved ✅',
      message: `Your payment of ${formatINR(sub.amount)} for Flat ${tenantNum} (${residentName}) has been approved and verified. Outstanding rent & water dues are now ₹0.00 (PAID).`,
      type: 'PAYMENT_APPROVED',
      urgency: 'NORMAL',
    });

    // Automated SMS Alert
    if (tenantPhone) {
      SmsService.sendPaymentApprovedSms(tenantPhone, residentName, tenantNum, sub.amount).catch((err) =>
        console.error('SMS notification error:', err)
      );
    }
  }

  public static rejectPayment(submissionId: string, reason?: string) {
    const db = this.getDB();
    const sub = db.paymentSubmissions.find((s) => s.id === submissionId);
    if (!sub) return;

    sub.status = 'REJECTED';
    this.saveDB(db);

    // Update payment_submissions in Supabase
    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('payment_submissions')
        .update({ status: 'REJECTED' })
        .eq('id', submissionId)
        .then(({ error }) => {
          if (error) console.warn('Supabase payment status update notice:', error.message);
        });
    }

    // Add In-App Notification for Tenant
    const residentName = this.getTenantResidentName(sub.tenantNumber);
    const tenantPhone = this.getTenantPhone(sub.tenantNumber);
    this.addNotification({
      tenantNumber: sub.tenantNumber,
      title: 'Payment Not Approved ⚠️',
      message: `Your payment submission of ${formatINR(sub.amount)} for Flat ${sub.tenantNumber} could not be approved. Reason: ${
        reason || 'Verification failed. Please review your UTR or contact management.'
      }`,
      type: 'PAYMENT_REJECTED',
      urgency: 'URGENT',
    });

    // Automated SMS Alert
    if (tenantPhone) {
      SmsService.sendPaymentRejectedSms(tenantPhone, residentName, sub.tenantNumber, reason).catch((err) =>
        console.error('SMS notification error:', err)
      );
    }
  }

  // Authentication
  public static verifyAdmin(user: string, pass: string): boolean {
    const db = this.getDB();
    return (
      (user.trim().toLowerCase() === 'admin' || user.trim().toLowerCase() === db.adminUser.username.toLowerCase()) &&
      pass === db.adminUser.passwordHash
    );
  }

  public static verifyTenant(tenantNum: string, pass: string): boolean {
    const db = this.getDB();
    const cleanNum = tenantNum.trim();
    if (!TENANT_TABLE_MAP[cleanNum]) return false;
    const expectedPass = db.passwords[cleanNum] || `tenant${cleanNum}`;
    return pass === expectedPass;
  }

  public static updateTenantPassword(tenantNum: string, newPass: string) {
    const db = this.getDB();
    db.passwords[tenantNum] = newPass;
    const loginRec = db.customerLogins.find((c) => c.USERNAME === tenantNum);
    if (loginRec) {
      loginRec.PASSWORD = newPass;
    }
    this.saveDB(db);
  }

  public static getPasswords(): Record<string, string> {
    return this.getDB().passwords;
  }

  public static getAllPasswords(): Record<string, string> {
    return this.getPasswords();
  }

  // Complaints & Maintenance Management
  public static getComplaints(tenantNumber?: string): ComplaintRecord[] {
    const db = this.getDB();
    const list = db.complaints || [];
    if (!tenantNumber) return list;
    return list.filter((c) => c.tenantNumber === tenantNumber);
  }

  public static submitComplaint(data: {
    tenantNumber: string;
    title: string;
    category: 'Plumbing' | 'Electrical' | 'Carpentry' | 'Appliance' | 'Cleaning' | 'Security' | 'General';
    description: string;
    room?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  }): ComplaintRecord {
    const db = this.getDB();
    if (!db.complaints) db.complaints = [];
    const tenantName = this.getTenantResidentName(data.tenantNumber);
    const newComplaint: ComplaintRecord = {
      id: `CMP-${Date.now().toString().slice(-5)}`,
      tenantNumber: data.tenantNumber,
      tenantName,
      title: data.title,
      category: data.category,
      description: data.description,
      room: data.room || `Flat ${data.tenantNumber}`,
      priority: data.priority || 'MEDIUM',
      status: 'OPEN',
      createdAt: new Date().toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    db.complaints.unshift(newComplaint);
    this.saveDB(db);
    return newComplaint;
  }

  public static updateComplaintStatus(
    complaintId: string,
    status: 'OPEN' | 'IN PROGRESS' | 'RESOLVED'
  ) {
    const db = this.getDB();
    if (!db.complaints) return;
    const item = db.complaints.find((c) => c.id === complaintId);
    if (item) {
      item.status = status;
      item.lastUpdated = new Date().toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
      if (status === 'RESOLVED') {
        item.resolvedAt = item.lastUpdated;
      }
      this.saveDB(db);

      // In-app notification for the tenant
      this.addNotification({
        tenantNumber: item.tenantNumber,
        title: `Maintenance Request ${status} 🛠️`,
        message: `Your maintenance ticket "${item.title}" for ${item.room} has been updated to ${status}.`,
        type: 'MAINTENANCE_UPDATE',
        urgency: status === 'RESOLVED' ? 'NORMAL' : 'NORMAL',
      });

      // SMS alert
      const tenantPhone = this.getTenantPhone(item.tenantNumber);
      if (tenantPhone) {
        SmsService.sendMaintenanceStatusSms(tenantPhone, item.tenantName, item.title, status).catch(console.error);
      }
    }
  }

  // Notices & Announcements
  public static getNotices(): NoticeRecord[] {
    const db = this.getDB();
    return db.notices || [];
  }

  public static createNotice(data: {
    title: string;
    description: string;
    category: 'Maintenance' | 'Security' | 'General' | 'Event' | 'Payment';
    priority?: 'NORMAL' | 'URGENT';
  }): NoticeRecord {
    const db = this.getDB();
    if (!db.notices) db.notices = [];
    const newNotice: NoticeRecord = {
      id: `NOT-${Date.now().toString().slice(-4)}`,
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category,
      priority: data.priority || 'NORMAL',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      isRead: false,
    };
    db.notices.unshift(newNotice);
    this.saveDB(db);

    if (newNotice.priority === 'URGENT') {
      this.publishUrgentNotice(newNotice.id);
    }

    return newNotice;
  }

  public static updateNotice(id: string, data: Partial<NoticeRecord>) {
    const db = this.getDB();
    if (!db.notices) return;
    const idx = db.notices.findIndex((n) => n.id === id);
    if (idx !== -1) {
      const wasUrgent = db.notices[idx].priority === 'URGENT';
      db.notices[idx] = { ...db.notices[idx], ...data };
      this.saveDB(db);
      if (data.priority === 'URGENT' && !wasUrgent) {
        this.publishUrgentNotice(id);
      }
    }
  }

  public static deleteNotice(id: string) {
    const db = this.getDB();
    if (!db.notices) return;
    db.notices = db.notices.filter((n) => n.id !== id);
    this.saveDB(db);
  }

  public static publishUrgentNotice(noticeId: string) {
    const db = this.getDB();
    const notice = (db.notices || []).find((n) => n.id === noticeId);
    if (!notice) return;

    notice.priority = 'URGENT';
    this.saveDB(db);

    // Create high-priority in-app notification broadcasted to all residents
    this.addNotification({
      tenantNumber: 'ALL',
      title: `🚨 URGENT: ${notice.title}`,
      message: notice.description,
      type: 'URGENT_ANNOUNCEMENT',
      urgency: 'URGENT',
    });

    // Dispatch SMS to all registered tenant phone numbers
    Object.keys(TENANT_TABLE_MAP).forEach((num) => {
      const phone = this.getTenantPhone(num);
      if (phone) {
        SmsService.sendUrgentAnnouncementSms(phone, notice.title, notice.description).catch((err) =>
          console.error(`Urgent announcement SMS failed for ${num}:`, err)
        );
      }
    });
  }

  public static markNoticeRead(noticeId: string) {
    const db = this.getDB();
    if (!db.notices) return;
    const notice = db.notices.find((n) => n.id === noticeId);
    if (notice) {
      notice.isRead = true;
      this.saveDB(db);
    }
  }

  // Notifications Management
  public static getNotifications(tenantNumber?: string): NotificationRecord[] {
    const db = this.getDB();
    const list = db.notifications || [];
    if (!tenantNumber) return list;
    if (tenantNumber === 'ADMIN') {
      return list.filter((n) => n.tenantNumber === 'ADMIN' || n.tenantNumber === 'ALL');
    }
    return list.filter((n) => n.tenantNumber === tenantNumber || n.tenantNumber === 'ALL');
  }

  public static addNotification(data: {
    tenantNumber: string;
    title: string;
    message: string;
    type: 'PAYMENT_APPROVED' | 'PAYMENT_REJECTED' | 'URGENT_ANNOUNCEMENT' | 'MAINTENANCE_UPDATE' | 'NOTICE';
    urgency?: 'NORMAL' | 'URGENT';
  }): NotificationRecord {
    const db = this.getDB();
    if (!db.notifications) db.notifications = [];
    const newNotif: NotificationRecord = {
      id: `NOTIF-${Date.now().toString().slice(-6)}`,
      tenantNumber: data.tenantNumber,
      title: data.title,
      message: data.message,
      type: data.type,
      urgency: data.urgency || 'NORMAL',
      createdAt: new Date().toLocaleString([], {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      isRead: false,
    };
    db.notifications.unshift(newNotif);
    this.saveDB(db);
    return newNotif;
  }

  public static markNotificationRead(id: string) {
    const db = this.getDB();
    if (!db.notifications) return;
    const notif = db.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.saveDB(db);
    }
  }

  public static markAllNotificationsRead(tenantNumber?: string) {
    const db = this.getDB();
    if (!db.notifications) return;
    db.notifications.forEach((n) => {
      if (!tenantNumber || n.tenantNumber === tenantNumber || n.tenantNumber === 'ALL') {
        n.isRead = true;
      }
    });
    this.saveDB(db);
  }

  public static clearNotifications(tenantNumber?: string) {
    const db = this.getDB();
    if (!db.notifications) return;
    if (!tenantNumber) {
      db.notifications = [];
    } else {
      db.notifications = db.notifications.filter((n) => n.tenantNumber !== tenantNumber);
    }
    this.saveDB(db);
  }

  public static resetDefaults() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}
