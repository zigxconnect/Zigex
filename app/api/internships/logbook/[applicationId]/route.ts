import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, createClient } from "@/lib/supabase/server";
import { format } from "date-fns";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ applicationId: string }> }
) {
    const { applicationId } = await params;

    try {
        console.log(`[LOGBOOK_API] Request for AppID: ${applicationId}`);

        // 0. Verify Authentication
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.error("[LOGBOOK_API] Unauthorized access attempt");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // 1. Fetch Application Details - Super resilient select
        const { data: app, error: appError } = await supabaseAdmin
            .from("internship_applications")
            .select(`
                *,
                internships (
                    *,
                    company_profiles (*)
                ),
                supervisor_profiles (*)
            `)
            .eq("id", applicationId)
            .single();

        if (appError) {
            console.error("[LOGBOOK_API] Supabase Error:", appError);
            // Fallback for some environments
            const { data: legacyApp } = await supabaseAdmin
                .from("Applications")
                .select("*, internships(*, company_profiles(*))")
                .eq("id", applicationId)
                .maybeSingle();

            if (!legacyApp) {
                return new NextResponse("Application not found", { status: 404 });
            }
            Object.assign(app || {}, legacyApp);
        }

        if (!app) {
            return new NextResponse("Application not found", { status: 404 });
        }

        // 1.2 Fetch student profile separately
        const { data: studentProfile } = await supabaseAdmin
            .from("student_profiles")
            .select("*")
            .eq("user_id", app.student_id)
            .maybeSingle();

        // 1.5 Authorization Check
        // Allow: The student themselves, the assigned supervisor, or the company owner/admin
        const isStudent = user.id === app.student_id;
        const isSupervisor = user.id === app.supervisor_id;

        let isAuthorized = isStudent || isSupervisor;

        if (!isAuthorized) {
            // Check if user is an admin or company owner
            const { data: profile } = await supabaseAdmin
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (profile?.role === 'admin') {
                isAuthorized = true;
            } else {
                const { data: company } = await supabaseAdmin
                    .from("company_profiles")
                    .select("id")
                    .eq("user_id", user.id)
                    .single();

                if (company && company.id === app.internships?.company_id) {
                    isAuthorized = true;
                }
            }
        }

        if (!isAuthorized) {
            return new NextResponse("Access Forbidden", { status: 403 });
        }

        // 2. Fetch Logs
        const { data: logs, error: logsError } = await supabaseAdmin
            .from("intern_logs")
            .select("*")
            .eq("internship_id", app.internship_id)
            .eq("student_id", app.student_id)
            .order("log_date", { ascending: true });

        if (logsError) {
            return new NextResponse("Error fetching logs", { status: 500 });
        }

        const studentName = studentProfile?.full_name || app.full_name || "Intern";
        const internshipTitle = app.internships?.title || "Professional Internship";
        const companyName = app.internships?.company_profiles?.company_name || "Zigex Partner";
        const companyLogo = app.internships?.company_profiles?.logo_url || "https://zigexconnect.com/seedLogo.png";

        // Calculate Stats
        const totalLogs = logs.length;
        const avgRating = totalLogs > 0
            ? (logs.reduce((sum, l) => sum + (l.experience_rating || 0), 0) / totalLogs).toFixed(1)
            : "N/A";

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Logbook - ${studentName}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        
        body {
            font-family: 'Inter', sans-serif;
            color: #1e293b;
            line-height: 1.5;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
        }

        .page {
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            margin: 10mm auto;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            box-sizing: border-box;
        }

        @media print {
            body { background: none; }
            .page { margin: 0; box-shadow: none; width: 100%; }
            .no-print { display: none !important; }
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #1e293b;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .company-info .logo {
            height: 50px;
            margin-bottom: 10px;
        }

        .document-title {
            text-align: right;
        }

        .document-title h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .document-title p {
            margin: 5px 0 0;
            color: #64748b;
            font-size: 12px;
            font-weight: 600;
        }

        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 40px;
        }

        .info-box {
            background: #f1f5f9;
            padding: 20px;
            border-radius: 12px;
        }

        .info-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #64748b;
            font-weight: 800;
            margin-bottom: 5px;
        }

        .info-value {
            font-size: 14px;
            font-weight: 700;
            color: #0f172a;
        }

        .stats-row {
            display: flex;
            gap: 20px;
            margin-bottom: 40px;
        }

        .stat-card {
            flex: 1;
            border: 1px solid #e2e8f0;
            padding: 15px;
            border-radius: 12px;
            text-align: center;
        }

        .stat-value {
            font-size: 20px;
            font-weight: 800;
            color: #2563eb;
        }

        .stat-label {
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 700;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
        }

        th {
            background: #f8fafc;
            text-align: left;
            padding: 12px;
            font-size: 10px;
            text-transform: uppercase;
            color: #64748b;
            border-bottom: 2px solid #e2e8f0;
        }

        td {
            padding: 15px 12px;
            font-size: 12px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: top;
        }

        .log-date { font-weight: 700; width: 100px; }
        .log-content { color: #334155; }
        .log-tasks { font-size: 11px; margin-top: 5px; color: #64748b; }
        .log-rating { text-align: center; width: 60px; }

        .signatures {
            margin-top: 60px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
        }

        .sig-box {
            border-top: 1px solid #000;
            padding-top: 10px;
            text-align: center;
        }

        .sig-label {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
        }

        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
            border-top: 1px solid #f1f5f9;
            padding-top: 20px;
        }

        .btn-print {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #2563eb;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 50px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4);
            transition: all 0.2s;
        }

        .btn-print:hover { transform: translateY(-2px); }
    </style>
</head>
<body>
    <button class="no-print btn-print" onclick="window.print()">Print Logbook</button>

    <div class="page">
        <div class="header">
            <div class="company-info">
                <img src="${companyLogo}" alt="Logo" class="logo">
                <div style="font-size: 14px; font-weight: 800;">${companyName}</div>
            </div>
            <div class="document-title">
                <h1>Internship Logbook</h1>
                <p>Digital Progress Record</p>
                <p>Generated on ${format(new Date(), "PPpp")}</p>
            </div>
        </div>

        <div class="info-grid">
            <div class="info-box">
                <div class="info-label">Intern Name</div>
                <div class="info-value">${studentName}</div>
                <div style="margin-top: 15px;" class="info-label">Email Address</div>
                <div class="info-value">${studentProfile?.email || app.email || "N/A"}</div>
            </div>
            <div class="info-box">
                <div class="info-label">Internship Title</div>
                <div class="info-value">${internshipTitle}</div>
                <div style="margin-top: 15px;" class="info-label">Assigned Supervisor</div>
                <div class="info-value">${app.supervisor_profiles?.full_name || "Unassigned"}</div>
            </div>
        </div>

        <div class="stats-row">
            <div class="stat-card">
                <div class="stat-value">${totalLogs}</div>
                <div class="stat-label">Days Logged</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${avgRating}</div>
                <div class="stat-label">Avg Experience</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${app.duration || "N/A"}</div>
                <div class="stat-label">Target Duration</div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th class="log-date">Date</th>
                    <th>Submissions & Learning Logs</th>
                    <th class="log-rating">Rating</th>
                </tr>
            </thead>
            <tbody>
                ${logs.map(log => `
                    <tr>
                        <td class="log-date">${format(new Date(log.log_date), "dd MMM yyyy")}</td>
                        <td>
                            <div class="log-content">${log.learning_log}</div>
                            ${log.tasks_completed && log.tasks_completed.length > 0 ? `
                                <div class="log-tasks">
                                    <strong>Tasks:</strong> ${log.tasks_completed.join(", ")}
                                </div>
                            ` : ''}
                        </td>
                        <td class="log-rating">${log.experience_rating}/5</td>
                    </tr>
                `).join('')}
                ${logs.length === 0 ? '<tr><td colspan="3" style="text-align: center; padding: 40px; color: #94a3b8;">No daily reports submitted yet.</td></tr>' : ''}
            </tbody>
        </table>

        <div class="signatures">
            <div class="sig-box">
                <div class="sig-label">Supervisor Signature</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 5px;">${app.supervisor_profiles?.full_name || 'Supervisor Name'}</div>
            </div>
            <div class="sig-box">
                <div class="sig-label">Institution Stamp / Admin Signature</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 5px;">Academic Director / Seed Inc. HR</div>
            </div>
        </div>

        <div class="footer">
            <p>ZIGEX PROFESSIONAL INTERNSHIP TRACKING SYSTEM</p>
            <p>This is a digitally generated document. For verification, contact support@zigexconnect.com</p>
        </div>
    </div>

    <script>
        window.onload = () => {
            // Optional: auto-trigger print on load if requested via query param
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('print') === 'true') {
                setTimeout(() => window.print(), 500);
            }
        };
    </script>
</body>
</html>
        `;

        return new NextResponse(html, {
            headers: { "Content-Type": "text/html" },
        });

    } catch (error) {
        console.error("Logbook API Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
