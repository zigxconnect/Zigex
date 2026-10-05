import "server-only";
import crypto from "crypto";

/**
 * Static attendance QR codes: a base64 JSON { d: payload, s: HMAC-SHA256(payload) }.
 * Printed once per internship by a supervisor; scanned by interns to check in.
 * Shared by the supervisor generator and the student check-in so the format
 * and secret stay in one place.
 */

// Read lazily and fail closed: a hardcoded fallback would let anyone with the
// source forge check-in codes.
function secretKey(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set; attendance QR codes cannot be signed or verified.");
  return secret;
}
const TOKEN_TYPE = "zigex_attendance_v2";

export type AttendanceTokenPayload = {
  internshipId: string;
  type: typeof TOKEN_TYPE;
  createdBy?: string;
  createdAt: string;
};

const sign = (payload: unknown) =>
  crypto.createHmac("sha256", secretKey()).update(JSON.stringify(payload)).digest("hex");

export function signAttendanceToken(internshipId: string, createdBy?: string): string {
  const payload: AttendanceTokenPayload = {
    internshipId,
    type: TOKEN_TYPE,
    createdBy,
    createdAt: new Date().toISOString(),
  };
  return Buffer.from(JSON.stringify({ d: payload, s: sign(payload) })).toString("base64");
}

/** Returns the internship id, or an error message suitable for the student. */
export function verifyAttendanceToken(token: string): { internshipId: string } | { error: string } {
  let decoded: { d?: AttendanceTokenPayload; s?: string };
  try {
    decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
  } catch {
    return { error: "Invalid QR code. Please try again." };
  }

  const { d: data, s: signature } = decoded;
  if (!data || !signature) return { error: "Malformed QR code." };

  const expected = sign(data);
  const valid =
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) return { error: "This QR code is not valid." };
  if (data.type !== TOKEN_TYPE) return { error: "This is not an attendance QR code." };
  if (!data.internshipId) return { error: "Invalid QR code: missing internship ID." };

  return { internshipId: data.internshipId };
}
