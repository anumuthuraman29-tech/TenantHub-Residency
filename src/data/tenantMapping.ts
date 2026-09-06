import { TenantTableInfo } from '../types';

export const TENANT_TABLE_MAP: Record<string, TenantTableInfo> = {
  '11': {
    tenantNumber: '11',
    tenantName: 'Flat 101 (Tenant 11 - Muhammad Faiz)',
    phone: '+918129046082',
    email: 'muhammadfaiz.11@gmail.com',
    rentTable: 'RENT_11',
    waterTable: 'Water_11',
    infoTable: 'INFO_11',
  },
  '12': {
    tenantNumber: '12',
    tenantName: 'Flat 102 (Tenant 12 - Raju)',
    phone: '+917411464030',
    email: 'raju.12@gmail.com',
    rentTable: 'RENT_12',
    waterTable: 'Water_12',
    infoTable: 'INFO_12',
  },
  '21': {
    tenantNumber: '21',
    tenantName: 'Flat 201 (Tenant 21 - Sumanth)',
    phone: '+919740288342',
    email: 'sumanth.21@gmail.com',
    rentTable: 'RENT_21',
    waterTable: 'Water_21',
    infoTable: 'INFO_21',
  },
  '22': {
    tenantNumber: '22',
    tenantName: 'Flat 202 (Tenant 22 - Kala)',
    phone: '+918217496986',
    email: 'kala.22@gmail.com',
    rentTable: 'RENT_22',
    waterTable: 'Water_22',
    infoTable: 'INFO_22',
  },
  '31': {
    tenantNumber: '31',
    tenantName: 'Flat 301 (Tenant 31 - Pavan Naik)',
    phone: '+917619195999',
    email: 'pavannaik.31@gmail.com',
    rentTable: 'RENT_31',
    waterTable: 'Water_31',
    infoTable: 'INFO_31',
  },
  '32': {
    tenantNumber: '32',
    tenantName: 'Flat 302 (Tenant 32 - Ankith Das)',
    phone: '+916291416401',
    email: 'ankithdas.32@gmail.com',
    rentTable: 'RENT_32',
    waterTable: 'Water_32',
    infoTable: 'INFO_32',
  },
  '41': {
    tenantNumber: '41',
    tenantName: 'Flat 401 (Tenant 41 - Pavan Naik)',
    phone: '+917619195999',
    email: 'pavannaik.41@gmail.com',
    rentTable: 'RENT_41',
    waterTable: 'Water_41',
    infoTable: 'INFO_41',
  },
};

export function getTenantTables(tenantNumber: string): TenantTableInfo {
  const normalized = (tenantNumber || '').trim();
  const info = TENANT_TABLE_MAP[normalized];
  if (!info) {
    throw new Error(`Invalid tenant number '${tenantNumber}'. Must be one of: ${Object.keys(TENANT_TABLE_MAP).join(', ')}`);
  }
  return info;
}

export function isPaid(value: string | null | undefined): boolean {
  if (!value) return false;
  const clean = value.trim().toLowerCase();
  return clean === 'paid' || clean === 'yes' || clean === '1';
}

export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹ 0.00';
  }
  return `₹ ${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
