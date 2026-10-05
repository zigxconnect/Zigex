"use server";

import { revalidatePath } from "next/cache";
import { verifyAttendanceToken } from "@/lib/attendance/qr-token";
import { checkIn } from "@/lib/api/services/attendance";
import { ApiClientError } from "@/lib/api/errors";

/**
 * Validates the scanned QR code and checks the intern in (POST /attendance/check-in).
 * Works for static (printed) QR codes from generateStaticAttendanceToken.
 *
 * Security chain:
 * 1. Token signature must be valid (prevents tampering) — checked here
 * 2. Student must be authenticated and accepted for the internship — the backend
 * 3. Geolocation radius, when the internship requires it — the backend, from
 *    the coordinates we pass along
 * 4. Duplicate scans for the same day are accepted (idempotent)
 */
export async function scanAttendanceQR(token: string, studentLat?: number, studentLng?: number) {
    const verified = verifyAttendanceToken(token);
    if ("error" in verified) return { success: false, error: verified.error };

    try {
        await checkIn(verified.internshipId, studentLat, studentLng);
    } catch (err) {
        if (err instanceof ApiClientError) {
            // 400 "Already checked in today" — a repeat scan is not an error.
            if (err.status === 400 && /already/i.test(err.message)) {
                return { success: true, message: "Attendance Already Recorded", alreadyLogged: true };
            }
            if (err.status === 401) {
                return { success: false, error: "Please log in to scan attendance." };
            }
            if (err.status === 403 || err.status === 404) {
                return {
                    success: false,
                    error: "Sorry, it seems you have not been accepted for this internship.",
                    code: "not_accepted",
                };
            }
            // Other 4xx (e.g. outside the allowed radius) carry a message meant for the student.
            if (err.status < 500) return { success: false, error: err.message };
        }
        console.error("[ATTENDANCE] Check-in failed:", err);
        return { success: false, error: "Failed to save attendance. Please try again." };
    }

    try {
        revalidatePath("/intern/workspace");
        revalidatePath("/student/workspace");
    } catch (e) {
        console.warn("[ATTENDANCE] Revalidation failed (ignoring):", e);
    }

    return { success: true, message: "Attendance Logged Successfully", alreadyLogged: false };
}
