-- Supabase PostgreSQL Schema for Tenant Hub Residency
-- Run this in your Supabase SQL Editor (supabase.com -> SQL Editor -> New Query)

-- 1. Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Customer Logins
CREATE TABLE IF NOT EXISTS customer_logins (
  id BIGSERIAL PRIMARY KEY,
  tenant_number TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tenant Info
CREATE TABLE IF NOT EXISTS tenant_infos (
  id BIGSERIAL PRIMARY KEY,
  tenant_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  arrived_date TEXT,
  advance_paid NUMERIC,
  current_rent NUMERIC,
  current_increment NUMERIC,
  yearly_increment NUMERIC,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Rent Records
CREATE TABLE IF NOT EXISTS rent_records (
  id TEXT PRIMARY KEY,
  table_name TEXT NOT NULL,
  tenant_number TEXT NOT NULL,
  date TEXT NOT NULL,
  previous_balance NUMERIC DEFAULT 0,
  payment NUMERIC DEFAULT 0,
  unpaid NUMERIC DEFAULT 0,
  paid TEXT DEFAULT 'NOT PAID',
  mode_of_payment TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Water Bill Records
CREATE TABLE IF NOT EXISTS water_records (
  id TEXT PRIMARY KEY,
  table_name TEXT NOT NULL,
  tenant_number TEXT NOT NULL,
  date TEXT NOT NULL,
  previous_reading NUMERIC DEFAULT 0,
  current_reading NUMERIC DEFAULT 0,
  units NUMERIC DEFAULT 0,
  cost_per_unit NUMERIC DEFAULT 10,
  total_bill NUMERIC DEFAULT 0,
  balance NUMERIC DEFAULT 0,
  paid TEXT DEFAULT 'NOT PAID',
  total NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Payment Approvals / Submissions
CREATE TABLE IF NOT EXISTS payment_submissions (
  id TEXT PRIMARY KEY,
  tenant_number TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  utr_number TEXT NOT NULL,
  payment_mode TEXT,
  notes TEXT,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and public policies for Anon client access
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_logins ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_infos ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon all admin_users" ON admin_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all customer_logins" ON customer_logins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all tenant_infos" ON tenant_infos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all rent_records" ON rent_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all water_records" ON water_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all payment_submissions" ON payment_submissions FOR ALL USING (true) WITH CHECK (true);

-- Insert Default Admin (Anu / 9916913919)
INSERT INTO admin_users (username, password_hash)
VALUES ('Anu', '9916913919')
ON CONFLICT (username) DO NOTHING;

-- Insert Default Tenant Logins
INSERT INTO customer_logins (tenant_number, password_hash) VALUES
  ('11', 'tenant11'),
  ('12', 'tenant12'),
  ('21', 'tenant21'),
  ('22', 'tenant22'),
  ('31', 'tenant31'),
  ('32', 'tenant32'),
  ('41', 'tenant41')
ON CONFLICT (tenant_number) DO NOTHING;
