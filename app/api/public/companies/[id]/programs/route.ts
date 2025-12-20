import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: companyId } = await params;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("programs")
      .select("id,title,created_at,program_picture_url")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching programs for company:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ programs: data || [] });
  } catch (err) {
    console.error("Unexpected error in public programs route", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
