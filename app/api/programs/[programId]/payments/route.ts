import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { programId: string } }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify user is admin for this program
    const { data: program } = await supabase
      .from("programs")
      .select("company_id")
      .eq("id", params.programId)
      .single();

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    const { data: company } = await supabase
      .from("company_profiles")
      .select("id")
      .eq("id", program.company_id)
      .eq("user_id", user.id)
      .single();

    if (!company) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    // Get all applications for this program with payment status
    const { data: applications, error: appError } = await supabase
      .from("Applications")
      .select(
        `id, status, student_id, 
         student_profiles(full_name),
         program_student_payment(is_paid, amount_paid_xaf, payment_date, payment_ref)`
      )
      .eq("program_id", params.programId)
      .eq("status", "accepted");

    if (appError) throw appError;

    // Map to payment data
    const payments = applications.map((app: any) => {
      const payment = app.program_student_payment?.[0];
      return {
        student_id: app.student_id,
        student_name: app.student_profiles?.full_name || "Unknown",
        application_id: app.id,
        is_paid: payment?.is_paid || false,
        amount_paid_xaf: payment?.amount_paid_xaf,
        payment_date: payment?.payment_date,
        payment_ref: payment?.payment_ref,
      };
    });

    return NextResponse.json({ payments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
