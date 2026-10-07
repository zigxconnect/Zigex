import "server-only";
import { cache } from "react";
import { usableImageUrl } from "@/lib/images";
import { serverApi } from "../server-client";
import { ApiClientError, whenAvailable } from "../errors";
import { fetchAllUserProjects } from "@/lib/actions/getProjects.action";
import { displayName, getMyProfile } from "./profile";

/**
 * A student's public profile page (docs/backend-missing-endpoints.md →
 * Discovery and social): GET /students/{id} (deployed; profile id only),
 * /connections and /students/{id}/projects. Profile URLs that use a
 * username or name slug need the backend to also resolve those (spec'd);
 * until then they show "Student not found". Phone and email are never shown.
 */

type PublicProfileRow = Record<string, any> & {
  id: string;
  user_id?: string;
  full_name?: string;
  stats?: { internships?: number; programs?: number; events?: number; projects?: number };
  badges?: any[];
  points?: number;
  active_stories?: any[];
  accepted_applications?: { type: string; status: string; title: string; id: string }[];
  active_internship?: { internship: any; company: any; supervisor: any; log_dates?: string[] } | null;
  supervisor_profile?: Record<string, any> | null;
  supervisees_count?: number;
  similar_students?: any[];
};

const EMPTY_CONNECTIONS = { count: 0, peers: [], supervisors: [] };

/** The raw profile row, or null when not found or not deployed. Deduplicated per request. */
export const getPublicProfileRow = cache(async (username: string): Promise<PublicProfileRow | null> => {
  try {
    return await whenAvailable(
      async () => {
        const row = (await serverApi.get<PublicProfileRow>(`/students/${encodeURIComponent(username)}`)).data ?? null;
        return row ? { ...row, full_name: displayName(row) || row.full_name, avatar_url: usableImageUrl(row.avatar_url), cover_image_url: usableImageUrl(row.cover_image_url), cover_image: usableImageUrl(row.cover_image) } : null;
      },
      null
    );
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) return null;
    throw error;
  }
});

/** A profile with projects and context for the profile page, or null when the student is not found. */
export async function getPublicProfile(username: string) {
  const data = await getPublicProfileRow(username);
  if (!data) return null;

  const [projectsResult, connectionStats, me] = await Promise.all([
    fetchAllUserProjects(data.id),
    whenAvailable(
      async () => (await serverApi.get<typeof EMPTY_CONNECTIONS>(`/students/${encodeURIComponent(data.username ?? username)}/connections`)).data,
      EMPTY_CONNECTIONS
    ).catch(() => EMPTY_CONNECTIONS),
    getMyProfile().catch(() => null),
  ]);

  const active = data.active_internship;
  return {
    data,
    stats: {
      internshipsApplied: data.stats?.internships ?? 0,
      programsApplied: data.stats?.programs ?? 0,
      eventsApplied: data.stats?.events ?? 0,
    },
    projects: projectsResult.success ? projectsResult.data : [],
    activeStories: data.active_stories ?? [],
    similarStudents: data.similar_students ?? [],
    myProfile: me ? { id: me.id, user_id: me.user_id } : null,
    applicationsList: data.accepted_applications ?? [],
    activeInternshipInfo: active
      ? {
          internship: active.internship,
          company: active.company ?? active.internship?.company ?? null,
          supervisor: active.supervisor ?? null,
          logs: (active.log_dates ?? []).map((log_date, i) => ({ id: `${i}`, log_date })),
        }
      : null,
    supervisorProfile: data.supervisor_profile ?? null,
    superviseesCount: data.supervisees_count ?? 0,
    connectionStats: connectionStats ?? EMPTY_CONNECTIONS,
    badges: data.badges ?? [],
  };
}
