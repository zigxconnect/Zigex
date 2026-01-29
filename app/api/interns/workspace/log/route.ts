import { authMiddleware } from "@/lib/middleware/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET: Fetches the student's internship workspace data.
 */
export async function GET(request: Request) {
    const auth = await authMiddleware(request);
    if (auth instanceof NextResponse) return auth;
    if (auth.type !== "student") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { user } = auth;

    try {
        // 1. Get ALL internship applications
        const { data: structuredApps } = await supabaseAdmin
            .from("internship_applications")
            .select("*, internship:internships(*, company:company_profiles(*))")
            .eq("student_id", user.id);

        const { data: legacyApps } = await supabaseAdmin
            .from("Applications")
            .select("*, internship:internships(*, company:company_profiles(*))")
            .eq("student_id", user.id)
            .eq("application_type", "internship");

        const allApps = [
            ...(structuredApps || []).map(a => ({ ...a, source: 'structured' })),
            ...(legacyApps || []).map(a => ({ ...a, source: 'legacy' }))
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        if (allApps.length === 0) {
            return NextResponse.json({ phase: 'none', message: "No applications found" });
        }

        const acceptedApp = allApps.find(a => a.status === 'accepted');
        const primaryApp = acceptedApp || allApps[0];

        let phase: 'enrolled' | 'screening' | 'reviewing' | 'rejected' = 'screening';
        if (primaryApp.status === 'accepted') phase = 'enrolled';
        else if (primaryApp.status === 'reviewing' || primaryApp.status === 'reviewed') phase = 'reviewing';
        else if (primaryApp.status === 'rejected') phase = 'rejected';

        // 2. Fetch specific workspace data if enrolled
        let logs: any[] = [];
        let tasks: any[] = [];
        let notes: any[] = [];

        const targetInternshipId = primaryApp.internship_id || (primaryApp.internship?.id);

        if (phase === 'enrolled' && targetInternshipId) {
            // Logs / Attendance
            const { data: logData } = await supabaseAdmin
                .from("intern_logs")
                .select("*")
                .eq("student_id", user.id)
                .eq("internship_id", targetInternshipId)
                .order("log_date", { ascending: false });
            logs = logData || [];

            // Tasks (mentors assign these)
            const { data: taskData } = await supabaseAdmin
                .from("internship_tasks")
                .select("*")
                .eq("internship_id", targetInternshipId)
                .order("due_date", { ascending: true });
            tasks = taskData || [];

            // Personal Notebook
            const { data: noteData } = await supabaseAdmin
                .from("intern_notes")
                .select("*")
                .eq("student_id", user.id)
                .eq("internship_id", targetInternshipId)
                .order("updated_at", { ascending: false });
            notes = noteData || [];
        }

        return NextResponse.json({
            phase,
            currentApp: primaryApp,
            internship: primaryApp.internship || primaryApp.internships,
            logs,
            tasks,
            notes,
            allApps
        });
    } catch (error: any) {
        console.error("[WORKSPACE_API_ERROR]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST: Handles Check-in, Notebook entry, or Log Creation
 */
export async function POST(request: Request) {
    const auth = await authMiddleware(request);
    if (auth instanceof NextResponse) return auth;
    if (auth.type !== "student") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { user } = auth;
    const body = await request.json();
    const { action, internshipId } = body;

    try {
        if (action === "check-in") {
            const { latitude, longitude, learningLog, experienceRating } = body;

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
                    experience_rating: experienceRating,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'student_id, internship_id, log_date' })
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json({ success: true, data, locationVerified: isLocationVerified });
        }

        if (action === "save-note") {
            const { title, content, category, noteId } = body;
            const { data, error } = await supabaseAdmin
                .from("intern_notes")
                .upsert({
                    id: noteId || undefined,
                    student_id: user.id,
                    internship_id: internshipId,
                    title,
                    content,
                    category,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json({ success: true, data });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3;
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
