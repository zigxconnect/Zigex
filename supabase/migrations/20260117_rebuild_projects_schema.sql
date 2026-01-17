-- MIGRATION: 20260117_rebuild_projects_schema.sql
-- DESCRIPTION: Completely rebuilds the projects table for the new Pitching System.
-- WARNING: THIS MIGRATION IS DESTRUCTIVE. IT WILL DROP THE EXISTING PROJECTS TABLE AND ALL DATA.

-- 1. Drop dependencies if necessary (e.g., cascade delete)
DROP TABLE IF EXISTS project_submissions CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- 2. Create the new PROJECTS table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Owner Relationship
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    -- We can also link to student_profiles if strict FK is needed, but auth.users is safer for generic ownership.
    -- Ideally: owner_id UUID REFERENCES student_profiles(user_id) ...
    
    -- SECTION 1: GENERAL INFORMATION (Slide 1 / Inspiration)
    title TEXT NOT NULL,
    tagline TEXT NOT NULL, -- Short elevator pitch (e.g. "Airbnb for X")
    problem_statement TEXT NOT NULL, -- "What pain point are you solving?"
    solution_description TEXT NOT NULL, -- "How does your product work?"
    category TEXT, -- e.g. "EdTech", "FinTech"
    
    -- SECTION 2: MEDIA (Visual Inspiration)
    -- "Users should submit a short video... including project cover images at least 3"
    video_url TEXT, -- The "Short Pitch Video"
    cover_images TEXT[] DEFAULT '{}', -- Array of image URLs. Validation for "at least 3" will be app-level.
    
    -- SECTION 3: INVESTOR INFO (Pitch Deck)
    pitch_deck_url TEXT, -- PDF Link
    business_model TEXT, -- "SaaS", "Marketplace", etc.
    funding_goal NUMERIC, -- Optional funding target
    current_stage TEXT DEFAULT 'idea', -- 'idea', 'prototype', 'mvp', 'growth'
    
    -- SECTION 4: DEVELOPER INFO (Contribution)
    github_url TEXT,
    tech_stack TEXT[] DEFAULT '{}', -- e.g. {'React', 'Supabase', 'Python'}
    collaboration_type TEXT DEFAULT 'open', -- 'open', 'paid', 'mentorship'
    roadmap_url TEXT, -- Link to Jira/Trello or text description
    
    -- METADATA
    is_published BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0
);

-- 3. Create PROJECT_SUBMISSIONS table
-- "Project received for them to see projects submitted to them"
CREATE TABLE project_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    company_id UUID REFERENCES company_profiles(id) ON DELETE CASCADE NOT NULL, -- Assuming company_profiles exists
    
    -- Status of the pitch to this specific company
    status TEXT DEFAULT 'pending', -- 'pending', 'viewed', 'interested', 'rejected', 'meeting_scheduled'
    
    company_feedback TEXT, -- Optional private feedback from company
    
    UNIQUE(project_id, company_id) -- Prevent duplicate submissions
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_submissions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- PROJECTS POLICIES
-- Everyone can view published projects (Inspiration)
CREATE POLICY "Public projects are viewable by everyone" ON projects
    FOR SELECT USING (is_published = true);

-- Owners can do everything with their own projects
CREATE POLICY "Users can insert own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE USING (auth.uid() = owner_id);

-- SUBMISSIONS POLICIES
-- Student Owners can insert submissions (Pitching)
CREATE POLICY "Owners can submit projects" ON project_submissions
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM projects WHERE id = project_id AND owner_id = auth.uid())
    );

-- Student Owners can see their own submissions status
CREATE POLICY "Owners can view own submissions" ON project_submissions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM projects WHERE id = project_id AND owner_id = auth.uid())
    );

-- Companies can see submissions sent TO THEM
-- Assuming company_profiles is linked to auth.users via 'user_id'
CREATE POLICY "Companies can view received submissions" ON project_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM company_profiles 
            WHERE id = company_id 
            AND user_id = auth.uid()
        )
    );

-- Companies can update status of received submissions
CREATE POLICY "Companies can update submission status" ON project_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM company_profiles 
            WHERE id = company_id 
            AND user_id = auth.uid()
        )
    );

-- Companies should also be able to VIEW the Project details if submitted to them (even if not published? Assuming published for now)

-- 6. Grant Permissions (Safe defaults)
GRANT ALL ON projects TO authenticated;
GRANT ALL ON project_submissions TO authenticated;
GRANT SELECT ON projects TO anon;
