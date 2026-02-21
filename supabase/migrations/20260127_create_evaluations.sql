
-- Create intern_evaluations table
CREATE TABLE IF NOT EXISTS intern_evaluations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  internship_id UUID REFERENCES internships(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  supervisor_id UUID REFERENCES supervisor_profiles(id) ON DELETE SET NULL, -- Use profile ID if available or user ID
  evaluation_date DATE DEFAULT CURRENT_DATE,
  period_start DATE, -- For weekly/monthly evals
  period_end DATE,
  
  -- Ratings (1-5)
  technical_skill INTEGER CHECK (technical_skill >= 1 AND technical_skill <= 5),
  communication_skill INTEGER CHECK (communication_skill >= 1 AND communication_skill <= 5),
  problem_solving INTEGER CHECK (problem_solving >= 1 AND problem_solving <= 5),
  dependability INTEGER CHECK (dependability >= 1 AND dependability <= 5),
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  
  -- Qualitative
  strengths TEXT,
  areas_for_improvement TEXT,
  comments TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE intern_evaluations ENABLE ROW LEVEL SECURITY;

-- Policies

-- Supervisors can create evaluations
CREATE POLICY "Supervisors can insert evaluations"
  ON intern_evaluations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM supervisor_profiles
      WHERE id = intern_evaluations.supervisor_id
      AND user_id = auth.uid()
    )
  );

-- Supervisors can read their own evaluations
CREATE POLICY "Supervisors can read their own evaluations"
  ON intern_evaluations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM supervisor_profiles
      WHERE id = intern_evaluations.supervisor_id
      AND user_id = auth.uid()
    )
  );

-- Interns can read evaluations about themselves
CREATE POLICY "Interns can read their own evaluations"
  ON intern_evaluations
  FOR SELECT
  USING (
    student_id = auth.uid()
  );

-- Admins can read all evaluations
CREATE POLICY "Admins can read all evaluations"
  ON intern_evaluations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );
