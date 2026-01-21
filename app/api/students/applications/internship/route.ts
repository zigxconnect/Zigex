import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const internshipApplicationSchema = z.object({
  internship_id: z.string().uuid(),
  full_name: z.string().min(2),
  school: z.string().min(2),
  school_level: z.string(),
  date_of_birth: z.string(), // ISO date string
  address: z.string().min(5),
  domain: z.string(),
  duration: z.string(),
  experience_level: z.string(),
  reason: z.string().min(10),
  expectations: z.string().min(10),
  is_paid_acknowledgement: z.boolean().refine((val) => val === true, {
    message: "You must acknowledge that this is a paid internship.",
  }),
  comment: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate
    const validationResult = internshipApplicationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation Error", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("internship_applications")
      .insert({
        ...validationResult.data,
        student_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error("Submission Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Internal Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}