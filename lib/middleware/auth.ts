import { NextResponse } from "next/server";
import { supabaseAdmin } from "../supabase/server";



export async function authMiddleware(request: Request) {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader ? authHeader.split(" ")[1] : null;

    if(!token) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { data: profile, error: profileError } = await supabaseAdmin
        .from("student_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (profileError || !profile) {
        const { data: companyProfile, error: companyError } = await supabaseAdmin
            .from("company_profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();
        if (companyError || !companyProfile) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        return { user, company: companyProfile, type: "company" };
    }

    return {user, student: profile, type: "student" };
}