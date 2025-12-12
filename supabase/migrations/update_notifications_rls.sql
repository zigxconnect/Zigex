-- Enable RLS on notifications table if not already enabled
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy to allow companies (or anyone authenticated) to insert notifications
-- This is necessary because the company user is inserting a notification for a student user
CREATE POLICY "Anyone can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Policy for users to view their own notifications (likely already exists, but good to ensure)
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);
