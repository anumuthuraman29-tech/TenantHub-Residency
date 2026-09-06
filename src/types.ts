export interface RentRecord {
  id?: string | number;
  DATE: string;
  DAY: string;
  PAYMENT: number;
  BALANCE: number;
  TOTAL: number;
  'MODE OF PAYMENT': string;
  PAID: string;
}

export interface WaterRecord {
  id?: string | number;
  DATE: string;
  DAY: string;
  CURRENT_READINGS: number;
  PREVIOUS_READINGS: number;
  KITCHEN: number;
  TOTAL_BILL: number;
  BALANCE: number;
  TOTAL: number;
  PAID: string;
}

export interface CustomerInfoRecord {
  id?: string | number;
  USERNAME: string;
  NAME: string;
  PHONE_NUMBER: string;
  ARRIVED_DATE: string;
  ADVANCE_PAID: number | string;
  CURRENT_RENT: number | string;
  CURRENT_INCREMENT: number | string;
  YEARLY_INCREMENT: number | string;
}

export interface TenantTableInfo {
  tenantNumber: string;
  tenantName: string;
  phone: string;
  email: string;
  rentTable: string;
  waterTable: string;
  infoTable: string;
}

export interface PaymentSubmission {
  id: string;
  tenantNumber: string;
  tenantName: string;
  amount: number;
  utrNumber: string;
  paymentMode: string;
  timestamp: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  notes?: string;
}

export interface ComplaintRecord {
  id: string;
  tenantNumber: string;
  tenantName: string;
  title: string;
  category: 'Plumbing' | 'Electrical' | 'Carpentry' | 'Appliance' | 'Cleaning' | 'Security' | 'General';
  description: string;
  room: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'IN PROGRESS' | 'RESOLVED';
  createdAt: string;
  lastUpdated?: string;
  resolvedAt?: string;
}

export interface NoticeRecord {
  id: string;
  title: string;
  description: string;
  category: 'Maintenance' | 'Security' | 'General' | 'Event' | 'Payment';
  date: string;
  priority: 'NORMAL' | 'URGENT';
  isRead?: boolean;
}

export interface NotificationRecord {
  id: string;
  tenantNumber: string; // '11'..'41', 'ALL', or 'ADMIN'
  title: string;
  message: string;
  type: 'PAYMENT_APPROVED' | 'PAYMENT_REJECTED' | 'URGENT_ANNOUNCEMENT' | 'MAINTENANCE_UPDATE' | 'NOTICE';
  urgency: 'NORMAL' | 'URGENT';
  createdAt: string;
  isRead: boolean;
}

export type PageId =
  | 'login'
  | 'adminloginpage'
  | 'adminmainpage'
  | 'customerloginpage'
  | 'customermainpage'
  | 'customerinfo'
  | 'infoallpage'
  | 'infoeditpage'
  | 'rentallpage'
  | 'rentedit'
  | 'rentpage'
  | 'waterallpage'
  | 'wateredit'
  | 'waterbillpage'
  | 'paymentpage'
  | 'paypage'
  | 'complaintspage'
  | 'noticespage'
  | 'residencypage'
  | 'profilepage'
  | 'adminpaymentverify'
  | 'adminmaintenance'
  | 'adminannouncements'
  | 'adminnotifications'
  | 'passwordallpage'
  | 'infopage'
  | 'sendpayment'
  | 'designshowcase'
  | 'codeexplorer';

export interface CodeFile {
  name: string;
  path: string;
  type: 'aspx' | 'csharp' | 'sql' | 'config' | 'doc' | 'sln';
  description: string;
  content: string;
}
