-- ========= TABLES =========

-- 1. Create Company Profiles Table
-- Stores information specific to companies.
CREATE TABLE public.company_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name text NOT NULL,
  description text,
  industry text,
  logo_url text,
  created_at timestamptz DEFAULT now() NOT NULL
);
-- Add comments for clarity in the Supabase UI
COMMENT ON TABLE public.company_profiles IS 'Stores company-specific profile data.';
COMMENT ON COLUMN public.company_profiles.user_id IS 'Links to the authenticated user.';

-- 2. Create Student Profiles Table
-- Stores information specific to students.
CREATE TABLE public.student_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  university text,
  field_of_study text,
  graduation_year integer,
  skills text[],
  created_at timestamptz DEFAULT now() NOT NULL
);
-- Add comments
COMMENT ON TABLE public.student_profiles IS 'Stores student-specific profile data.';
COMMENT ON COLUMN public.student_profiles.skills IS 'An array of skills, e.g., {"React", "Node.js"}.';

-- 3. Create Internships Table
-- Stores all internship postings.
CREATE TABLE public.internships (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id uuid REFERENCES public.company_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  required_skills text[],
  location text,
  is_paid boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);
-- Add comments
COMMENT ON TABLE public.internships IS 'Stores all internship job postings.';
COMMENT ON COLUMN public.internships.company_id IS 'The company that posted this internship.';

-- 4. Create Support Tickets Table (For Chatbot Escalation)
CREATE TABLE public.support_tickets (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Use SET NULL so we keep the ticket even if user is deleted
    user_email text,
    message text NOT NULL,
    status text DEFAULT 'open' NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.support_tickets IS 'Stores user support requests from the chatbot.';

-- ========= SECURITY (ROW LEVEL SECURITY - RLS) =========
-- This is the most important part! It secures your data.

-- Enable RLS for all tables
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- --- Policies for company_profiles ---
CREATE POLICY "Companies can view their own profile."
  ON public.company_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Companies can insert their own profile."
  ON public.company_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Companies can update their own profile."
  ON public.company_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- --- Policies for student_profiles ---
CREATE POLICY "Students can view their own profile."
  ON public.student_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Students can insert their own profile."
  ON public.student_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update their own profile."
  ON public.student_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- --- Policies for internships ---
CREATE POLICY "Anyone can view internships."
  ON public.internships FOR SELECT
  USING (true);

CREATE POLICY "Companies can create internships."
  ON public.internships FOR INSERT
  WITH CHECK (
    -- Check that the user is a company and is inserting for their own company_id
    (SELECT company_id FROM public.company_profiles WHERE user_id = auth.uid()) = company_id
  );

CREATE POLICY "Companies can update their own internships."
  ON public.internships FOR UPDATE
  USING (
    (SELECT company_id FROM public.company_profiles WHERE user_id = auth.uid()) = company_id
  );

CREATE POLICY "Companies can delete their own internships."
  ON public.internships FOR DELETE
  USING (
    (SELECT company_id FROM public.company_profiles WHERE user_id = auth.uid()) = company_id
  );

-- --- Policies for support_tickets ---
CREATE POLICY "Users can create support tickets."
  ON public.support_tickets FOR INSERT
  WITH CHECK (true); -- Anyone can create a ticket

CREATE POLICY "Admins can manage tickets." -- Placeholder for admin roles
  ON public.support_tickets FOR ALL
  USING (false); -- In a real app, you'd check for an admin role here

-- ========= FUNCTIONS =========
-- This function is a helper to get the user's role.
-- It's not strictly required for RLS but can be useful.
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
  is_student boolean;
  is_company boolean;
BEGIN
  SELECT EXISTS(SELECT 1 FROM student_profiles WHERE user_id = auth.uid()) INTO is_student;
  SELECT EXISTS(SELECT 1 FROM company_profiles WHERE user_id = auth.uid()) INTO is_company;

  IF is_student THEN
    RETURN 'student';
  ELSIF is_company THEN
    RETURN 'company';
  ELSE
    RETURN 'unknown';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========= STORAGE =========
-- Create a bucket for company logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('company_logos', 'company_logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for the bucket
CREATE POLICY "Companies can upload logos."
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'company_logos' AND
    -- Check if the user is a company
    (SELECT EXISTS(SELECT 1 FROM company_profiles WHERE user_id = auth.uid()))
  );

CREATE POLICY "Anyone can view company logos."
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'company_logos');
  
-- ========= MIGRATION SCRIPT FOR EXISTING DATA =========
-- This section is for updating existing tables if you've already deployed.
-- For example, if you wanted to add a new column:
-- ALTER TABLE public.student_profiles ADD COLUMN resume_url TEXT;
-- Make sure to update RLS policies if the new column contains sensitive data.

-- ========= Notifications mapping table (per-user reads) =========
-- This table stores which user has read which notification so marking as read
-- applies only to that user.
CREATE TABLE IF NOT EXISTS public.notification_reads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(notification_id, user_id)
);

COMMENT ON TABLE public.notification_reads IS 'Mapping table indicating which users have read which notifications.';

-- Optional RLS policy: only the owning user can see their read rows
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notification read rows"
  ON public.notification_reads FOR SELECT
  USING (auth.uid() = user_id);