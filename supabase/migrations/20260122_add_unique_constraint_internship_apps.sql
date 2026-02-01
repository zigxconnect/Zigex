-- Add unique constraint to prevent duplicate internship applications
ALTER TABLE public.internship_applications
ADD CONSTRAINT unique_student_internship UNIQUE (student_id, internship_id);
