import { authMiddleware } from "@/lib/middleware/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET: Fetches the student's active internship and their logs.
 */
export async function GET(request: Request) {
    const auth = await authMiddleware(request);
    if (auth instanceof NextResponse) return auth;
    if (auth.type !== "student") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { user } = auth;

    try {
        // 1. Get the active internship (where the application is 'accepted')
        // Check both legacy "Applications" and new "internship_applications"
        let activeInternship = null;

        const { data: legacyApp } = await supabaseAdmin
            .from("Applications")
            .select("internship_id, internships(*, company:company_profiles(*))")
            .eq("student_id", user.id) // Note: student_id in legacy might be profile_id, check this
            .eq("status", "accepted")
            .eq("application_type", "internship")
            .maybeSingle();

        if (legacyApp) {
            activeInternship = { ...legacyApp.internships, appId: legacyApp.id, type: 'legacy' };
        } else {
            const { data: sApp } = await supabaseAdmin
                .from("internship_applications")
                .select("internship_id, internship:internships(*, company:company_profiles(*))")
                .eq("student_id", user.id)
                .eq("status", "accepted")
                .maybeSingle();

            if (sApp) {
                activeInternship = { ...sApp.internship, appId: sApp.id, type: 'structured' };
            }
        }

        if (!activeInternship) {
            return NextResponse.json({ message: "No active internship found" }, { status: 200 });
        }

        // 2. Fetch logs for this internship
        const { data: logs } = await supabaseAdmin
            .from("intern_logs")
            .select("*")
            .eq("student_id", user.id)
            .eq("internship_id", activeInternship.id)
            .order("log_date", { ascending: false });

        return NextResponse.json({
            internship: activeInternship,
            logs: logs || []
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST: Handles Check-in or Log Creation
 */
export async function POST(request: Request) {
    const auth = await authMiddleware(request);
    if (auth instanceof NextResponse) return auth;
    if (auth.type !== "student") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { user } = auth;
    const { internshipId, latitude, longitude, learningLog, tasksCompleted, experienceRating } = await request.json();

    try {
        // 1. Verify distance if coordinates provided
        let isLocationVerified = false;
        if (latitude && longitude) {
            const { data: internship } = await supabaseAdmin
                .from("internships")
                .select("office_latitude, office_longitude, geofence_radius_meters")
                .eq("id", internshipId)
                .single();

            if (internship?.office_latitude && internship?.office_longitude) {
                const distance = calculateDistance(
                    latitude, longitude,
                    internship.office_latitude, internship.office_longitude
                );
                isLocationVerified = distance <= (internship.geofence_radius_meters || 200);
            }
        }

        // 2. Upsert the daily log
        const { data, error } = await supabaseAdmin
            .from("intern_logs")
            .upsert({
                student_id: user.id,
                internship_id: internshipId,
                log_date: new Date().toISOString().split('T')[0],
                check_in: new Date().toISOString(),
                latitude,
                longitude,
                is_location_verified: isLocationVerified,
                learning_log: learningLog,
                tasks_completed: tasksCompleted,
                experience_rating: experienceRating,
                updated_at: new Date().toISOString()
            }, { onConflict: 'student_id, internship_id, log_date' })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data,
            locationVerified: isLocationVerified
        });
    } catch (error: any) {
        console.error("[WORKSPACE_LOG_ERROR]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Haversine formula to calculate distance in meters
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}
