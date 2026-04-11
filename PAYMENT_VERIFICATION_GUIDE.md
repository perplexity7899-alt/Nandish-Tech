# Payment Verification System - Setup Guide

## Overview
The Nandish-Tech platform now includes a complete payment verification workflow where:
1. **Client pays** via Razorpay
2. **Admin verifies** the payment authenticity
3. **Admin approves** to grant client access
4. **Client receives access** to purchased projects

## Database Setup

### Required SQL Columns
Before the system will work, you need to add the following columns to the `project_purchases` table in Supabase:

Run this SQL in your Supabase SQL Editor:

```sql
-- Add client info columns and rejection reason
ALTER TABLE IF EXISTS public.project_purchases
ADD COLUMN IF NOT EXISTS client_name TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS client_email TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS project_title TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT DEFAULT NULL;

-- Add timestamp columns
ALTER TABLE IF EXISTS public.project_purchases
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
```

Or copy the entire setup from: `SUPABASE_SETUP.sql`

## Admin Dashboard Features

### Payment Verification Panel
Navigate to **Admin → Purchases** to manage payments:

1. **Pending Tab** - Shows payments waiting for admin verification
   - View payment details (amount, client, project, date)
   - **Verify Payment** - Confirms the payment is legitimate
   - **Reject** - Rejects payment with reason (client sees the reason)

2. **Verified Tab** - Shows verified payments
   - Review verified transactions
   - **Grant Access** - Approves payment and grants client access to project

3. **Approved Tab** - Shows approved payments
   - Client now has full access to the project
   - View approval date and all transaction details

4. **Rejected Tab** - Shows rejected payments
   - Displays rejection reason for auditing
   - Client can see why payment was rejected

### Clients Management
Navigate to **Admin → Clients** to see:

1. **Total Clients** - All registered users
2. **Clients with Purchases** - Users who have made purchases
3. Three tabs:
   - **All Clients** - View all registered clients
   - **Only Registered** - Clients without any purchases
   - **With Purchases** - Clients who have made payments

### Dashboard Overview
The admin dashboard now shows:
- **Approved Purchases** - Count of approved/granted access
- **Rejected Purchases** - Count of rejected payments

## Client-Side Features

### Available Projects Page
Clients see project cards with these states:

1. **Free Projects** - "Free Access" badge, instant access
2. **Premium (Not Purchased)**
   - Shows "Premium" badge
   - "Unlock for ₹X" button to purchase
   
3. **Payment in Progress**
   - Shows "Awaiting Admin Approval" (disabled button)
   - Client must wait for admin verification and approval
   
4. **Rejected Payment**
   - Shows rejection reason in red box
   - Can retry payment
   
5. **Approved**
   - Shows "You have access to this project" (green checkmark)
   - Can view live demo and source code

### My Deliveries
Only shows projects with "approved" status (client has access)

## Payment Workflow Example

```
1. Client clicks "Unlock for ₹4" on MediFlow project
2. Razorpay payment gateway opens
3. Client completes payment
4. Payment created in database with status: "completed"
5. Payment appears in Admin → Purchases → Pending tab
6. Admin reviews the Razorpay transaction
7. Admin clicks "Verify Payment" (status → "verified")
8. Payment moves to "Verified" tab
9. Admin clicks "Grant Access" (status → "approved")
10. Payment moves to "Approved" tab
11. Client now sees "You have access to this project"
12. Project appears in client's "My Deliveries" section
13. Client can view live demo and source code
```

## Rejection Workflow

```
1. Admin sees payment in Pending tab
2. Admin clicks "Reject" button
3. Dialog appears asking for rejection reason
4. Admin enters reason (e.g., "duplicate payment", "payment info mismatch")
5. Admin confirms rejection
6. Payment status → "rejected"
7. Client sees:
   - Red rejection reason box
   - Can retry payment
8. Admin can see all rejected transactions in Rejected tab
```

## Key Files

- `src/components/admin/AdminPurchasesManager.tsx` - Payment verification UI
- `src/components/admin/ClientsManager.tsx` - Clients management with purchase tracking
- `src/components/admin/DashboardOverview.tsx` - Admin dashboard with stats
- `src/components/client/ClientProjectsCatalog.tsx` - Project catalog with payment status
- `src/integrations/razorpay.ts` - Razorpay integration and access checking
- `supabase/migrations/` - Database schema migrations

## Status Values

- `pending` - Initial state before payment processing
- `completed` - Razorpay payment successful
- `verified` - Admin verified the payment authenticity
- `approved` - Admin granted access to the project (FINAL STATE FOR CLIENT ACCESS)
- `rejected` - Admin rejected the payment with reason

## Notes

- Clients are granted access ONLY when status is "approved"
- Payment verification is mandatory for security
- Rejection reasons are visible to clients for transparency
- All timestamps (verified_at, approved_at) are recorded for auditing
- Client info (name, email, project title) is stored with each purchase for admin reference
