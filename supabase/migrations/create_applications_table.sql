-- Create applications table for storing smart apply submissions
CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id uuid NOT NULL,
  opportunity_type text NOT NULL CHECK (opportunity_type IN ('internship', 'program', 'event')),
  content text NOT NULL,
  generated_by_ai boolean DEFAULT true NOT NULL,
  submitted_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Add comments
COMMENT ON TABLE public.applications IS 'Stores user applications to opportunities (internships, programs, events).';
COMMENT ON COLUMN public.applications.user_id IS 'The student who submitted the application.';
COMMENT ON COLUMN public.applications.opportunity_id IS 'The opportunity (internship, program, or event) being applied to.';
COMMENT ON COLUMN public.applications.opportunity_type IS 'Type of opportunity: internship, program, or event.';
COMMENT ON COLUMN public.applications.content IS 'The application content/letter.';
COMMENT ON COLUMN public.applications.generated_by_ai IS 'Whether this application was generated using Smart Apply AI.';

-- Create indexes for better query performance
CREATE INDEX applications_user_id_idx ON public.applications(user_id);
CREATE INDEX applications_opportunity_id_idx ON public.applications(opportunity_id);
CREATE INDEX applications_created_at_idx ON public.applications(created_at DESC);

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own applications."
  ON public.applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications."
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications."
  ON public.applications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own applications."
  ON public.applications FOR DELETE
  USING (auth.uid() = user_id);
