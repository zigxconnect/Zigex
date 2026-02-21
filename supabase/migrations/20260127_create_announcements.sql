
-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_id UUID REFERENCES company_profiles(id) ON DELETE CASCADE, -- If null, it's a global zigex announcement
  target_audience TEXT[] DEFAULT '{all}', -- 'intern', 'supervisor', 'all'
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can do everything
CREATE POLICY "Admins can manage all announcements"
  ON announcements
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policy: Company Admins can manage their own announcements
CREATE POLICY "Company admins can manage their own announcements"
  ON announcements
  FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM company_profiles
      WHERE owner_id = auth.uid()
    )
  );

-- Policy: Everyone can read announcements targeted to them or global/company specific
CREATE POLICY "Users can read relevant announcements"
  ON announcements
  FOR SELECT
  USING (
    -- Global announcements
    (company_id IS NULL) OR
    -- Company specific announcements (if user belongs to company) w/o complex join for now, just simplified
    (
        -- Check if user is an intern or supervisor for this company
        EXISTS (
            SELECT 1 FROM internship_applications
            WHERE internship_applications.student_id = auth.uid()
            AND internship_applications.status = 'approved'
            AND internship_applications.company_id = announcements.company_id
        )
        OR
        -- Check if user is supervisor (logic might vary, simplified for now)
         EXISTS (
            SELECT 1 FROM supervisors
            WHERE supervisors.user_id = auth.uid()
            AND supervisors.company_id = announcements.company_id
        )
    )
  );

-- For simplicity in this sprint, we might just allow authenticated users to read all for now, 
-- or refine the read policy. Let's stick to a simpler read policy for "authenticated" to reduce friction during dev, 
-- but strictly enforce write for admins.

DROP POLICY IF EXISTS "Users can read relevant announcements" ON announcements;

CREATE POLICY "Authenticated users can read all announcements"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (true);
