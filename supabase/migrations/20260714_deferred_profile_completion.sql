-- Onboarding Flow Refactor: support deferred profile completion.
-- New users are now routed straight to the dashboard with an incomplete
-- profile row, instead of being forced through /create-profile first.
--
-- Note: student_profiles.full_name is `NOT NULL DEFAULT 'Student'` in
-- production, so it already "handles defaults appropriately at the
-- database level" — no ALTER is needed there. The actual bug was on the
-- application side (the auth callback was inserting an explicit NULL,
-- which overrides a column default in Postgres); that's fixed in
-- app/api/auth/callback/route.ts by omitting the key instead.

-- 1. Backfill any historical rows where profile_status was left NULL
--    (profile_status already has DEFAULT 'incomplete' for new rows).
UPDATE public.student_profiles
  SET profile_status = 'incomplete'
  WHERE profile_status IS NULL;

-- 2. Harden the update policy with an explicit WITH CHECK clause so a
--    student can never write a row with a user_id other than their own
--    (relevant now that the edit-profile endpoint uses upsert()).
DROP POLICY IF EXISTS "Students can update their own profile." ON public.student_profiles;
CREATE POLICY "Students can update their own profile."
  ON public.student_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Rollback:
--   DROP POLICY IF EXISTS "Students can update their own profile." ON public.student_profiles;
--   CREATE POLICY "Students can update their own profile." ON public.student_profiles
--     FOR UPDATE USING (auth.uid() = user_id);
--   -- profile_status backfill is not reversible/needed to reverse (no data loss risk).
--
-- No downtime required: a policy swap and a single-table UPDATE on a small table.
