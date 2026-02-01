-- Migration: Add company verification fields
-- Date: 2026-01-30
-- Description: Adds is_verified and is_super_admin columns to company_profiles table

-- Add verification fields to company_profiles
ALTER TABLE public.company_profiles 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_company_profiles_is_verified ON public.company_profiles(is_verified);

-- Set the super admin company as verified and super_admin
-- This uses a DO block to handle the case where the user might not exist
DO $$
DECLARE
  super_admin_user_id UUID;
BEGIN
  -- Find the user ID for the super admin email
  SELECT id INTO super_admin_user_id FROM auth.users WHERE email = 'iwstechnical7@gmail.com';
  
  -- If found, update the company profile
  IF super_admin_user_id IS NOT NULL THEN
    UPDATE public.company_profiles
    SET is_verified = true, is_super_admin = true
    WHERE user_id = super_admin_user_id;
    
    RAISE NOTICE 'Super admin company verified and granted super_admin status';
  ELSE
    RAISE NOTICE 'Super admin user not found - please run this again after the user registers';
  END IF;
END $$;
