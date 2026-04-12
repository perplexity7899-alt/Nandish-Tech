-- ================================================================
-- PAYMENT SYSTEM DATABASE SETUP
-- Run this in Supabase SQL Editor
-- ================================================================

-- ================================================================
-- STEP 1: Add Payment Method Column (ESSENTIAL)
-- ================================================================
-- This column tracks whether payment was made via UPI or Razorpay
-- Copy and run this first
-- ================================================================

ALTER TABLE public.project_purchases
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT NULL;

COMMENT ON COLUMN public.project_purchases.payment_method IS 'Payment method used: upi or razorpay';

-- After this step, your database is ready for:
-- - Recording UPI payments (payment_method = 'upi')
-- - Recording Razorpay payments (payment_method = 'razorpay')


-- ================================================================
-- STEP 2: Add UPI Transaction Tracking (ESSENTIAL)
-- ================================================================
-- Track UPI transaction IDs for manual verification
-- Run this second
-- ================================================================

ALTER TABLE public.project_purchases
ADD COLUMN IF NOT EXISTS upi_transaction_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS upi_reference_id TEXT DEFAULT NULL;

COMMENT ON COLUMN public.project_purchases.upi_transaction_id IS 'UPI transaction reference for verification';
COMMENT ON COLUMN public.project_purchases.upi_reference_id IS 'Internal UPI reference ID';

-- After this step, UPI payments can store transaction reference IDs


-- ================================================================
-- STEP 3: Add Refund Support (RECOMMENDED)
-- ================================================================
-- Track refunded payments for accounting
-- Run this third
-- ================================================================

ALTER TABLE public.project_purchases
ADD COLUMN IF NOT EXISTS refunded BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10, 2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS refund_reason TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

COMMENT ON COLUMN public.project_purchases.refunded IS 'Whether payment was refunded';
COMMENT ON COLUMN public.project_purchases.refund_amount IS 'Amount that was refunded';
COMMENT ON COLUMN public.project_purchases.refund_reason IS 'Reason for refund';
COMMENT ON COLUMN public.project_purchases.refunded_at IS 'When payment was refunded';

-- After this step, you can track refunded purchases


-- ================================================================
-- STEP 4: Add Manual Verification (RECOMMENDED)
-- ================================================================
-- Allow admins to manually verify UPI payments
-- Run this fourth
-- ================================================================

ALTER TABLE public.project_purchases
ADD COLUMN IF NOT EXISTS manual_verification_needed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_by UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS verification_notes TEXT DEFAULT NULL;

COMMENT ON COLUMN public.project_purchases.manual_verification_needed IS 'Needs manual admin verification';
COMMENT ON COLUMN public.project_purchases.verified_by IS 'Admin ID who verified this payment';
COMMENT ON COLUMN public.project_purchases.verification_notes IS 'Notes from verification';

-- After this step, admins can manually verify and approve payments


-- ================================================================
-- STEP 5: Create Payment Settings Table (OPTIONAL)
-- ================================================================
-- Backup storage for admin payment settings
-- Run this fifth (or skip if not needed)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upi_id TEXT NOT NULL,
  qr_code_image_url TEXT DEFAULT NULL,
  upi_enabled BOOLEAN DEFAULT true,
  razorpay_enabled BOOLEAN DEFAULT true,
  payment_name TEXT DEFAULT 'Nandish-Tech',
  min_amount DECIMAL(10, 2) DEFAULT 0,
  max_amount DECIMAL(10, 2) DEFAULT 1000000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.payment_settings IS 'Admin payment configuration (backup, primary is localStorage)';

-- Enable security
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies are optional - comment out if you don't need them
-- Only admins can view
-- CREATE POLICY "Admins view payment settings"
-- ON public.payment_settings
-- FOR SELECT
-- TO authenticated
-- USING (
--   EXISTS (
--     SELECT 1 FROM public.profiles 
--     WHERE profiles.id = auth.uid() AND profiles.is_admin = true
--   )
-- );

-- Insert default payment settings
INSERT INTO public.payment_settings 
(upi_id, upi_enabled, razorpay_enabled, payment_name)
VALUES 
('nandishgs1@ibl', true, true, 'Nandish-Tech')
ON CONFLICT DO NOTHING;

-- After this step, payment settings have a database backup


-- ================================================================
-- STEP 6: Create Audit Trail (OPTIONAL)
-- ================================================================
-- Track all payment status changes
-- Run this sixth (or skip if not needed)
-- ================================================================

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

COMMENT ON TABLE public.payment_status_history IS 'Audit trail of payment status changes';

CREATE INDEX IF NOT EXISTS idx_payment_status_history_purchase_id 
ON public.payment_status_history(purchase_id);

-- Enable security
ALTER TABLE public.payment_status_history ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies are optional - uncomment if needed
-- Admins view all
-- CREATE POLICY "Admins view payment history"
-- ON public.payment_status_history
-- FOR SELECT
-- TO authenticated
-- USING (
--   EXISTS (
--     SELECT 1 FROM public.profiles 
--     WHERE profiles.id = auth.uid() AND profiles.is_admin = true
--   )
-- );

-- After this step, you have an audit trail of all changes


-- ================================================================
-- STEP 7: Create Performance Indexes (OPTIONAL)
-- ================================================================
-- Speed up payment queries
-- Run this seventh (or skip if not needed)
-- ================================================================

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

CREATE INDEX IF NOT EXISTS idx_project_purchases_refunded 
ON public.project_purchases(refunded);

-- After this step, payment queries will be faster


-- ================================================================
-- VERIFICATION QUERIES
-- Run these to verify the setup is complete
-- ================================================================

-- Check payment_purchases table structure
-- Should show all the new columns
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'project_purchases'
ORDER BY ordinal_position;

-- Check payment_settings table exists
SELECT * FROM public.payment_settings LIMIT 1;

-- Check indexes were created
SELECT indexname FROM pg_indexes WHERE tablename = 'project_purchases';

-- ================================================================
-- YOU'RE DONE! 🎉
-- ================================================================
-- Summary of what was added:
-- 
-- ✅ payment_method column - Track UPI vs Razorpay
-- ✅ upi_transaction_id - Store UPI transaction reference
-- ✅ upi_reference_id - Internal UPI tracking
-- ✅ refunded, refund_amount, refund_reason, refunded_at - Refund tracking
-- ✅ manual_verification_needed, verified_by, verification_notes - Admin verification
-- ✅ payment_settings table - Settings storage (optional)
-- ✅ payment_status_history table - Audit trail (optional)
-- ✅ Performance indexes - Faster queries (optional)
--
-- Your payment system is now complete and ready for:
-- 1. Admin controls to enable/disable UPI or Razorpay
-- 2. Tracking which payment method was used
-- 3. Manual verification of UPI payments
-- 4. Refund management
-- 5. Payment analytics and reporting
-- ================================================================
