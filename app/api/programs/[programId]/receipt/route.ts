import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ programId: string }> }
) {
    try {
        const { programId } = await params;
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // 1. Get student profile
        const { data: student } = await supabase
            .from("student_profiles")
            .select("id, full_name")
            .eq("user_id", user.id)
            .single();

        if (!student) return new NextResponse("Profile not found", { status: 404 });

        // 2. Get application and payment
        const { data: application } = await supabase
            .from("Applications")
            .select(`
                *,
                program:programs (
                    title,
                    price_xaf,
                    company_profiles(company_name, logo_url)
                )
            `)
            .eq("program_id", programId)
            .eq("student_id", student.id)
            .single();

        if (!application || !application.payment_completed) {
            return new NextResponse("Payment not found or not completed", { status: 403 });
        }

        const { data: payment } = await supabase
            .from("program_student_payment")
            .select("*")
            .eq("application_id", application.id)
            .maybeSingle();

        const program = Array.isArray(application.program) ? application.program[0] : application.program;
        const company = (program as any)?.company_profiles;
        const companyName = company?.company_name || "SEED INC";
        const companyLogo = company?.logo_url || "/seedLogo.png";

        const name = student.full_name;
        const programTitle = program?.title || "Program";
        const date = payment?.payment_date || payment?.created_at || new Date().toISOString();
        const ref = payment?.payment_ref || `ZGX-APP-${application.id.substring(0, 6).toUpperCase()}`;

        // Use 10,000 for Weekend of Code if requested, otherwise use program price or payment amount
        let amount = payment?.amount_paid_xaf || program?.price_xaf || 0;
        if (programTitle.toLowerCase().includes("weekend of code")) {
            amount = 10000;
        }

        const month = payment?.notes?.includes('Month')
            ? payment.notes
            : new Date(date).toLocaleString('default', { month: 'long' });

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt - ${programTitle}</title>
    <style>
        @media print {
            @page { 
                margin: 0; 
                size: auto;
            }
            body { 
                background: white !important; 
                padding: 0 !important; 
                margin: 0 !important;
            }
            .no-print { display: none !important; }
            .receipt-card { 
                border: none !important; 
                box-shadow: none !important; 
                margin: 0 auto !important; 
                max-width: 100% !important;
                padding: 40px !important;
            }
            .footer {
                padding-bottom: 50px !important;
            }
        }
        body { 
            background: #f8fafc; 
            padding: 50px 20px; 
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            color: #1e293b;
        }
        .receipt-card { 
            max-width: 550px; 
            margin: 0 auto; 
            background: #ffffff; 
            border-radius: 24px; 
            overflow: hidden;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .receipt-header {
            background: #000000;
            padding: 40px;
            text-align: center;
            position: relative;
        }
        .logo {
            height: 60px;
            margin-bottom: 20px;
        }
        .header-title {
            color: white;
            margin: 0;
            font-size: 24px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .receipt-body {
            padding: 50px;
            position: relative;
        }
        .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 2px dashed #e2e8f0;
        }
        .label {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 800;
            margin-bottom: 6px;
        }
        .value {
            font-size: 15px;
            color: #0f172a;
            font-weight: 700;
        }
        .item-box {
            background: #f1f5f9;
            padding: 24px;
            border-radius: 16px;
            margin-bottom: 40px;
        }
        .total-section {
            text-align: right;
            padding-top: 20px;
        }
        .total-amount {
            font-size: 32px;
            font-weight: 950;
            color: #000000;
            margin-top: 8px;
        }
        .stamp-container {
            text-align: center;
            margin-top: 40px;
        }
        .stamp {
            display: inline-block;
            border: 4px solid #10b981;
            color: #10b981;
            padding: 8px 24px;
            border-radius: 8px;
            font-weight: 900;
            font-size: 18px;
            text-transform: uppercase;
            transform: rotate(-10deg);
        }
        .footer {
            text-align: center;
            padding: 40px 20px;
            font-size: 12px;
            color: #94a3b8;
        }
        .btn {
            background: #000000;
            color: white;
            border: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: all 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>
<body>
    <div class="no-print" style="max-width: 550px; margin: 0 auto 20px; text-align: right;">
        <button onclick="window.print()" class="btn">
            Download / Print PDF
        </button>
    </div>

    <div class="receipt-card">
        <div class="receipt-header">
            <img src="${companyLogo}" alt="${companyName} Logo" class="logo">
            <h1 class="header-title">Official Receipt</h1>
        </div>
        
        <div class="receipt-body">
            <div class="meta-grid">
                <div>
                    <div class="label">Candidate Name</div>
                    <div class="value">${name}</div>
                </div>
                <div style="text-align: right;">
                    <div class="label">Date of Payment</div>
                    <div class="value">${new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                </div>
            </div>

            <div class="meta-grid" style="border: none; margin-bottom: 20px;">
                <div>
                    <div class="label">Transaction Ref</div>
                    <div class="value" style="font-family: monospace; font-size: 13px;">${ref}</div>
                </div>
                <div style="text-align: right;">
                    <div class="label">Payment Status</div>
                    <div class="value" style="color: #10b981;">COMPLETED</div>
                </div>
            </div>

            <div class="item-box">
                <div class="label">Description</div>
                <div style="font-size: 18px; font-weight: 800; color: #000000; margin: 8px 0;">${programTitle}</div>
                <div style="color: #64748b; font-size: 14px; font-weight: 500;">
                    ${month ? `Current Term: ${month}` : 'Full Program Enrollment'}
                </div>
            </div>

            <div class="total-section">
                <div class="label">Net Amount Paid</div>
                <div class="total-amount">
                    ${amount.toLocaleString()} <span style="font-size: 16px; font-weight: 600; color: #64748b;">XAF</span>
                </div>
            </div>

            <div class="stamp-container">
                <div class="stamp">SUCCESSFULLY VERIFIED</div>
            </div>
        </div>
    </div>
    
    <div class="footer">
        <p style="font-weight: 700; color: #64748b; margin-bottom: 8px;">${companyName} • GLOBAL TECH CAREERS</p>
        <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        <p>Bamenda, Cameroon • zigexconnect.com</p>
    </div>

    <script>
        // Auto trigger print
        window.onload = () => {
            setTimeout(() => {
                window.print();
            }, 500);
        };
    </script>
</body>
</html>
        `;

        return new NextResponse(html, {
            headers: {
                "Content-Type": "text/html",
                "Cache-Control": "no-store, max-age=0",
            },
        });

    } catch (error) {
        console.error("Receipt generation error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
