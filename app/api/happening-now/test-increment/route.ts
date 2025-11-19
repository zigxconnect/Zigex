import { createClient } from "@/lib/supabase/server";

/**
 * Test endpoint to increment view count
 * GET /api/happening-now/test-increment?id=[item-id]
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("id");

    if (!itemId) {
      return Response.json(
        { error: "Missing item ID parameter" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    console.log(`🧪 Testing increment for item: ${itemId}`);

    // Fetch current data
    const { data: currentData, error: fetchError } = await supabase
      .from("happening_now")
      .select("id, view_count, company")
      .eq("id", itemId)
      .single();

    if (fetchError) {
      console.error("❌ Fetch error:", fetchError);
      return Response.json({ error: fetchError.message }, { status: 500 });
    }

    if (!currentData) {
      return Response.json(
        { error: "Item not found in database" },
        { status: 404 }
      );
    }

    console.log(`📊 Current view count: ${currentData.view_count}`);
    console.log(`📝 Company: ${currentData.company}`);

    const newViewCount = (currentData.view_count || 0) + 1;

    // Attempt increment
    const { error: updateError } = await supabase
      .from("happening_now")
      .update({ view_count: newViewCount })
      .eq("id", itemId);

    if (updateError) {
      console.error("❌ Update error:", updateError);
      return Response.json({ error: updateError.message }, { status: 500 });
    }

    // Verify the update worked
    const { data: verifyData } = await supabase
      .from("happening_now")
      .select("view_count")
      .eq("id", itemId)
      .single();

    console.log(`✅ Update successful! New count: ${verifyData?.view_count}`);

    return Response.json({
      success: true,
      itemId,
      company: currentData.company,
      oldViewCount: currentData.view_count,
      newViewCount: verifyData?.view_count,
      message: "View count incremented successfully",
    });
  } catch (error) {
    console.error("❌ Exception:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
