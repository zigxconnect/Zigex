import { NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { baseCompanySchema } from "@/lib/validation/company";

/**
 * Handles GET request to fetch the current company's profile.
 */
export async function GET(request: Request) {
  const auth = await authMiddleware(request);
  if (auth instanceof NextResponse) return auth;

  const { type, company } = auth;
  if (type !== "company" || !company) {
    return NextResponse.json(
      { error: "Company profile not found or unauthorized" },
      { status: 404 }
    );
  }

  return NextResponse.json(company);
}

/**
 * Handles PATCH request to update the current company's profile.
 * This is the function that was missing from this route.
 */
export async function PATCH(request: Request) {
  const auth = await authMiddleware(request);
  if (auth instanceof NextResponse) return auth;

  const { type, company } = auth;
  if (type !== "company" || !company) {
    return NextResponse.json(
      { error: "Company profile not found or unauthorized" },
      { status: 404 }
    );
  }

  const updates = await request.json();

  // Validate the updates against a partial version of the schema.
  const validationResult = baseCompanySchema.partial().safeParse(updates);
  if (!validationResult.success) {
    return NextResponse.json(
      {
        error: "Invalid data provided.",
        details: validationResult.error.flatten(),
      },
      { status: 400 }
    );
  }

  // Update the company profile in the database using the ID from the authenticated session.
  const { data, error } = await supabaseAdmin
    .from("company_profiles")
    .update(validationResult.data)
    .eq("id", company.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating company profile:", error);
    return NextResponse.json(
      { error: "Failed to update company profile." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Company profile updated successfully",
    data,
  });
}
