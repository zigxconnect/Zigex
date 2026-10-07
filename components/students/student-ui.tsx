import { usableImageUrl } from "@/lib/images";

/** Student directory helpers shared by the server page and the client list (no hooks). */

export type StudentRow = {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  university?: string | null;
};

export const UUID_LIKE = /^[0-9a-f-]{20,}$/i;

/** Accounts that never finished sign-up have no name; they aren't shown as people. */
export const isListable = (s: StudentRow) => Boolean(s.full_name && s.full_name.trim() && s.full_name !== "null");

/** "university of bamenda" → "University of Bamenda" (keeps acronyms like "UBa"). */
export function tidySchool(raw?: string | null) {
  const s = (raw ?? "").trim();
  if (!s) return null;
  if (s !== s.toLowerCase()) return s;
  return s.replace(/\b(\w)(\w*)/g, (_, a: string, b: string) => (["of", "and", "the", "for"].includes(a + b) ? a + b : a.toUpperCase() + b)).replace(/^./, (c) => c.toUpperCase());
}

/**
 * The backend finds a profile by id or exact username (not by a name slug,
 * which is why the old cards showed "Student not found"). Use the username
 * when it is URL-safe, else the id.
 */
export function profileHref(s: StudentRow) {
  const handle = s.username?.replace(/^@+/, "");
  const usable = handle && !UUID_LIKE.test(handle) && /^[A-Za-z0-9._-]+$/.test(handle);
  return `/dashboard/student/${encodeURIComponent(usable ? handle : s.id)}`;
}

// Initials get a steady colour per student, from a small palette that sits with the brand blue.
const AVATAR_COLOURS = ["#155DFC", "#0B1B3F", "#0E7490", "#7C3AED", "#C2410C", "#15803D"];
function avatarColour(seed: string) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLOURS[h % AVATAR_COLOURS.length];
}

export function StudentAvatar({ s, size }: { s: StudentRow; size: string }) {
  const name = s.full_name ?? "";
  const initials = name.split(/\s+/).filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    // Initials sit under the photo: if the photo can't load (alt=""), the browser draws nothing and the initials show.
    <span className={`${size} relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white`} style={{ background: avatarColour(s.id) }}>
      <span aria-hidden="true">{initials}</span>
      {usableImageUrl(s.avatar_url) && <img src={usableImageUrl(s.avatar_url)!} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />}
    </span>
  );
}

