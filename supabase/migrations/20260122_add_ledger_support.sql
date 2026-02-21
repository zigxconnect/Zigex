-- Migration: Add Ledger Support to Internships and Applications
-- Description: Adds monthly_rate to internships and payment_ledger to applications for financial tracking.

-- 1. Add monthly_rate to internships
ALTER TABLE public.internships 
ADD COLUMN IF NOT EXISTS monthly_rate INTEGER DEFAULT 0;

COMMENT ON COLUMN public.internships.monthly_rate IS 'Monthly cost/fee for this internship (if applicable).';

-- 2. Add payment_ledger to Applications (Legacy table)
ALTER TABLE public."Applications" 
ADD COLUMN IF NOT EXISTS payment_ledger JSONB DEFAULT '[]';

COMMENT ON COLUMN public."Applications".payment_ledger IS 'Array of payment records: [{month: number, status: "paid"|"unpaid", amount: number, date: string}]';

-- 3. Add payment_ledger to internship_applications (New table)
ALTER TABLE public.internship_applications 
ADD COLUMN IF NOT EXISTS payment_ledger JSONB DEFAULT '[]';

COMMENT ON COLUMN public.internship_applications.payment_ledger IS 'Array of payment records for the structured internship form.';
