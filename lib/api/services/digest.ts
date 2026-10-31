import "server-only";
import { cache } from "react";
import { aiServiceConfigured, getStudentRecommendation } from "../ai-service";
import { toDigest, type Digest } from "../digest-shape";
import { getMyProfile } from "./profile";

export type DigestState =
  | { status: "ready"; digest: Digest }
  | { status: "preparing" }
  | { status: "none" } // no published digest for this student's segment yet (the service 404s)
  | { status: "unavailable" }; // service not configured, down or slow

const text = (value: unknown): string | null => (typeof value === "string" && value.trim() ? value.trim() : null);

function list(...values: unknown[]): string[] {
  const items = values.flatMap((value) =>
    Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : []
  );
  const seen = new Set<string>();
  return items
    .map((item) => String(item).trim())
    .filter((item) => {
      const key = item.toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

/** The signed-in student's latest weekly digest. Never throws. */
export const loadMyDigest = cache(async (): Promise<DigestState> => {
  if (!aiServiceConfigured()) return { status: "unavailable" };
  try {
    const profile = await getMyProfile();
    if (!profile?.id) return { status: "none" };
    const result = await getStudentRecommendation(profile.id, {
      department: text(profile.field_of_study ?? profile.fieldOfStudy ?? profile.department ?? profile.track) ?? "general",
      skills: list(profile.hard_skills, profile.hardSkills, profile.soft_skills, profile.softSkills, profile.skills),
      interests: list(profile.interests, profile.preferred_industries, profile.preferredIndustries),
      level: text(profile.level ?? profile.education_level ?? profile.educationLevel ?? profile.degree),
      location: text(profile.location ?? profile.city ?? profile.country),
    });
    if (result.status === "queued") return { status: "preparing" };
    if (result.status === "empty") return { status: "none" };
    const digest = toDigest(result.digest);
    return digest ? { status: "ready", digest } : { status: "none" };
  } catch (error) {
    console.error("[digest] load failed:", error);
    return { status: "unavailable" };
  }
});
