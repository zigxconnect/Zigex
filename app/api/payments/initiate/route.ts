import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      provider,
      phoneNumber,
      amount,
      currency,
      programTitle,
    } = await req.json();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Validate payment details
    if (!provider || !phoneNumber || !amount) {
      return NextResponse.json(
        { error: "Missing payment details" },
        { status: 400 }
      );
    }

    // Create payment record
    const { data: payment, error } = await supabase
      .from("payments")
      .insert({
        student_id: user.id,
        amount_xaf: amount,
        currency: currency || "XAF",
        payment_method: "mobile_money",
        provider,
        status: "pending",
        metadata: {
          phoneNumber,
          programTitle,
        },
      })
      .select()
      .single();

    if (error) throw error;

    // TODO: Integrate with actual mobile money API
    // For now, we'll simulate the payment processing
    // In production, you'd call MTN, Orange, or Nexttel API here

    // Simulate successful payment after 2 seconds
    setTimeout(async () => {
      await supabase
        .from("payments")
        .update({
          status: "completed",
          completed_date: new Date().toISOString(),
          transaction_id: `TXN-${Date.now()}`,
        })
        .eq("id", payment.id);
    }, 2000);

    return NextResponse.json(
      {
        success: true,
        paymentId: payment.id,
        message: "Payment initiated. Please check your phone.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { error: "Payment processing failed" },
      { status: 500 }
    );
  }
}
