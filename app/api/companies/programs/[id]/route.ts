import { NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
/**
 * Function to get a unique program posted by the authenticated company
 * GET /api/companies/programs/:id (Authenticated: returns a single program for the authenticated company)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const auth = await authMiddleware(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { type, company } = auth;
  if (type !== "company") {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  if (!company) {
    return NextResponse.json(
      { error: "Company profile not found" },
      { status: 404 }
    );
  }
  const { data, error } = await supabaseAdmin
    .from("programs")
    .select("*")
    .eq("company_id", company.id)
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Program not found or does not belong to this company" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
