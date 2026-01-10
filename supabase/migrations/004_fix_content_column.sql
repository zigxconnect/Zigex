-- Fix for "Could not find the 'content' column" error
-- Run this in your Supabase SQL Editor if the error persists

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'program_content'
        AND column_name = 'content'
    ) THEN
        ALTER TABLE public.program_content ADD COLUMN content TEXT;
    END IF;
END $$;

-- Force schema cache reload by notifying (optional, Supabase handles this usually on DDL)
NOTIFY pgrst, 'reload schema';
