-- Create internship_applications table
CREATE TABLE IF NOT EXISTS public.internship_applications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  internship_id uuid NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Information
  full_name text NOT NULL,
  school text NOT NULL,
  school_level text NOT NULL,
  date_of_birth date NOT NULL,
  address text NOT NULL,
  
  -- Field of Choice
  domain text NOT NULL,
  duration text NOT NULL,
  experience_level text NOT NULL,
  reason text NOT NULL,
  expectations text NOT NULL,
  
  -- Acknowledgement
  is_paid_acknowledgement boolean DEFAULT false NOT NULL,
  comment text,
  
  -- Metadata
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add indexes
CREATE INDEX idx_internship_applications_internship_id ON public.internship_applications(internship_id);
CREATE INDEX idx_internship_applications_student_id ON public.internship_applications(student_id);

-- Enable RLS
ALTER TABLE public.internship_applications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own internship applications"
  ON public.internship_applications FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Users can create their own internship applications"
  ON public.internship_applications FOR INSERT
  WITH CHECK (auth.uid() = student_id);
  
CREATE POLICY "Companies can view applications for their internships"
  ON public.internship_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.internships i
      WHERE i.id = internship_applications.internship_id
      AND i.company_id = (SELECT id FROM public.company_profiles WHERE user_id = auth.uid())
    )
  );

-- Update internships table
ALTER TABLE public.internships 
ADD COLUMN IF NOT EXISTS cover_image_url text,
ADD COLUMN IF NOT EXISTS is_paid boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS compensation_amount text, -- e.g. "50,000 FCFA/Month"
ADD COLUMN IF NOT EXISTS start_date timestamptz,
ADD COLUMN IF NOT EXISTS end_date timestamptz,
ADD COLUMN IF NOT EXISTS deadline timestamptz;
