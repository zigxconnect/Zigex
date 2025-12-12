-- Enable RLS on Applications table if not already enabled
ALTER TABLE public."Applications" ENABLE ROW LEVEL SECURITY;

-- Policy to allow companies to update applications for their own company
CREATE POLICY "Companies can update their own applications"
ON public."Applications"
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.company_profiles
    WHERE public.company_profiles.id = public."Applications".company_id
    AND public.company_profiles.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.company_profiles
    WHERE public.company_profiles.id = public."Applications".company_id
    AND public.company_profiles.user_id = auth.uid()
  )
);

-- Policy to allow companies to view their own applications (if not already present)
CREATE POLICY "Companies can view their own applications"
ON public."Applications"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.company_profiles
    WHERE public.company_profiles.id = public."Applications".company_id
    AND public.company_profiles.user_id = auth.uid()
  )
);
