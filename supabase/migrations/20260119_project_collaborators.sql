-- Create a table for confirmed project collaborators
CREATE TABLE IF NOT EXISTS public.project_collaborators (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'collaborator', -- 'collaborator', 'investor', etc.
    confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(project_id, user_id)
);

-- Add RLS
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view collaborators of any project" 
ON public.project_collaborators FOR SELECT 
USING (true);

CREATE POLICY "Owners can manage collaborators" 
ON public.project_collaborators FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id = project_id 
        AND owner_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage collaborators" 
ON public.project_collaborators FOR ALL 
USING (
    auth.jwt() ->> 'email' = 'zigex.app@gmail.com' -- Update with actual admin email if needed
);
