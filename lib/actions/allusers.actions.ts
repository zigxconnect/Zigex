"use server";

import { supabaseAdmin } from "@/lib/supabase/server";

export interface RawUserProfile {
  id: string;
  user_id: string;
  username?: string;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  university?: string | null;
  hard_skills?: string[] | null;
  soft_skills?: string[] | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;
  created_at?: string | null;
}

export async function getAllUsers(limit = 100, offset = 0) {
  try {
    const { data, error } = await supabaseAdmin
      .from("student_profiles")
      .select(
        `id, user_id, username, full_name, first_name, last_name, avatar_url, university, hard_skills, soft_skills, linkedin_url, github_url, portfolio_url, created_at`
      )
      .order("created_at", { ascending: false })
      .range(offset, Math.max(offset, limit - 1 + offset));

    if (error) {
      console.error("getAllUsers supabase error:", error);
      return [] as RawUserProfile[];
    }

    return (data || []) as RawUserProfile[];
  } catch (err) {
    console.error("Unexpected error in getAllUsers:", err);
    return [] as RawUserProfile[];
  }
}
