import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, createClient } from "@/lib/supabase/server";
import { format } from "date-fns";

/**
 * API Route to generate a professional, printable HTML receipt for internship payments.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ applicationId: string }> }
) {
    const { applicationId } = await params;
    const searchParams = req.nextUrl.searchParams;
    const month = searchParams.get("month");

    if (!month) {
        return new NextResponse("Month parameter is required", { status: 400 });
    }

    try {
        console.log(`[RECEIPT_API] Request for AppID: ${applicationId}, Month: ${month}`);

        // 1. Verify Authentication
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.error("[RECEIPT_API] Unauthorized access attempt");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // 2. Fetch Application Data - Simplified join to be super resilient
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
            console.error("[RECEIPT_API] Supabase Error:", appError);
            // Fallback for some environments: maybe the table is 'Applications'?
            const { data: legacyApp } = await supabaseAdmin
                .from("Applications")
                .select("*, internships(*, company_profiles(*))")
                .eq("id", applicationId)
                .maybeSingle();

            if (!legacyApp) {
                return new NextResponse("Application not found", { status: 404 });
            }
            // Use legacy app if found
            Object.assign(app || {}, legacyApp);
        }

        if (!app) {
            return new NextResponse("Application not found", { status: 404 });
        }

        // 2.5 Fetch student profile separately to avoid join errors
        const { data: studentProfile } = await supabaseAdmin
            .from("student_profiles")
            .select("*")
            .eq("user_id", app.student_id)
            .maybeSingle();

        // 3. Security Authorization Check
        // Allow: The student themselves, the assigned supervisor, or the company owner
        const isStudent = user.id === app.student_id;
        const isSupervisor = user.id === app.supervisor_id;

        // Check for admin/company context if not already matched
        let isAuthorized = isStudent || isSupervisor;

        if (!isAuthorized) {
            // Check if user is the company owner or an admin
            const { data: profile } = await supabaseAdmin
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (profile?.role === 'admin') {
                isAuthorized = true;
            } else {
                // Check if user is company owner
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
            return new NextResponse("Forbidden: Access denied to this receipt", { status: 403 });
        }

        // 4. Extract Specific Payment Record
        const ledger = app.payment_ledger || [];
        const monthIdx = parseInt(month);
        const record = ledger.find((r: any) => r.month === monthIdx);

        if (!record || record.status !== 'paid') {
            return new NextResponse("No paid record found for this month", { status: 404 });
        }

        // 5. Prepare Display Data
        const studentName = studentProfile?.full_name || app.full_name || "Valued Intern";
        const studentEmail = studentProfile?.email || app.email || "N/A";
        const internshipTitle = app.internships?.title || "Professional Internship";
        const companyName = app.internships?.company_profiles?.company_name || "Zigex Partner";
        const companyLogo = app.internships?.company_profiles?.logo_url || "https://zigexconnect.com/seedLogo.png";

        const receiptNo = `ZGX-${applicationId.substring(0, 5).toUpperCase()}-${monthIdx}-${Date.now().toString().slice(-4)}`;
        const amount = record.amount || 0;
        const paidDate = record.date ? format(new Date(record.date), "PPP") : format(new Date(), "PPP");
        const monthName = format(new Date(2024, monthIdx - 1), "MMMM");

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt - ${receiptNo}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        :root {
            --primary: #155DFC;
            --primary-dark: #003dbd;
            --slate-50: #f8fafc;
            --slate-100: #f1f5f9;
            --slate-400: #94a3b8;
            --slate-600: #475569;
            --slate-900: #0f172a;
        }

        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: var(--slate-900);
            margin: 0;
            padding: 0;
            background-color: var(--slate-100);
            -webkit-print-color-adjust: exact;
        }

        .receipt-wrapper {
            max-width: 800px;
            margin: 40px auto;
            background: white;
            border-radius: 24px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.05);
            overflow: hidden;
            position: relative;
        }

        @media print {
            body { background: white; }
            .receipt-wrapper { 
                margin: 0; 
                box-shadow: none; 
                border-radius: 0;
                width: 100%;
            }
            .no-print { display: none !important; }
        }

        .header-stripe {
            height: 8px;
            background: linear-gradient(90deg, var(--primary), #6366f1);
        }

        .header {
            padding: 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(to bottom, #f8fafc, white);
        }

        .logo-section {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .logo-img {
            width: 50px;
            height: 50px;
            border-radius: 12px;
            object-fit: cover;
        }

        .brand-name {
            font-weight: 800;
            font-size: 20px;
            letter-spacing: -0.5px;
            color: var(--slate-900);
        }

        .receipt-badge {
            text-align: right;
        }

        .receipt-title {
            font-weight: 800;
            font-size: 24px;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin: 0;
            color: var(--primary);
        }

        .receipt-id {
            font-size: 11px;
            font-weight: 700;
            color: var(--slate-400);
            margin-top: 4px;
        }

        .content {
            padding: 0 40px 40px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
            padding: 30px;
            background: var(--slate-50);
            border-radius: 20px;
        }

        .info-block h4 {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: var(--slate-400);
            margin: 0 0 10px 0;
        }

        .info-block p {
            margin: 4px 0;
            font-size: 14px;
            font-weight: 600;
        }

        .info-block .name {
            font-size: 18px;
            font-weight: 800;
            color: var(--slate-900);
            margin-bottom: 8px;
        }

        .table-section {
            margin-bottom: 40px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            text-align: left;
            padding: 15px 0;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--slate-400);
            border-bottom: 2px solid var(--slate-100);
        }

        td {
            padding: 25px 0;
            border-bottom: 1px solid var(--slate-100);
        }

        .item-desc {
            font-weight: 700;
            font-size: 15px;
        }

        .item-sub {
            font-size: 12px;
            color: var(--slate-400);
            margin-top: 4px;
            font-weight: 500;
        }

        .amount-col {
            text-align: right;
            font-weight: 800;
            font-size: 16px;
        }

        .summary-section {
            display: flex;
            justify-content: flex-end;
        }

        .summary-box {
            width: 300px;
        }

        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
        }

        .summary-row.total {
            border-top: 2px solid var(--slate-900);
            margin-top: 10px;
            padding-top: 20px;
        }

        .total-label {
            font-weight: 800;
            font-size: 14px;
            text-transform: uppercase;
        }

        .total-value {
            font-weight: 900;
            font-size: 24px;
            color: var(--primary);
        }

        .status-seal {
            position: absolute;
            top: 250px;
            right: 80px;
            transform: rotate(-15deg);
            opacity: 0.15;
            pointer-events: none;
        }

        .paid-stamp {
            border: 6px solid #10b981;
            padding: 10px 20px;
            color: #10b981;
            font-weight: 900;
            font-size: 40px;
            border-radius: 12px;
            text-transform: uppercase;
            letter-spacing: 5px;
        }

        .footer {
            background: var(--slate-900);
            color: white;
            padding: 40px;
            text-align: center;
        }

        .footer p {
            margin: 5px 0;
            font-size: 12px;
            opacity: 0.7;
            font-weight: 500;
        }

        .footer .support {
            font-weight: 700;
            opacity: 1;
            margin-top: 15px;
        }

        .btn-print {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: var(--primary);
            color: white;
            border: none;
            padding: 16px 32px;
            border-radius: 16px;
            font-weight: 800;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            cursor: pointer;
            box-shadow: 0 10px 25px rgba(21, 93, 252, 0.4);
            transition: all 0.2s;
            z-index: 100;
        }

        .btn-print:hover {
            transform: translateY(-2px);
            background: var(--primary-dark);
        }

        .btn-print:active {
            transform: scale(0.98);
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .receipt-wrapper {
            animation: fadeIn 0.6s ease-out forwards;
        }
    </style>
</head>
<body>
    <button class="no-print btn-print" onclick="window.print()">Download Receipt</button>

    <div class="receipt-wrapper">
        <div class="header-stripe"></div>
        <div class="header">
            <div class="logo-section">
                <img src="${companyLogo}" alt="Company Logo" class="logo-img">
                <span class="brand-name">${companyName}</span>
            </div>
            <div class="receipt-badge">
                <h1 class="receipt-title">Deposit Receipt</h1>
                <div class="receipt-id">ID: ${receiptNo}</div>
            </div>
        </div>

        <div class="content">
            <div class="status-seal">
                <div class="paid-stamp">PAID</div>
            </div>

            <div class="info-grid">
                <div class="info-block">
                    <h4>Received From</h4>
                    <p class="name">${studentName}</p>
                    <p>${studentEmail}</p>
                    <p>Internal Student ID: ${app.student_id ? app.student_id.substring(0, 12) : 'N/A'}</p>
                </div>
                <div class="info-block" style="text-align: right;">
                    <h4>Payment Details</h4>
                    <p>Date Issued: <strong>${format(new Date(), "PPP")}</strong></p>
                    <p>Method: <strong>Mobile Money / Bank Transfer</strong></p>
                    <p>Status: <strong style="color: #10b981;">COMPLETED</strong></p>
                </div>
            </div>

            <div class="table-section">
                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <div class="item-desc">Professional Internship Access Fee</div>
                                <div class="item-sub">${internshipTitle} - Installment for ${monthName} 2024</div>
                            </td>
                            <td class="amount-col">${amount.toLocaleString()} XAF</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="summary-section">
                <div class="summary-box">
                    <div class="summary-row">
                        <span style="color: var(--slate-400); font-weight: 600;">Subtotal</span>
                        <span style="font-weight: 700;">${amount.toLocaleString()} XAF</span>
                    </div>
                    <div class="summary-row">
                        <span style="color: var(--slate-400); font-weight: 600;">Processing Fee</span>
                        <span style="font-weight: 700;">0 XAF</span>
                    </div>
                    <div class="summary-row total">
                        <span class="total-label">Total Amount Paid</span>
                        <span class="total-value">${amount.toLocaleString()} XAF</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Zigex Connect. All rights reserved.</p>
            <p>This is a digitally generated document and is officially recognized as proof of payment.</p>
            <p class="support">Support: payments@zigexconnect.com</p>
        </div>
    </div>

    <script>
        // Check for auto-print
        window.onload = () => {
            const params = new URLSearchParams(window.location.search);
            if (params.get('print') === 'true') {
                setTimeout(() => window.print(), 1000);
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
        console.error("Receipt API Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
