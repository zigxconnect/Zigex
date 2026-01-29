import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const { programId } = await params;
    const supabase = await createClient();
    const { title, moduleNumber, description, tutors } = await req.json();

    // Verify user is admin for this program
    const { data: program } = await supabase
      .from("programs")
      .select("company_id")
      .eq("id", programId)
      .single();

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    // Create module in program_content table
    const { data, error } = await supabase
      .from("program_content")
      .insert({
        program_id: programId,
        content_type: "module",
        title,
        module_number: moduleNumber,
        description,
        tutors: tutors || [],
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating module:", error);
    return NextResponse.json(
      { error: "Failed to create module" },
      { status: 500 }
    );
  }
}
