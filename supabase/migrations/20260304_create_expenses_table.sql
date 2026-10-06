-- Migration: Create Expenses Table
-- Description: Tracking withdrawals and administrative expenses.

CREATE TABLE IF NOT EXISTS public.expenses (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id uuid REFERENCES public.company_profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'completed' NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_expenses_company_id ON public.expenses(company_id);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON public.expenses(created_at);

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Policies for expenses
CREATE POLICY "Companies can view their own expenses."
  ON public.expenses FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can insert their own expenses."
  ON public.expenses FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.expenses IS 'Stores administrative expenses and withdrawals.';
