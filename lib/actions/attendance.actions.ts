"use server";

import { createServerActionClient, supabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

const SECRET_KEY = process.env.JWT_SECRET || "zigex_super_secret_attendance_key_2026";

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
 */
export async function scanAttendanceQR(token: string) {
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

        // Check if student has an accepted application for this internship
        const possibleIds = [studentProfile.id, studentProfile.user_id].filter(Boolean);

        const { data: application } = await supabaseAdmin
            .from("internship_applications")
            .select("id, supervisor_id")
            .or(`student_id.in.(${possibleIds.join(",")}),user_id.in.(${possibleIds.join(",")})`)
            .eq("internship_id", internshipId)
            .in("status", ["accepted", "rsvp_confirmed"])
            .maybeSingle();

        // Also check unified Applications table
        let supervisorId = application?.supervisor_id;
        if (!application) {
            const { data: unifiedApp } = await supabaseAdmin
                .from("Applications")
                .select("id, supervisor_id")
                .or(`student_id.in.(${possibleIds.join(",")}),user_id.in.(${possibleIds.join(",")})`)
                .or(`internship_id.eq.${internshipId},program_id.eq.${internshipId}`)
                .in("status", ["accepted", "rsvp_confirmed"])
                .maybeSingle();

            if (!unifiedApp) {
                return { success: false, error: "Sorry, it seems you have not been accepted for this internship.", code: "not_accepted" };
            }
            supervisorId = unifiedApp.supervisor_id;
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
            const logs = existingRecord.attendance_logs as Record<string, any>;
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
                    supervisor_id: supervisorId || data.createdBy,
                    attendance_logs: { [today]: newLogEntry }
                });
            updateError = error;
        }

        if (updateError) {
            console.error("[ATTENDANCE] DB Error:", updateError);
            return { success: false, error: "Failed to save attendance." };
        }

        revalidatePath("/supervisor");
        revalidatePath("/intern/workspace");

        return {
            success: true,
            message: "Attendance Logged Successfully",
            alreadyLogged: false
        };

    } catch (err) {
        console.error("[ATTENDANCE] Unexpected error:", err);
        return { success: false, error: "An unexpected error occurred." };
    }
}
