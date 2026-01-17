-- Migration for Pitching System

-- 1. Extend projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_pitch BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS target_company_id UUID REFERENCES company_profiles(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS pitch_deck_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS pitch_status TEXT DEFAULT 'draft'; -- 'submitted', 'reviewing', 'validated', 'rejected'
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tech_stack TEXT[]; -- e.g. {'React', 'Next.js', 'Supabase'}
ALTER TABLE projects ADD COLUMN IF NOT EXISTS collaboration_open BOOLEAN DEFAULT true;

-- 2. Create pitch_feedback table for audit trail of validation
CREATE TABLE IF NOT EXISTS pitch_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  company_id UUID REFERENCES company_profiles(id),
  status TEXT NOT NULL,
  feedback_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS Policies (Examples - Adjust as needed)
-- Students can update their own projects' pitch fields
CREATE POLICY "Users can update own project pitch info" ON projects
FOR UPDATE USING (auth.uid() = user_id);

-- Companies can update projects if they are the target_company (specifically status)
-- Note: This requires complex policy or a Remote Procedure Call (RPC).
-- Creating a function is safer for company updates.

CREATE OR REPLACE FUNCTION update_pitch_status(p_project_id UUID, p_status TEXT, p_feedback TEXT)
RETURNS VOID AS $$
DECLARE
  v_company_id UUID;
BEGIN
  -- Get company id of auth user
  SELECT id INTO v_company_id FROM company_profiles WHERE user_id = auth.uid();
  
  -- Verify project is targeting this company
  IF EXISTS (SELECT 1 FROM projects WHERE id = p_project_id AND target_company_id = v_company_id) THEN
    -- Update project status
    UPDATE projects SET pitch_status = p_status WHERE id = p_project_id;
    
    -- Log feedback
    INSERT INTO pitch_feedback (project_id, company_id, status, feedback_text)
    VALUES (p_project_id, v_company_id, p_status, p_feedback);
  ELSE
    RAISE EXCEPTION 'Not authorized to update this pitch';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
