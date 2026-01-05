import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get company profile
    const { data: company } = await supabase
      .from("company_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!company) {
      return NextResponse.json(
        { error: "No company profile found" },
        { status: 404 }
      );
    }

    // Get programs for this company
    const { data: programs, error } = await supabase
      .from("programs")
      .select("id, title, is_paid, price_xaf")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ programs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 }
    );
  }
}
