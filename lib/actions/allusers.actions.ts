"use server";

import { serverApi } from "@/lib/api/server-client";
import { whenAvailable } from "@/lib/api/errors";

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
  about?: string | null;
  cover_image?: string | null;
  created_at?: string | null;
  role?: string | null;
  email?: string | null;
  /** Spec'd on GET /students rows: application and project counts. */
  stats?: {
    internships?: number;
    programs?: number;
    events?: number;
    projects?: number;
    current_program?: string | null;
  };
}

const PAGE_SIZE = 100;

/**
 * The student directory (GET /students, spec'd in
 * the Oct 2026 backend endpoint request → Discovery and social). Empty until it
 * ships. Never includes other students' contact details.
 */
export async function getAllUsers(limit = 100, offset = 0, search?: string): Promise<RawUserProfile[]> {
  try {
    const rows: RawUserProfile[] = [];
    for (let page = Math.floor(offset / PAGE_SIZE) + 1; rows.length < limit; page++) {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (search) params.set("search", search);
      const res = await whenAvailable(() => serverApi.get<RawUserProfile[]>(`/students?${params}`), null);
      if (!res) break;
      rows.push(...(res.data ?? []));
      if (!res.meta || page >= res.meta.totalPages) break;
    }
    return rows.slice(0, limit);
  } catch (err) {
    console.error("Unexpected error in getAllUsers:", err);
    return [];
  }
}
