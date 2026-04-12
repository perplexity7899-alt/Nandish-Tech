# Payment System - Database Quick Reference

## 🎯 What Needs to be Updated in Database?

### 1. **Payment Method Tracking Column** ⭐ (ESSENTIAL)
```sql
ALTER TABLE project_purchases
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT NULL;
-- Values: 'upi' or 'razorpay'
```
**Why?** Track which payment method was used for each purchase - needed for reporting and auditing.

---

### 2. **UPI Transaction Tracking** ⭐ (ESSENTIAL)
```sql
ALTER TABLE project_purchases
ADD COLUMN IF NOT EXISTS upi_transaction_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS upi_reference_id TEXT DEFAULT NULL;
```
**Why?** Store UPI transaction reference for manual verification of UPI payments.

---

### 3. **Refund Support** (RECOMMENDED)
```sql
ALTER TABLE project_purchases
ADD COLUMN IF NOT EXISTS refunded BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10, 2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS refund_reason TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
```
**Why?** Track refunded payments and amounts for accounting.

---

### 4. **Manual Verification Fields** (RECOMMENDED)
```sql
ALTER TABLE project_purchases
ADD COLUMN IF NOT EXISTS manual_verification_needed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_by UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS verification_notes TEXT DEFAULT NULL;
```
**Why?** Allow admins to manually verify UPI payments and add notes.

---

### 5. **Payment Settings Table** (OPTIONAL)
```sql
CREATE TABLE IF NOT EXISTS payment_settings (
  id UUID PRIMARY KEY,
  upi_id TEXT NOT NULL,
  qr_code_image_url TEXT,
  upi_enabled BOOLEAN DEFAULT true,
  razorpay_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```
**Why?** Optional database backup for admin payment settings (currently stored in localStorage).

---

### 6. **Payment Status History** (OPTIONAL)
```sql
CREATE TABLE IF NOT EXISTS payment_status_history (
  id UUID PRIMARY KEY,
  purchase_id UUID NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by UUID,
  reason TEXT,
  created_at TIMESTAMP
);
```
**Why?** Audit trail showing all payment status changes over time.

---

### 7. **Indexes for Performance** (OPTIONAL)
```sql
CREATE INDEX idx_project_purchases_payment_method ON project_purchases(payment_method);
CREATE INDEX idx_project_purchases_user_id_project_id ON project_purchases(user_id, project_id);
CREATE INDEX idx_project_purchases_payment_status ON project_purchases(payment_status);
```
**Why?** Speed up payment queries, especially for admin reports.

---

## 📋 Implementation Checklist

### Quick Setup (Essential Only - 2 minutes)
```sql
-- Run this in Supabase SQL Editor

-- 1. Add payment method column
ALTER TABLE public.project_purchases
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT NULL;

-- 2. Add UPI columns
ALTER TABLE public.project_purchases
ADD COLUMN IF NOT EXISTS upi_transaction_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS upi_reference_id TEXT DEFAULT NULL;

-- Done! Payment system now tracks UPI vs Razorpay
```

### Complete Setup (All Features - 5 minutes)
1. Go to Supabase SQL Editor
2. Copy all SQL from `supabase/migrations/20260412_payment_system_complete.sql`
3. Paste and run
4. Done!

---

## 🔍 Current Table Structure

### Before Updates:
```
project_purchases:
├── id (UUID)
├── user_id (UUID)
├── project_id (UUID)
├── payment_id (TEXT) - Razorpay ID only
├── payment_status (VARCHAR) - pending, completed, failed, etc.
├── code_access (BOOLEAN)
├── live_access (BOOLEAN)
├── client_name (TEXT)
├── client_email (TEXT)
├── project_title (TEXT)
├── rejection_reason (TEXT)
├── verified_at (TIMESTAMP)
├── approved_at (TIMESTAMP)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### After Updates:
```
project_purchases:
├── id (UUID)
├── user_id (UUID)
├── project_id (UUID)
├── payment_id (TEXT) - Razorpay ID
├── payment_status (VARCHAR)
├── payment_method (VARCHAR) ⭐ NEW - 'upi' or 'razorpay'
├── upi_transaction_id (TEXT) ⭐ NEW
├── upi_reference_id (TEXT) ⭐ NEW
├── code_access (BOOLEAN)
├── live_access (BOOLEAN)
├── client_name (TEXT)
├── client_email (TEXT)
├── project_title (TEXT)
├── rejection_reason (TEXT)
├── refunded (BOOLEAN) ⭐ NEW
├── refund_amount (DECIMAL)
├── refund_reason (TEXT)
├── refunded_at (TIMESTAMP)
├── manual_verification_needed (BOOLEAN) ⭐ NEW
├── verified_by (UUID) ⭐ NEW
├── verification_notes (TEXT) ⭐ NEW
├── verified_at (TIMESTAMP)
├── approved_at (TIMESTAMP)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

---

## 💾 How Payment Method is Used in Application

### When Razorpay Payment Completes:
```typescript
// In razorpay.ts - initiatePayment()
.update({
  payment_id: razorpay_payment_id,
  payment_status: "completed",
  payment_method: "razorpay", // ✅ Tracked here
  code_access: true,
  live_access: true,
})
```

### When UPI Payment Completes:
```typescript
// In PaymentOptionsDialog.tsx - recordUPIPayment()
.insert({
  user_id: userId,
  project_id: projectId,
  payment_status: "pending",
  payment_method: "upi", // ✅ Tracked here
  code_access: false,
  live_access: false,
  manual_verification_needed: true, // Admin must verify
})
```

---

## 🎛️ Admin Payment Management

### Admin Can:
1. **Enable/Disable Payment Methods** (via PaymentSettingsManager)
   - Toggle UPI availability
   - Toggle Razorpay availability
   - Settings stored in localStorage

2. **View Payment Analytics**
   - See which payment method was used
   - Filter by payment_method column
   - Track UPI vs Razorpay usage

3. **Verify Manual Payments**
   - Check `manual_verification_needed` flag
   - Verify UPI transaction ID
   - Add verification notes
   - Update verified_by and verification_notes

4. **Process Refunds**
   - Mark as refunded
   - Set refund amount and reason
   - Track refund timestamp

---

## 📊 Sample Queries for Admin

### View All Razorpay Purchases:
```sql
SELECT * FROM project_purchases 
WHERE payment_method = 'razorpay';
```

### View All UPI Purchases Pending Verification:
```sql
SELECT * FROM project_purchases 
WHERE payment_method = 'upi' 
AND manual_verification_needed = true;
```

### View Payment Method Statistics:
```sql
SELECT 
  payment_method,
  COUNT(*) as total_purchases,
  SUM(CAST(code_access AS INTEGER)) as completed_access
FROM project_purchases
WHERE payment_status = 'completed'
GROUP BY payment_method;
```

### View Refunded Payments:
```sql
SELECT * FROM project_purchases 
WHERE refunded = true;
```

### View All Verified Payments:
```sql
SELECT * FROM project_purchases 
WHERE verified_by IS NOT NULL;
```

---

## 🚀 Deployment Steps

1. **Option A: Using Supabase CLI (Recommended)**
   ```powershell
   cd e:\NANDISH PROJECTS\Nandish-tech-website-git-v1
   supabase db push
   # This will run migration: 20260412_payment_system_complete.sql
   ```

2. **Option B: Manual in Supabase Console**
   - Go to Supabase Dashboard → SQL Editor
   - Create new query
   - Copy contents of `supabase/migrations/20260412_payment_system_complete.sql`
   - Run all statements

3. **Option C: One Statement at a Time** (Safest)
   - Run each section separately
   - Verify each step completes
   - Recommended for production databases

---

## ⚠️ Important Notes

- ✅ All new columns have DEFAULT values - **won't break existing records**
- ✅ All changes are backward compatible
- ✅ No data loss or removal
- ✅ Can be run multiple times safely (uses `IF NOT EXISTS`)
- ✅ Row-level security prevents unauthorized access

---

## 🆘 Rollback (If Needed)

If something goes wrong, you can delete the migration from the migrations folder, but the columns will remain in database. To remove:

```sql
-- CAREFUL - only if needed
ALTER TABLE project_purchases DROP COLUMN IF EXISTS payment_method;
ALTER TABLE project_purchases DROP COLUMN IF EXISTS upi_transaction_id;
-- ... etc
```

---

## 📝 Summary

| Update | Priority | Type | Purpose |
|--------|----------|------|---------|
| payment_method | ⭐⭐⭐ | Column | Track UPI vs Razorpay |
| upi_transaction_id | ⭐⭐⭐ | Column | Store UPI reference |
| upi_reference_id | ⭐⭐ | Column | Internal UPI tracking |
| refunded* | ⭐⭐ | Column | Track refunds |
| refund_amount* | ⭐⭐ | Column | Refund amounts |
| manual_verification_needed | ⭐⭐ | Column | UPI verification flag |
| verified_by* | ⭐⭐ | Column | Track who verified |
| payment_settings | ⭐ | Table | Settings backup (optional) |
| payment_status_history | ⭐ | Table | Audit trail (optional) |
| Indexes | ⭐ | Index | Performance (optional) |

**⭐⭐⭐ = Must Have | ⭐⭐ = Recommended | ⭐ = Nice to Have | * = Refund features**
