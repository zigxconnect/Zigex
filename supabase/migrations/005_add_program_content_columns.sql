-- Add missing columns to program_content table to support flexible content storage
-- This allows storing different types of resources and assignment details

DO $$
BEGIN
    -- Add video_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'program_content'
        AND column_name = 'video_url'
    ) THEN
        ALTER TABLE public.program_content ADD COLUMN video_url TEXT;
        COMMENT ON COLUMN public.program_content.video_url IS 'Direct video URL (YouTube, Vimeo, etc.)';
    END IF;

    -- Add github_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'program_content'
        AND column_name = 'github_url'
    ) THEN
        ALTER TABLE public.program_content ADD COLUMN github_url TEXT;
        COMMENT ON COLUMN public.program_content.github_url IS 'GitHub repository link';
    END IF;

    -- Add google_docs_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'program_content'
        AND column_name = 'google_docs_url'
    ) THEN
        ALTER TABLE public.program_content ADD COLUMN google_docs_url TEXT;
        COMMENT ON COLUMN public.program_content.google_docs_url IS 'Google Docs/Sheets link';
    END IF;

    -- Add assignment_details column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'program_content'
        AND column_name = 'assignment_details'
    ) THEN
        ALTER TABLE public.program_content ADD COLUMN assignment_details TEXT;
        COMMENT ON COLUMN public.program_content.assignment_details IS 'Detailed assignment instructions in Markdown';
    END IF;

    -- Add content_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'program_content'
        AND column_name = 'content_url'
    ) THEN
        ALTER TABLE public.program_content ADD COLUMN content_url TEXT;
        COMMENT ON COLUMN public.program_content.content_url IS 'External content link (generic resource)';
    END IF;

    -- Add resource_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'program_content'
        AND column_name = 'resource_type'
    ) THEN
        ALTER TABLE public.program_content ADD COLUMN resource_type TEXT;
        COMMENT ON COLUMN public.program_content.resource_type IS 'Type of resource (lesson, assignment, quiz, etc.)';
    END IF;

    -- Add content_type column if it doesn't exist (for categorizing the content)
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'program_content'
        AND column_name = 'content_type'
    ) THEN
        ALTER TABLE public.program_content ADD COLUMN content_type TEXT DEFAULT 'lesson';
        COMMENT ON COLUMN public.program_content.content_type IS 'Type of content (lesson, assignment, resource, etc.)';
    END IF;

    -- Add date_due column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'program_content'
        AND column_name = 'date_due'
    ) THEN
        ALTER TABLE public.program_content ADD COLUMN date_due TIMESTAMPTZ;
        COMMENT ON COLUMN public.program_content.date_due IS 'Due date for assignments';
    END IF;

    -- Add display_order column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'program_content'
        AND column_name = 'display_order'
    ) THEN
        ALTER TABLE public.program_content ADD COLUMN display_order INTEGER DEFAULT 0;
        COMMENT ON COLUMN public.program_content.display_order IS 'Order to display content items';
    END IF;

    -- Add payment_required column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'program_content'
        AND column_name = 'payment_required'
    ) THEN
        ALTER TABLE public.program_content ADD COLUMN payment_required BOOLEAN DEFAULT false;
        COMMENT ON COLUMN public.program_content.payment_required IS 'Whether this content requires payment to access';
    END IF;
END $$;

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';
