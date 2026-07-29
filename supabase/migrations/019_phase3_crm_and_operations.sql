-- 019_phase3_crm_and_operations.sql
-- Urgent Taxis Platform - Migration 019: CRM, Finance, Operations Additive Extensions

-- 1. ADDITIVE COLUMNS TO EXISTING TABLES --

-- Enquiries Extensions
ALTER TABLE enquiries 
ADD COLUMN IF NOT EXISTS lead_source VARCHAR(100),
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS expected_conversion_value NUMERIC(12, 2);

-- Bookings Extensions
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS return_datetime TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS special_instructions TEXT,
ADD COLUMN IF NOT EXISTS internal_notes TEXT,
ADD COLUMN IF NOT EXISTS lead_source VARCHAR(100),
ADD COLUMN IF NOT EXISTS booking_source VARCHAR(100);

-- Fare Snapshots Extensions (Strict numerical mapping)
ALTER TABLE fare_snapshots
ADD COLUMN IF NOT EXISTS base_fare NUMERIC(12, 2),
ADD COLUMN IF NOT EXISTS included_km NUMERIC(12, 2),
ADD COLUMN IF NOT EXISTS extra_km_rate NUMERIC(12, 2),
ADD COLUMN IF NOT EXISTS toll_tax NUMERIC(12, 2),
ADD COLUMN IF NOT EXISTS state_tax NUMERIC(12, 2),
ADD COLUMN IF NOT EXISTS customer_payable NUMERIC(12, 2),
ADD COLUMN IF NOT EXISTS token_amount NUMERIC(12, 2),
ADD COLUMN IF NOT EXISTS balance_amount NUMERIC(12, 2);

-- Payments Extensions
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS payment_type VARCHAR(50) DEFAULT 'balance', -- e.g., 'token', 'partial', 'balance'
ADD COLUMN IF NOT EXISTS remarks TEXT;


-- 2. NEW TABLES --

CREATE TABLE IF NOT EXISTS staff_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  check_in TIMESTAMPTZ NOT NULL DEFAULT now(),
  check_out TIMESTAMPTZ,
  duty_hours NUMERIC(5, 2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  activity_type VARCHAR(100) NOT NULL, -- e.g., 'STATUS_CHANGE', 'QUOTATION_SENT'
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  enquiry_id UUID REFERENCES enquiries(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  channel VARCHAR(50) NOT NULL, -- e.g., 'WHATSAPP', 'EMAIL', 'CALL'
  direction VARCHAR(20) NOT NULL, -- 'INBOUND', 'OUTBOUND'
  message_summary TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID REFERENCES enquiries(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  reminder_datetime TIMESTAMPTZ NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  expense_category VARCHAR(100) NOT NULL, -- e.g., 'TOLL', 'FUEL', 'STATE_TAX'
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vendor_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  transaction_reference VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS driver_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  payout_type VARCHAR(100) NOT NULL, -- e.g., 'ALLOWANCE', 'INCENTIVE'
  transaction_reference VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  payment_id UUID REFERENCES payments(id) ON DELETE RESTRICT,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  reason TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'processing',
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS driver_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL, -- 'DL', 'POLICE_VERIFICATION', 'BADGE'
  file_url TEXT NOT NULL,
  expiry_date DATE,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicle_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_id UUID NOT NULL REFERENCES actual_fleet(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL, -- 'RC', 'INSURANCE', 'FITNESS', 'PERMIT', 'PUC'
  file_url TEXT NOT NULL,
  expiry_date DATE,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL, -- 'AADHAAR', 'PAN', 'PASSPORT'
  file_url TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE, -- NULL means global/system notification
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance on new tables
CREATE INDEX IF NOT EXISTS idx_lead_activities_enquiry ON lead_activities(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_cust_comms_customer ON customer_communications(customer_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_booking ON expenses(booking_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payouts_vendor ON vendor_payouts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_driver_payouts_driver ON driver_payouts(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_docs_driver ON driver_documents(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_docs_fleet ON vehicle_documents(fleet_id);
CREATE INDEX IF NOT EXISTS idx_cust_docs_customer ON customer_documents(customer_id);
