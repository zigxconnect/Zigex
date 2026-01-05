import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { programId: string } }
) {
  try {
    const supabase = await createClient();
    const programId = params.programId;

    // Fetch all content for the program (lessons + resources)
    const { data: content, error } = await supabase
      .from("program_content")
      .select("*")
      .eq("program_id", programId)
      .order("display_order", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ content }, { status: 200 });
  } catch (error) {
    console.error("Error fetching program content:", error);
    return NextResponse.json(
      { error: "Failed to fetch program content" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { programId: string } }
) {
  try {
    const supabase = await createClient();
    const { title, content_type, description, content_url, resource_type } =
      await req.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const programId = params.programId;

    // Verify user is admin for this program
    const { data: program } = await supabase
      .from("programs")
      .select("company_id")
      .eq("id", programId)
      .single();

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    // Verify user is company admin
    const { data: company } = await supabase
      .from("company_profiles")
      .select("id")
      .eq("id", program.company_id)
      .eq("user_id", user.id)
      .single();

    if (!company) {
      return NextResponse.json(
        { error: "Not authorized to add content" },
        { status: 403 }
      );
    }

    // Create content
    const { data, error } = await supabase
      .from("program_content")
      .insert({
        program_id: programId,
        title,
        content_type,
        description,
        content_url,
        resource_type,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating content:", error);
    return NextResponse.json(
      { error: "Failed to create content" },
      { status: 500 }
    );
  }
}
