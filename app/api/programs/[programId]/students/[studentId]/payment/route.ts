import { NextRequest, NextResponse } from "next/server";
import { createClient, supabaseAdmin } from "@/lib/supabase/server";
import { sendPaymentReceiptEmail } from "@/lib/email";

// Get payment status for a student in a program
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ programId: string; studentId: string }> }
) {
  try {
    const { programId, studentId } = await params;
    const supabase = await createClient();

    const { data: payment, error } = await supabase
      .from("program_student_payment")
      .select("*")
      .eq("program_id", programId)
      .eq("student_id", studentId)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows found

    return NextResponse.json(
      {
        is_paid: payment?.is_paid || false,
        payment_date: payment?.payment_date,
        amount_paid_xaf: payment?.amount_paid_xaf,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching payment status:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment status" },
      { status: 500 }
    );
  }
}

// Admin updates payment status
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ programId: string; studentId: string }> }
) {
  try {
    const { programId, studentId } = await params;
    const supabase = await createClient();
    const {
      amount_paid_xaf,
      payment_date,
      payment_ref,
      notes,
      is_paid,
      applicationId,
    } = await req.json();

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
      .eq("id", programId)
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
        { error: "Not authorized to update payment" },
        { status: 403 }
      );
    }

    // Upsert payment record
    const { data, error } = await supabase
      .from("program_student_payment")
      .upsert({
        program_id: programId,
        student_id: studentId,
        application_id: applicationId,
        amount_paid_xaf,
        payment_date,
        payment_ref,
        notes,
        is_paid,
        processed_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Sync payment status to Applications table for easier querying in other parts of the app
    if (applicationId) {
      await supabaseAdmin
        .from("Applications")
        .update({ payment_completed: is_paid })
        .eq("id", applicationId);
    }

    // Send email receipt if payment is marked as paid
    if (is_paid === true) {
      try {
        // 1. Get Student Info (Name and Email)
        const { data: studentProfile } = await supabaseAdmin
          .from("student_profiles")
          .select("full_name, user_id")
          .eq("id", studentId)
          .single();

        if (studentProfile?.user_id) {
          const { data: userData } = await supabaseAdmin.auth.admin.getUserById(studentProfile.user_id);
          const studentEmail = userData?.user?.email;

          // 2. Get Program and Company Info
          const { data: programData } = await supabaseAdmin
            .from("programs")
            .select("title, company_profiles(company_name, logo_url, address)")
            .eq("id", programId)
            .single();

          if (studentEmail && programData) {
            // Determine which month the receipt is for (from notes or current month)
            const currentMonth = new Date(payment_date || new Date()).toLocaleString('default', { month: 'long' });

            const company = (programData as any)?.company_profiles;

            await sendPaymentReceiptEmail({
              email: studentEmail,
              name: studentProfile.full_name,
              programTitle: programData.title,
              amount: amount_paid_xaf,
              date: payment_date || new Date().toISOString(),
              ref: payment_ref || `ZGX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
              month: notes?.includes('Month') ? notes : currentMonth,
              companyName: company?.company_name,
              companyLogo: company?.logo_url,
              companyAddress: company?.address
            });
            console.log(`[PAYMENT] Receipt sent to ${studentEmail} for ${programData.title}`);
          }
        }
      } catch (err) {
        console.error("Error sending payment receipt email:", err);
        // We don't fail the whole request if the email fails
      }
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    );
  }
}
