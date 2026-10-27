import "server-only";
import { cache } from "react";
import { aiServiceConfigured, getStudentDigest } from "../ai-service";
import { toDigest, type Digest } from "../digest-shape";
import { getMyProfile } from "./profile";

export type DigestState =
  | { status: "ready"; digest: Digest }
  | { status: "none" } // no published digest for this student's segment yet (the service 404s)
  | { status: "unavailable" }; // service not configured, down or slow

/** The signed-in student's latest weekly digest. Never throws. */
export const loadMyDigest = cache(async (): Promise<DigestState> => {
  if (!aiServiceConfigured()) return { status: "unavailable" };
  try {
    const profile = await getMyProfile();
    if (!profile?.id) return { status: "none" };
    const digest = toDigest(await getStudentDigest(profile.id));
    return digest ? { status: "ready", digest } : { status: "none" };
  } catch (error) {
    console.error("[digest] load failed:", error);
    return { status: "unavailable" };
  }
});
