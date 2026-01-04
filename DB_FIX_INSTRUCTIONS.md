# Database Schema Fix Instructions

If you are still seeing the error: `Could not find the 'content' column of 'program_content'`, please follow these steps:

1. **Restart your Development Server**:
   Stop the `npm run dev` process and start it again. This often clears Supabase client caches.

2. **Reload Schema Cache**:
   If you are using a local Supabase instance, run:
   ```bash
   npx supabase db reset
   ```
   *Warning: This resets your local database.*

   Alternatively, copy the SQL content from `supabase/migrations/004_fix_content_column.sql` and run it in your Supabase Dashboard's SQL Editor (or local SQL client).

   ```sql
   -- Content of 004_fix_content_column.sql
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
   NOTIFY pgrst, 'reload schema';
   ```

3. **Verify Admin Content Creation**:
   After applying the fix, try creating content again in the Admin Dashboard. The "Create Content" button should now work without errors.
