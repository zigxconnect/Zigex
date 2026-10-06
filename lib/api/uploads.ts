import { api } from "./browser-client";

/**
 * Client-side uploads to Cloudflare R2 through the backend. Files are sent as
 * base64 JSON, which is what POST /uploads/* accepts.
 */

const MAX_BYTES = 5 * 1024 * 1024;
const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const CV_TYPES = [
  "application/pdf",
  "application/msword",
  // Requested in docs/backend-missing-endpoints.md; the backend's own error is shown if it still refuses.
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    // readAsDataURL gives "data:<mime>;base64,<payload>" — the backend wants the payload only.
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

function assertFile(file: File, allowed: string[], label: string) {
  if (!allowed.includes(file.type)) {
    throw new Error(`${label} must be one of: ${allowed.map((t) => t.split("/")[1]).join(", ")}.`);
  }
  if (file.size > MAX_BYTES) throw new Error(`${label} must be 5 MB or smaller.`);
}

/** Uploads or replaces the student's avatar. Returns its public URL. */
export async function uploadAvatar(file: File) {
  assertFile(file, AVATAR_TYPES, "Profile picture");
  const res = await api.post<{ key: string; url: string }>("/uploads/avatar", {
    base64: await fileToBase64(file),
    mimetype: file.type,
  });
  return res.data;
}

/**
 * Uploads or replaces the student's profile cover image (POST /uploads/cover-image,
 * spec'd in docs/backend-missing-endpoints.md). Throws an error that
 * isEndpointMissing() recognises until the backend deploys it.
 */
export async function uploadCoverImage(file: File) {
  assertFile(file, AVATAR_TYPES, "Cover image");
  const res = await api.post<{ url: string }>("/uploads/cover-image", {
    base64: await fileToBase64(file),
    mimetype: file.type,
  });
  return res.data;
}

/** Uploads or replaces the student's CV (private). Returns its key and a 1-hour signed URL. */
export async function uploadCv(file: File) {
  assertFile(file, CV_TYPES, "CV");
  const res = await api.post<{ key: string; signedUrl: string }>("/uploads/cv", {
    base64: await fileToBase64(file),
    mimetype: file.type,
  });
  return res.data;
}

/** Uploads a PDF cover letter for one of the student's applications. */
export async function uploadCoverLetter(applicationId: string, file: File) {
  assertFile(file, ["application/pdf"], "Cover letter");
  const res = await api.post<{ key?: string; signedUrl?: string }>(
    `/uploads/cover-letter/${encodeURIComponent(applicationId)}`,
    { base64: await fileToBase64(file), mimetype: file.type }
  );
  return res.data;
}

/** A fresh 1-hour signed URL for a private file key (CVs, application documents). */
export async function getSignedUrl(key: string) {
  const res = await api.get<{ signedUrl: string; expiresIn: number }>(
    `/uploads/signed-url?key=${encodeURIComponent(key)}`
  );
  return res.data.signedUrl;
}
