
-- Add image_url to announcements
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create storage bucket for announcements if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('announcements', 'announcements', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload to announcements
CREATE POLICY "Authenticated users can upload announcement images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'announcements' );

-- Policy to allow anyone to view announcement images
CREATE POLICY "Anyone can view announcement images"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'announcements' );
