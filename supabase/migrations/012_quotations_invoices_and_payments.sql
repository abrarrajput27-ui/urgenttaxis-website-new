-- 012_quotations_invoices_and_payments.sql
-- Urgent Taxis Platform - Migration 012: Quotations, Invoices and Payments Ledger

CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  category_id UUID NOT NULL REFERENCES vehicle_categories(id) ON DELETE RESTRICT,
  trip_type trip_type_enum NOT NULL,
  quoted_fare NUMERIC(12, 2) NOT NULL CHECK (quoted_fare >= 0),
  breakdown_json JSONB NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  invoice_id UUID REFERENCES invoices(id) ON DELETE RESTRICT,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  payment_mode payment_mode_enum NOT NULL,
  transaction_reference VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'success',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quotations_customer ON quotations(customer_id);
CREATE INDEX idx_invoices_booking ON invoices(booking_id);
CREATE INDEX idx_payments_booking ON payments(booking_id);
