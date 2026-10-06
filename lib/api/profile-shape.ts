/**
 * Maps the profile forms' snake_case fields (the old student_profiles
 * columns) to the camelCase body PATCH /students/me accepts.
 *
 * SPEC_FIELDS are in docs/backend-missing-endpoints.md (Account and auth)
 * but may not be deployed yet; updateMyProfile retries without them if the
 * backend rejects the request. Unknown keys are returned in `unsupported`.
 */

const FIELD_MAP: Record<string, string> = {
  first_name: "firstName",
  last_name: "lastName",
  phone: "phone",
  date_of_birth: "dateOfBirth",
  location: "location",
  about: "about",
  degree: "degree",
  university: "university",
  field_of_study: "fieldOfStudy",
  graduation_year: "graduationYear",
  gpa: "gpa",
  hard_skills: "hardSkills",
  soft_skills: "softSkills",
  portfolio_url: "portfolioUrl",
  github_url: "githubUrl",
  linkedin_url: "linkedinUrl",
  avatar_url: "avatarUrl",
  // Spec'd additions (see SPEC_FIELDS).
  username: "username",
  languages: "languages",
  previous_roles: "previousRoles",
  preferred_industries: "preferredIndustries",
  work_mode: "workMode",
  interests: "interests",
  achievements: "achievements",
  accommodations: "accommodations",
};

/** Requested from the backend; not accepted by PATCH /students/me until it ships them. */
export const SPEC_FIELDS = new Set([
  "username",
  "languages",
  "previousRoles",
  "preferredIndustries",
  "workMode",
  "interests",
  "achievements",
  "accommodations",
]);

const BACKEND_FIELDS = new Set(Object.values(FIELD_MAP));
const URL_FIELDS = new Set(["portfolioUrl", "githubUrl", "linkedinUrl"]);
const NUMBER_FIELDS: Record<string, (v: string) => number> = {
  graduationYear: (v) => parseInt(v, 10),
  gpa: (v) => parseFloat(v),
};
const LIST_FIELDS = new Set([
  "hardSkills",
  "softSkills",
  "languages",
  "previousRoles",
  "preferredIndustries",
  "interests",
  "achievements",
]);
// Server-managed columns forms sometimes echo back; never sent, never reported.
const IGNORED = new Set(["id", "user_id", "email", "role", "full_name", "created_at", "updated_at", "profile_status"]);

export type ProfilePatch = Record<string, string | number | string[] | null>;

export function toProfilePatch(updates: Record<string, unknown>): { body: ProfilePatch; unsupported: string[] } {
  const body: ProfilePatch = {};
  const unsupported: string[] = [];

  for (const [key, raw] of Object.entries(updates)) {
    const field = FIELD_MAP[key] ?? (BACKEND_FIELDS.has(key) ? key : undefined);
    if (!field) {
      if (!IGNORED.has(key)) unsupported.push(key);
      continue;
    }
    if (raw === null || raw === undefined) continue;

    if (field in NUMBER_FIELDS) {
      const value = typeof raw === "number" ? raw : NUMBER_FIELDS[field](String(raw));
      if (Number.isFinite(value)) body[field] = value;
    } else if (LIST_FIELDS.has(field)) {
      const list = Array.isArray(raw) ? raw : String(raw).split(",");
      body[field] = list.map((s) => String(s).trim()).filter(Boolean);
    } else {
      const value = String(raw).trim();
      // An emptied link field clears it; the spec asks the backend to accept null.
      body[field] = URL_FIELDS.has(field) && !value ? null : value;
    }
  }

  // Forms that only collect a full name (e.g. QuickEditField).
  if (typeof updates.full_name === "string" && !body.firstName && !body.lastName) {
    const [firstName, ...rest] = updates.full_name.trim().split(/\s+/);
    if (firstName) body.firstName = firstName;
    if (rest.length) body.lastName = rest.join(" ");
  }

  return { body, unsupported };
}

/** The body without spec'd-but-maybe-undeployed fields, for the retry. */
export function withoutSpecFields(body: ProfilePatch): { body: ProfilePatch; dropped: string[] } {
  const kept: ProfilePatch = {};
  const dropped: string[] = [];
  for (const [key, value] of Object.entries(body)) {
    // Cleared URLs (null) are also part of the spec; the old backend rejects them.
    if (SPEC_FIELDS.has(key) || value === null) dropped.push(key);
    else kept[key] = value;
  }
  return { body: kept, dropped };
}
