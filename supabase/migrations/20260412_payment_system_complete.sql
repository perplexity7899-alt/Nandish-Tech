-- Payment System Complete Setup
-- Created: 2026-04-12
-- Description: Add all required columns and tables for complete payment system with UPI and Razorpay support

-- ===================================
-- 1. Add payment_method column
-- ===================================
ALTER TABLE IF EXISTS public.project_purchases
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT NULL;

COMMENT ON COLUMN public.project_purchases.payment_method IS 'Payment method used: "upi" or "razorpay"';

-- Add constraint to ensure valid values
ALTER TABLE public.project_purchases
ADD CONSTRAINT check_payment_method 
CHECK (payment_method IS NULL OR payment_method IN ('upi', 'razorpay'));

-- ===================================
-- 2. Add UPI transaction columns
-- ===================================
ALTER TABLE IF EXISTS public.project_purchases
ADD COLUMN IF NOT EXISTS upi_transaction_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS upi_reference_id TEXT DEFAULT NULL;

COMMENT ON COLUMN public.project_purchases.upi_transaction_id IS 'UPI transaction reference number for manual verification';
COMMENT ON COLUMN public.project_purchases.upi_reference_id IS 'Internal reference ID for UPI payment tracking';

-- ===================================
-- 3. Add refund/reversal support columns
-- ===================================
ALTER TABLE IF EXISTS public.project_purchases
ADD COLUMN IF NOT EXISTS refunded BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10, 2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS refund_reason TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

COMMENT ON COLUMN public.project_purchases.refunded IS 'Whether the payment was refunded';
COMMENT ON COLUMN public.project_purchases.refund_amount IS 'Amount refunded (may be less than original amount)';
COMMENT ON COLUMN public.project_purchases.refund_reason IS 'Reason for refund';
COMMENT ON COLUMN public.project_purchases.refunded_at IS 'Timestamp when payment was refunded';

-- ===================================
-- 4. Add manual verification fields
-- ===================================
ALTER TABLE IF EXISTS public.project_purchases
ADD COLUMN IF NOT EXISTS manual_verification_needed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_by UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS verification_notes TEXT DEFAULT NULL;

COMMENT ON COLUMN public.project_purchases.manual_verification_needed IS 'Whether manual verification is needed (typically for UPI payments)';
COMMENT ON COLUMN public.project_purchases.verified_by IS 'Admin user ID who verified the payment';
COMMENT ON COLUMN public.project_purchases.verification_notes IS 'Notes added during payment verification by admin';

-- ===================================
-- 5. Create payment_settings table (optional - for admin configuration backup)
-- ===================================
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upi_id TEXT NOT NULL,
  qr_code_image_url TEXT DEFAULT NULL,
  upi_enabled BOOLEAN DEFAULT true,
  razorpay_enabled BOOLEAN DEFAULT true,
  razorpay_key_id TEXT DEFAULT NULL,
  payment_name TEXT DEFAULT 'Nandish-Tech',
  min_amount DECIMAL(10, 2) DEFAULT 0,
  max_amount DECIMAL(10, 2) DEFAULT 1000000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.payment_settings IS 'Admin-configured payment settings (primary storage on localStorage, optional database backup)';

-- Enable RLS for payment_settings table
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Note: To add RLS policies manually, use the Supabase dashboard or create them separately
-- CREATE POLICY "Only admins can select payment settings"
-- ON public.payment_settings
-- FOR SELECT
-- TO authenticated
-- USING (
--   EXISTS (
--     SELECT 1 FROM public.profiles 
--     WHERE profiles.id = auth.uid() AND profiles.is_admin = true
--   )
-- );

-- ===================================
-- 6. Create payment_status_history table (audit trail)
-- ===================================
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

COMMENT ON TABLE public.payment_status_history IS 'Audit trail for all payment status changes';

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_payment_status_history_purchase_id 
ON public.payment_status_history(purchase_id);

-- Enable RLS for payment_status_history
ALTER TABLE public.payment_status_history ENABLE ROW LEVEL SECURITY;

-- Note: To add RLS policies manually, use the Supabase dashboard or create them separately
-- CREATE POLICY "Admins can view all payment history"
-- ON public.payment_status_history
-- FOR SELECT
-- TO authenticated
-- USING (...);

-- ===================================
-- 7. Create indexes for performance
-- ===================================
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

-- ===================================
-- 8. Initial Payment Settings (insert one default record)
-- ===================================
INSERT INTO public.payment_settings 
(upi_id, upi_enabled, razorpay_enabled, payment_name)
VALUES 
('nandishgs1@ibl', true, true, 'Nandish-Tech')
ON CONFLICT DO NOTHING;
