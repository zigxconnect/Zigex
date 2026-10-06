"use server";

// Supervisor/company side of QR attendance. Still on Supabase: it moves out
// with the admin app (feat/admin-split).
import { createServerActionClient, supabaseAdmin } from "@/lib/supabase/server";
import { signAttendanceToken } from "@/lib/attendance/qr-token";

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

        // HMAC-signed, no expiration for static codes
        const token = signAttendanceToken(internshipId, profile?.id || companyProfile?.id);

        return { success: true, token };
    } catch (err) {
        console.error("[ATTENDANCE] Error generating static token:", err);
        return { success: false, error: "Failed to generate attendance code." };
    }
}
