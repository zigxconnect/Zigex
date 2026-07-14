-- Migration: Add is_visible column to internships, programs, and event tables
-- This allows admins to toggle visibility of postings on the student-facing feed.
-- Default is TRUE so all existing records remain visible.

ALTER TABLE public.internships
  ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true NOT NULL;

ALTER TABLE public.programs
  ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true NOT NULL;

ALTER TABLE public.event
  ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true NOT NULL;

COMMENT ON COLUMN public.internships.is_visible IS 'Controls whether this internship appears in the student feed.';
COMMENT ON COLUMN public.programs.is_visible IS 'Controls whether this program appears in the student feed.';
COMMENT ON COLUMN public.event.is_visible IS 'Controls whether this event appears in the student feed.';
