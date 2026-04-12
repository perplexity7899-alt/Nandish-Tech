# Payment System Database Updates

## Overview
Complete SQL queries to update the Supabase database to fully support the payment system with UPI, Razorpay, and payment method tracking.

## Current Status
- ✅ `project_purchases` table exists with basic payment fields
- ✅ `payment_method` column already added (tracks "upi" or "razorpay")
- ✅ Client info columns added (client_name, client_email, project_title)
- ❌ `payment_method` column needs to be created (if not already present)
- ❌ UPI payment details tracking needed

## Required Database Updates

### 1. Add Payment Method Column (If Not Exists)
This column tracks which payment method was used: "upi" or "razorpay"

```sql
-- Add payment_method column to project_purchases table
ALTER TABLE IF EXISTS public.project_purchases
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN public.project_purchases.payment_method IS 'Payment method used: "upi" or "razorpay"';

-- Add constraint to ensure valid values
ALTER TABLE public.project_purchases
ADD CONSTRAINT check_payment_method 
CHECK (payment_method IS NULL OR payment_method IN ('upi', 'razorpay'));
```

---

### 2. Add UPI Transaction ID Column
For tracking UPI transaction references

```sql
-- Add UPI transaction ID column
ALTER TABLE IF EXISTS public.project_purchases
ADD COLUMN IF NOT EXISTS upi_transaction_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS upi_reference_id TEXT DEFAULT NULL;

-- Add comments
COMMENT ON COLUMN public.project_purchases.upi_transaction_id IS 'UPI transaction reference number for manual verification';
COMMENT ON COLUMN public.project_purchases.upi_reference_id IS 'Internal reference ID for UPI payment tracking';
```

---

### 3. Create Payment Settings Table (For Admin Configuration)
Store admin-configured payment settings instead of relying only on localStorage

```sql
-- Create payment_settings table (optional - for redundancy/backup)
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upi_id TEXT NOT NULL,
  qr_code_image_url TEXT DEFAULT NULL,
  upi_enabled BOOLEAN DEFAULT true,
  razorpay_enabled BOOLEAN DEFAULT true,
  razorpay_key_id TEXT DEFAULT NULL,
  razorpay_key_secret TEXT DEFAULT NULL,
  payment_name TEXT DEFAULT 'Nandish-Tech',
  min_amount DECIMAL(10, 2) DEFAULT 0,
  max_amount DECIMAL(10, 2) DEFAULT 1000000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE public.payment_settings IS 'Admin-configured payment settings (primary storage on localStorage, optional database backup)';

-- Add row-level security
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view/update
CREATE POLICY "Only admins can view payment settings"
ON public.payment_settings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

CREATE POLICY "Only admins can update payment settings"
ON public.payment_settings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

CREATE POLICY "Only admins can insert payment settings"
ON public.payment_settings
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);
```

---

### 4. Add Payment Status History Table (Optional - For Audit Trail)
Track payment status changes for audit purposes

```sql
-- Create payment_status_history table
CREATE TABLE IF NOT EXISTS public.payment_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by UUID,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (purchase_id) REFERENCES public.project_purchases(id) ON DELETE CASCADE
);

-- Add comment
COMMENT ON TABLE public.payment_status_history IS 'Audit trail for payment status changes';

-- Add index for quick lookups
CREATE INDEX IF NOT EXISTS idx_payment_status_history_purchase_id 
ON public.payment_status_history(purchase_id);
```

---

### 5. Add Payment Refund/Reversal Support
Track if a payment was refunded

```sql
-- Add refund-related columns to project_purchases
ALTER TABLE IF EXISTS public.project_purchases
ADD COLUMN IF NOT EXISTS refunded BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10, 2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS refund_reason TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add comments
COMMENT ON COLUMN public.project_purchases.refunded IS 'Whether the payment was refunded';
COMMENT ON COLUMN public.project_purchases.refund_amount IS 'Amount refunded (may be less than original amount)';
COMMENT ON COLUMN public.project_purchases.refund_reason IS 'Reason for refund';
COMMENT ON COLUMN public.project_purchases.refunded_at IS 'Timestamp when payment was refunded';
```

---

### 6. Add Payment Verification Fields
For admin verification of manual UPI payments

```sql
-- Add verification-related columns
ALTER TABLE IF EXISTS public.project_purchases
ADD COLUMN IF NOT EXISTS manual_verification_needed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_by UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS verification_notes TEXT DEFAULT NULL;

-- Add comments
COMMENT ON COLUMN public.project_purchases.manual_verification_needed IS 'Whether manual verification is needed (for UPI payments)';
COMMENT ON COLUMN public.project_purchases.verified_by IS 'Admin user ID who verified the payment';
COMMENT ON COLUMN public.project_purchases.verification_notes IS 'Notes added during payment verification';

-- Add foreign key constraint
ALTER TABLE public.project_purchases
ADD CONSTRAINT fk_verified_by_user 
FOREIGN KEY (verified_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
```

---

### 7. Create Indexes for Performance
Optimize payment queries

```sql
-- Create indexes for common payment queries
CREATE INDEX IF NOT EXISTS idx_project_purchases_payment_method 
ON public.project_purchases(payment_method);

CREATE INDEX IF NOT EXISTS idx_project_purchases_user_id_project_id 
ON public.project_purchases(user_id, project_id);

CREATE INDEX IF NOT EXISTS idx_project_purchases_payment_status 
ON public.project_purchases(payment_status);

CREATE INDEX IF NOT EXISTS idx_project_purchases_created_at 
ON public.project_purchases(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_project_purchases_verified_at 
ON public.project_purchases(verified_at DESC);
```

---

## Current project_purchases Table Structure

After all updates, the `project_purchases` table should have:

```
Column Name              | Type                    | Default    | Comment
------------------------+-----------------------+------------+---------
id                       | UUID                    | gen_random | Primary key
user_id                  | UUID                    | NOT NULL   | Foreign key to profiles
project_id               | UUID                    | NOT NULL   | Foreign key to projects
payment_id               | TEXT                    | NULL       | Razorpay payment ID
payment_status           | VARCHAR(50)             | "pending"  | Status of payment
code_access              | BOOLEAN                 | false      | Access to project code
live_access              | BOOLEAN                 | false      | Access to live server
client_name              | TEXT                    | NULL       | Client name
client_email             | TEXT                    | NULL       | Client email
project_title            | TEXT                    | NULL       | Project title
rejection_reason         | TEXT                    | NULL       | Rejection reason if rejected
payment_method           | VARCHAR(20)             | NULL       | "upi" or "razorpay"
upi_transaction_id       | TEXT                    | NULL       | UPI transaction reference
upi_reference_id         | TEXT                    | NULL       | Internal UPI reference
verified_at              | TIMESTAMP WITH TIME ZONE| NULL       | When admin verified
approved_at              | TIMESTAMP WITH TIME ZONE| NULL       | When admin approved
refunded                 | BOOLEAN                 | false      | Whether refunded
refund_amount            | DECIMAL(10,2)           | NULL       | Refund amount
refund_reason            | TEXT                    | NULL       | Reason for refund
refunded_at              | TIMESTAMP WITH TIME ZONE| NULL       | When refunded
manual_verification_needed| BOOLEAN                | false      | Needs manual verify
verified_by              | UUID                    | NULL       | Admin who verified
verification_notes       | TEXT                    | NULL       | Verification notes
created_at               | TIMESTAMP WITH TIME ZONE| NOW()      | Creation timestamp
updated_at               | TIMESTAMP WITH TIME ZONE| NOW()      | Update timestamp
```

---

## Implementation Steps

1. **Run these SQL queries in Supabase SQL Editor in order:**
   - First: Payment method column
   - Second: UPI transaction columns
   - Third: Payment settings table (optional)
   - Fourth: Payment status history (optional)
   - Fifth: Refund columns
   - Sixth: Verification columns
   - Seventh: Create indexes

2. **Create migration file** (recommended):
   - Create: `supabase/migrations/20260412_payment_system_complete.sql`
   - Copy all SQL from sections 1-7
   - Run via Supabase CLI: `supabase db push`

3. **Update application code** (already done):
   - ✅ `recordUPIPayment()` in PaymentOptionsDialog.tsx
   - ✅ `initiatePayment()` in razorpay.ts
   - ✅ PaymentSettingsManager.tsx for admin controls
   - ✅ Conditional tab rendering based on admin settings

4. **Test payment flow:**
   - Admin enables/disables payment methods
   - Client sees only enabled payment options
   - UPI payments record payment_method = "upi"
   - Razorpay payments record payment_method = "razorpay"
   - Admin can verify and approve payments

---

## Migration File Template

Create file: `supabase/migrations/20260412_payment_system_complete.sql`

```sql
-- Payment System Complete Setup
-- Created: 2026-04-12
-- Description: Add all required columns and tables for complete payment system

-- 1. Add payment method column
ALTER TABLE IF EXISTS public.project_purchases
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT NULL;

COMMENT ON COLUMN public.project_purchases.payment_method IS 'Payment method used: "upi" or "razorpay"';

-- 2. Add UPI transaction columns
ALTER TABLE IF EXISTS public.project_purchases
ADD COLUMN IF NOT EXISTS upi_transaction_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS upi_reference_id TEXT DEFAULT NULL;

COMMENT ON COLUMN public.project_purchases.upi_transaction_id IS 'UPI transaction reference number';
COMMENT ON COLUMN public.project_purchases.upi_reference_id IS 'Internal UPI reference ID';

-- 3. Add refund columns
ALTER TABLE IF EXISTS public.project_purchases
ADD COLUMN IF NOT EXISTS refunded BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10, 2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS refund_reason TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 4. Add verification columns
ALTER TABLE IF EXISTS public.project_purchases
ADD COLUMN IF NOT EXISTS manual_verification_needed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_by UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS verification_notes TEXT DEFAULT NULL;

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_project_purchases_payment_method 
ON public.project_purchases(payment_method);

CREATE INDEX IF NOT EXISTS idx_project_purchases_user_id_project_id 
ON public.project_purchases(user_id, project_id);

CREATE INDEX IF NOT EXISTS idx_project_purchases_payment_status 
ON public.project_purchases(payment_status);
```

---

## Notes

- **localStorage Storage**: Payment settings (UPI ID, QR code, enabled methods) are currently stored in localStorage. Database backup is optional.
- **Backward Compatibility**: All columns have DEFAULT values, won't break existing records.
- **Security**: Row-level security policies prevent non-admin access to payment settings.
- **Payment Method Tracking**: Every purchase now records which payment method was used for audit purposes.
