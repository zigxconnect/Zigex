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

/**
 * Phone photos are often 3–12 MB and 4000px wide: slow to send on mobile data,
 * slow to show everywhere afterwards. Resize to what the app actually displays
 * (keeping the photo upright) and re-encode as JPEG. Falls back to the
 * original file if the browser can't decode it. GIFs are left alone.
 */
async function shrinkImage(file: File, maxSide: number): Promise<File> {
  if (file.type === "image/gif" || typeof createImageBitmap === "undefined") return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 400 * 1024) {
      bitmap.close();
      return file;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#fff"; // transparent PNGs get a white background instead of black
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

/** `typeOnly`: check the format before resizing; the size limit applies to what is actually sent. */
function assertFile(file: File, allowed: string[], label: string, typeOnly = false) {
  if (!allowed.includes(file.type)) {
    throw new Error(`${label} must be one of: ${allowed.map((t) => t.split("/")[1]).join(", ")}.`);
  }
  if (typeOnly) return;
  if (file.size > MAX_BYTES) throw new Error(`${label} must be 5 MB or smaller.`);
}

/** Uploads or replaces the student's avatar. Returns its public URL. */
export async function uploadAvatar(original: File) {
  assertFile(original, AVATAR_TYPES, "Profile picture", true);
  const file = await shrinkImage(original, 640);
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
export async function uploadCoverImage(original: File) {
  assertFile(original, AVATAR_TYPES, "Cover image", true);
  const file = await shrinkImage(original, 1600);
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
