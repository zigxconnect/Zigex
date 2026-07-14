"use server";

import { createServerActionClient, supabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

const SECRET_KEY = process.env.JWT_SECRET || "zigex_super_secret_attendance_key_2026";

// Helper: Calculate distance between two points in meters (Haversine formula)
function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

// ═══════════════════════════════════════════════════════════════
// STATIC QR CODE — Designed to be printed and placed in departments
// ═══════════════════════════════════════════════════════════════

/**
 * Generates a PERMANENT, static signed token for an internship.
 * This token is meant to be printed as a QR code poster.
 * Security relies on the scanning student being authenticated + assigned to the internship.
 */
export async function generateStaticAttendanceToken(internshipId: string) {
    try {
        const supabase = await createServerActionClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Unauthorized" };

        // Verify caller is a supervisor or admin
        const { data: profile } = await supabaseAdmin
            .from("supervisor_profiles")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

        // Also check if admin
        const { data: companyProfile } = await supabaseAdmin
            .from("company_profiles")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

        if (!profile && !companyProfile) {
            return { success: false, error: "Only supervisors or admins can generate attendance codes." };
        }

        const payload = {
            internshipId,
            type: "zigex_attendance_v2",
            createdBy: profile?.id || companyProfile?.id,
            createdAt: new Date().toISOString()
        };

        // HMAC signature to prevent tampering — no expiration for static codes
        const dataStr = JSON.stringify(payload);
        const signature = crypto.createHmac("sha256", SECRET_KEY).update(dataStr).digest("hex");

        const token = Buffer.from(JSON.stringify({ d: payload, s: signature })).toString("base64");

        return { success: true, token };
    } catch (err) {
        console.error("[ATTENDANCE] Error generating static token:", err);
        return { success: false, error: "Failed to generate attendance code." };
    }
}

/**
 * Validates the scanned QR code and logs the intern's attendance.
 * Works for BOTH static (printed) and dynamic QR codes.
 * 
 * Security chain:
 * 1. Student must be authenticated
 * 2. Token signature must be valid (prevents tampering)
 * 3. Student must have an accepted application for this internship
 * 4. Duplicate scans for the same day are silently accepted (idempotent)
 * 5. If geolocation is required by the internship, distance is verified.
 */
export async function scanAttendanceQR(token: string, studentLat?: number, studentLng?: number) {
    try {
        const supabase = await createServerActionClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Please log in to scan attendance." };

        // ── Decode & verify token ──
        let decoded;
        try {
            const decodedStr = Buffer.from(token, "base64").toString("utf-8");
            decoded = JSON.parse(decodedStr);
        } catch {
            return { success: false, error: "Invalid QR code. Please try again." };
        }

        const { d: data, s: signature } = decoded;
        if (!data || !signature) {
            return { success: false, error: "Malformed QR code." };
        }

        // Verify HMAC
        const expectedSig = crypto.createHmac("sha256", SECRET_KEY).update(JSON.stringify(data)).digest("hex");
        if (signature !== expectedSig) {
            return { success: false, error: "This QR code is not valid." };
        }

        // Check type marker
        if (data.type !== "zigex_attendance_v2") {
            return { success: false, error: "This is not an attendance QR code." };
        }

        const internshipId = data.internshipId;
        if (!internshipId) {
            return { success: false, error: "Invalid QR code: missing internship ID." };
        }

        // ── Geolocation Verification ──
        // Fetch internship geolocation settings
        let { data: locationData } = await supabaseAdmin
            .from("internships")
            .select("require_geolocation, geo_latitude, geo_longitude, geo_radius_meters")
            .eq("id", internshipId)
            .maybeSingle();
            
        if (!locationData) {
            const { data: programData } = await supabaseAdmin
                .from("programs")
                .select("require_geolocation, geo_latitude, geo_longitude, geo_radius_meters")
                .eq("id", internshipId)
                .maybeSingle();
            if (programData) {
                locationData = programData;
            }
        }

        if (locationData?.require_geolocation) {
            if (!studentLat || !studentLng) {
                return { success: false, error: "Location access is required to take attendance for this program." };
            }

            if (locationData.geo_latitude && locationData.geo_longitude) {
                const distance = getDistanceInMeters(
                    studentLat,
                    studentLng,
                    locationData.geo_latitude,
                    locationData.geo_longitude
                );

                const allowedRadius = locationData.geo_radius_meters || 100;
                
                if (distance > allowedRadius) {
                    return { 
                        success: false, 
                        error: `You are too far from the office (${Math.round(distance)}m). You must be within ${allowedRadius}m of the premises to check in.` 
                    };
                }
            }
        }

        // ── Verify student is assigned to this internship ──
        // Check student_profiles first
        const { data: studentProfile } = await supabaseAdmin
            .from("student_profiles")
            .select("id, user_id")
            .eq("user_id", user.id)
            .maybeSingle();

        if (!studentProfile) {
            return { success: false, error: "Sorry, it seems you have not been accepted for this internship.", code: "not_accepted" };
        }

        // Both IDs we need to check against:
        // - studentProfile.user_id (auth user id) → used as student_id in internship_applications
        // - studentProfile.id (profile row id) → used as student_id in Applications
        const authUserId = studentProfile.user_id;   // e.g. auth.users.id
        const profileId = studentProfile.id;          // e.g. student_profiles.id

        // Check internship_applications table (student_id = auth user id)
        const { data: application, error: appErr } = await supabaseAdmin
            .from("internship_applications")
            .select("id, supervisor_id")
            .eq("student_id", authUserId)
            .eq("internship_id", internshipId)
            .in("status", ["accepted", "rsvp_confirmed"])
            .maybeSingle();

        if (appErr) {
            console.error("[ATTENDANCE] internship_applications query error:", appErr);
        }

        // Also check unified Applications table (student_id = student_profiles.id)
        let supervisorId = application?.supervisor_id;
        if (!application) {
            const { data: unifiedApp, error: unifiedErr } = await supabaseAdmin
                .from("Applications")
                .select("id, supervisor_id")
                .eq("student_id", profileId)
                .or(`internship_id.eq.${internshipId},program_id.eq.${internshipId}`)
                .in("status", ["accepted", "rsvp_confirmed"])
                .maybeSingle();

            if (unifiedErr) {
                console.error("[ATTENDANCE] Applications query error:", unifiedErr);
            }

            if (!unifiedApp) {
                // Last resort: also try with auth user id in Applications
                const { data: fallbackApp } = await supabaseAdmin
                    .from("Applications")
                    .select("id, supervisor_id")
                    .eq("student_id", authUserId)
                    .or(`internship_id.eq.${internshipId},program_id.eq.${internshipId}`)
                    .in("status", ["accepted", "rsvp_confirmed"])
                    .maybeSingle();

                if (!fallbackApp) {
                    // Also try internship_applications with profile id
                    const { data: fallbackApp2 } = await supabaseAdmin
                        .from("internship_applications")
                        .select("id, supervisor_id")
                        .eq("student_id", profileId)
                        .eq("internship_id", internshipId)
                        .in("status", ["accepted", "rsvp_confirmed"])
                        .maybeSingle();

                    if (!fallbackApp2) {
                        return { success: false, error: "Sorry, it seems you have not been accepted for this internship.", code: "not_accepted" };
                    }
                    supervisorId = fallbackApp2.supervisor_id;
                } else {
                    supervisorId = fallbackApp.supervisor_id;
                }
            } else {
                supervisorId = unifiedApp.supervisor_id;
            }
        }

        // ── Log attendance (JSONB append) ──
        const now = new Date();
        const today = now.toISOString().split("T")[0];

        const newLogEntry = {
            status: "present",
            confirmed_at: now.toISOString(),
            supervisor_id: supervisorId || data.createdBy,
            method: "qr_scan"
        };

        const { data: existingRecord } = await supabaseAdmin
            .from("intern_attendance_v2")
            .select("id, attendance_logs")
            .eq("student_id", studentProfile.id)
            .eq("internship_id", internshipId)
            .maybeSingle();

        let updateError;

        if (existingRecord) {
            // Check if already scanned today (idempotent)
            const logs = (existingRecord.attendance_logs as Record<string, any>) || {};
            if (logs[today]) {
                return {
                    success: true,
                    message: "Attendance Already Recorded",
                    alreadyLogged: true
                };
            }
            const updatedLogs = { ...logs, [today]: newLogEntry };
            const { error } = await supabaseAdmin
                .from("intern_attendance_v2")
                .update({ attendance_logs: updatedLogs })
                .eq("id", existingRecord.id);
            updateError = error;
        } else {
            const { error } = await supabaseAdmin
                .from("intern_attendance_v2")
                .insert({
                    student_id: studentProfile.id,
                    internship_id: internshipId,
                    supervisor_id: supervisorId || data.createdBy || null,
                    attendance_logs: { [today]: newLogEntry }
                });
            updateError = error;
        }

        if (updateError) {
            console.error("[ATTENDANCE] DB Error:", updateError);
            return { success: false, error: "Failed to save attendance." };
        }

        try {
            revalidatePath("/supervisor");
            revalidatePath("/intern/workspace");
        } catch (e) {
            console.warn("[ATTENDANCE] Revalidation failed (ignoring):", e);
        }

        return {
            success: true,
            message: "Attendance Logged Successfully",
            alreadyLogged: false
        };

    } catch (err: any) {
        console.error("[ATTENDANCE] Unexpected error:", err?.message || err);
        return { success: false, error: "An unexpected error occurred: " + (err?.message || "Unknown error") };
    }
}
