-- ========= PROGRAM LMS SCHEMA MIGRATION (Optimized) =========
-- Minimal database footprint - curriculum stored locally in code

-- 1. Add is_paid column to Applications table
ALTER TABLE "Applications" 
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false;

COMMENT ON COLUMN "Applications".is_paid IS 'Whether the candidate has completed payment for this month (for paid programs)';

-- 2. Create Program Content Table (combines lessons + resources)
-- Only stores dynamic content that admins create weekly
CREATE TABLE IF NOT EXISTS public.program_content (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id uuid REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER, -- e.g., Week 1, Week 2
  title TEXT NOT NULL, -- e.g., "Weekend of Code - Week 3"
  description TEXT, -- What will be done this week
  content TEXT, -- Main lesson content (Markdown)
  resources JSONB DEFAULT '[]', -- Array of {type, title, url}
  
  -- Session Details
  session_type TEXT CHECK (session_type IN ('online', 'onsite', 'mixed')),
  session_link TEXT, -- For online sessions
  session_location TEXT, -- For onsite sessions
  session_time TIMESTAMPTZ, -- Optional specific time for the session
  
  is_published BOOLEAN DEFAULT false,
  notify_paid_users BOOLEAN DEFAULT false, -- Flag to trigger email notifications
  notified_at TIMESTAMPTZ, -- When notifications were sent
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.program_content IS 'Stores weekly program updates, resources, and assignments. Curriculum stored locally.';
COMMENT ON COLUMN public.program_content.resources IS 'JSON array: [{type: "github"|"pdf"|"video"|"assignment", title: string, url: string, due_date?: string}]';

-- 3. Enable RLS
ALTER TABLE public.program_content ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for program_content

-- Public: Can see non-confidential published content
CREATE POLICY "Anyone can view published content titles"
  ON public.program_content FOR SELECT
  USING (is_published = true);

-- Companies can manage their program content
CREATE POLICY "Companies can manage their program content"
  ON public.program_content FOR ALL
  USING (
    program_id IN (
      SELECT id FROM public.programs 
      WHERE company_id IN (
        SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_program_content_program_id ON public.program_content(program_id);
CREATE INDEX IF NOT EXISTS idx_applications_is_paid ON "Applications"(is_paid);
CREATE INDEX IF NOT EXISTS idx_applications_status_program ON "Applications"(status, program_id);

-- 6. Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_program_content_updated_at ON public.program_content;
CREATE TRIGGER update_program_content_updated_at
    BEFORE UPDATE ON public.program_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
