import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { amount, reason, pin } = await req.json();

        // 1. Authenticate user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // 2. PIN Verification (Sensitive)
        const securePin = process.env.ADMIN_FINANCE_PIN;
        if (!securePin || pin !== securePin) {
            return NextResponse.json({ error: "Invalid Authorization PIN" }, { status: 403 });
        }

        // 3. Get company profile context
        const { data: company } = await supabase
            .from("company_profiles")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (!company) return NextResponse.json({ error: "Company profile missing" }, { status: 404 });

        // 4. Record Expense / Withdrawal
        const { data: expense, error } = await supabase
            .from("expenses")
            .insert({
                company_id: company.id,
                amount: parseInt(amount),
                reason,
                status: 'completed'
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, expense }, { status: 200 });
    } catch (error: any) {
        console.error("[WITHDRAWAL_API_ERROR]", error);
        return NextResponse.json({ error: error.message || "Financial transaction failed" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data: company } = await supabase
            .from("company_profiles")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (!company) return NextResponse.json({ error: "Company profile missing" }, { status: 404 });

        // Fetch latest 50 expenses
        const { data: expenses, error } = await supabase
            .from("expenses")
            .select("*")
            .eq("company_id", company.id)
            .order("created_at", { ascending: false })
            .limit(50);

        if (error) throw error;

        return NextResponse.json({ expenses }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: "Audit retrieval failed" }, { status: 500 });
    }
}
