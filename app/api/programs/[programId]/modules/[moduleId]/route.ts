import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { programId: string; moduleId: string } }
) {
  try {
    const supabase = await createClient();
    const { title, moduleNumber, description, tutors } = await req.json();

    const { moduleId } = params;

    // Update module in program_content table
    const { data, error } = await supabase
      .from("program_content")
      .update({
        title,
        module_number: moduleNumber,
        description,
        tutors,
        updated_at: new Date().toISOString(),
      })
      .eq("id", moduleId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error updating module:", error);
    return NextResponse.json(
      { error: "Failed to update module" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { programId: string; moduleId: string } }
) {
  try {
    const supabase = await createClient();

    const { moduleId } = params;

    // Delete module from program_content table
    const { error } = await supabase
      .from("program_content")
      .delete()
      .eq("id", moduleId);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting module:", error);
    return NextResponse.json(
      { error: "Failed to delete module" },
      { status: 500 }
    );
  }
}
