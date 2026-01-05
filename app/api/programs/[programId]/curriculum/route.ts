import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const { programId } = await params;
    const supabase = await createClient();

    // Fetch curriculum modules from program_content table
    const { data, error } = await supabase
      .from("program_content")
      .select("*")
      .eq("program_id", programId)
      .in("content_type", ["module", "lesson"])
      .order("module_number", { ascending: true });

    if (error) throw error;

    // Structure modules locally (keeping it simple)
    const modules = data
      ?.filter((item) => item.content_type === "module")
      .map((module) => ({
        id: module.id,
        title: module.title,
        moduleNumber: module.module_number || 1,
        description: module.description,
        tutors: module.tutors || [],
      })) || [];

    return NextResponse.json({ modules }, { status: 200 });
  } catch (error) {
    console.error("Error fetching curriculum:", error);
    return NextResponse.json(
      { error: "Failed to fetch curriculum" },
      { status: 500 }
    );
  }
}
