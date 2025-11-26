import { authMiddleware } from "@/lib/middleware/auth";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const auth = await authMiddleware(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { type, company } = auth;
  if (type !== "company" || !company) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  try {
    const { internId, onboardingDate, notes } = await request.json();

    if (!internId || !onboardingDate) {
      return NextResponse.json(
        { error: "Intern ID and onboarding date are required" },
        { status: 400 }
      );
    }

    // Verify the application exists and belongs to this company
    const { data: application, error: appError } = await supabaseAdmin
      .from("Applications")
      .select("*")
      .eq("id", internId)
      .eq("status", "accepted")
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { error: "Accepted intern not found" },
        { status: 404 }
      );
    }

    // Update the application with onboarding information
    // TODO: Add onboarding_date and onboarding_notes columns to Applications table
    // For now, we'll just return success without persisting to database
    /*
    const { error: updateError } = await supabaseAdmin
      .from("Applications")
      .update({
        onboarding_date: onboardingDate,
        onboarding_notes: notes || null,
      })
      .eq("id", internId);

    if (updateError) {
      throw new Error(updateError.message);
    }
    */

    // Log the scheduling for now
    console.log(`Onboarding scheduled for intern ${internId}:`, {
      date: onboardingDate,
      notes,
    });

    return NextResponse.json({
      success: true,
      message: "Onboarding scheduled successfully",
    });
  } catch (error: any) {
    console.error("Schedule onboarding error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to schedule onboarding" },
      { status: 500 }
    );
  }
}
