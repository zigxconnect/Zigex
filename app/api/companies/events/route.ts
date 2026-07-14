import { NextResponse } from "next/server";
import { createClient, supabaseAdmin } from "@/lib/supabase/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { eventSchema } from "@/lib/validation/event";
import { dispatchBroadcastNotification } from "@/lib/notifications";

/**
 * Handles fetching all events for the authenticated company.
 */
export async function GET(request: Request) {
  const auth = await authMiddleware(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { user, type } = auth;
  if (type !== "company") {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  const { company } = auth;
  if (!company) {
    return NextResponse.json(
      { error: "Company profile not found" },
      { status: 404 }
    );
  }

  // Fetch events from Supabase
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event")
    .select("*")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
  return NextResponse.json(data);
}

/**
 * Handles the creation of a new company event with image upload.
 */
export async function POST(request: Request) {
  const auth = await authMiddleware(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { user, type } = auth;
  if (type !== "company") {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  const { company } = auth;
  if (!company) {
    return NextResponse.json(
      { error: "Company profile not found" },
      { status: 404 }
    );
  }

  try {
    const formData = await request.formData();
    const eventImage = formData.get("event_image") as File | null;
    const dataobject = Object.fromEntries(formData.entries());

    if (!eventImage) {
      return NextResponse.json(
        { error: "Event image is required" },
        { status: 400 }
      );
    }
    if (!dataobject.title || typeof dataobject.title !== "string") {
      return NextResponse.json(
        { error: "Event title is required" },
        { status: 400 }
      );
    }

    const sanitizePathComponent = (str: string) =>
      str.replace(/[^a-zA-Z0-9_-]/g, "_");
    const imageExt = eventImage.name.split(".").pop();
    const imageName = `${sanitizePathComponent(dataobject.title)}-${Date.now()}.${imageExt}`;
    const imagePath = `${sanitizePathComponent(company.company_name)}/events/${imageName}`;

    const supabase = await createClient();
    const { error: uploadError } = await supabaseAdmin.storage
      .from("company-assets")
      .upload(imagePath, eventImage, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload event image" },
        { status: 500 }
      );
    }

    const { data: imageData } = supabaseAdmin.storage
      .from("company-assets")
      .getPublicUrl(imagePath);
    const eventImageUrl = imageData.publicUrl;

    const validatedData = eventSchema.parse({
      ...dataobject,
      event_picture_url: eventImageUrl,
      company_id: company.id,
    });

    const { data, error } = await supabase
      .from("event")
      .insert([validatedData])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      await supabaseAdmin.storage.from("company-assets").remove([imagePath]);
      return NextResponse.json(
        { error: "Failed to create event" },
        { status: 500 }
      );
    }

    // --- BROADCAST NOTIFICATIONS ---
    try {
      await dispatchBroadcastNotification({
        title: data.title,
        message: `A new event "${data.title}" has been posted.`,
        type: 'event',
        referenceId: data.id,
        link: `/events/${data.id}`,
        location: data.location || 'Remote'
      });
      console.log("[EVENT_NOTIFY] Broadcast dispatched successfully.");
    } catch (notifErr) {
      console.error("[EVENT_NOTIFY] Failed to dispatch broadcast:", notifErr);
    }
    // ---------------------------------
    // ---------------------------------------------------------------

    return NextResponse.json(data, { status: 201 });
  } catch (validationError) {
    console.error("Validation error:", validationError);
    return NextResponse.json(
      { error: "Validation error", details: validationError },
      { status: 400 }
    );
  }
}

/**
 * Handles the deletion of a company event.
 */
export async function DELETE(request: Request) {
  const auth = await authMiddleware(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { user, type } = auth;
  if (type !== "company") {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  const { company } = auth;
  if (!company) {
    return NextResponse.json(
      { error: "Company profile not found" },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Event ID is required for deletion" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: existingEvent, error: fetchError } = await supabase
      .from("event")
      .select("id, event_picture_url")
      .eq("id", id)
      .eq("company_id", company.id)
      .single();

    if (fetchError || !existingEvent) {
      return NextResponse.json(
        {
          error: "Event not found or you do not have permission to delete it.",
        },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from("event")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Supabase Delete Error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete event from database." },
        { status: 500 }
      );
    }

    // --- APPLIED DIFF: More robust image path parsing and deletion ---
    if (existingEvent.event_picture_url) {
      try {
        const url = new URL(existingEvent.event_picture_url);
        // This regex reliably extracts the path after the bucket name
        const pathMatch = url.pathname.match(
          /\/storage\/v1\/object\/public\/company-assets\/(.+)$/
        );
        const imagePath = pathMatch ? pathMatch[1] : null;

        if (imagePath) {
          // decodeURIComponent is still needed as the path can contain encoded characters
          const { error: storageError } = await supabaseAdmin.storage
            .from("company-assets")
            .remove([decodeURIComponent(imagePath)]);

          if (storageError) {
            console.warn(
              `DB record deleted, but failed to delete image from storage: ${imagePath}`,
              storageError
            );
          }
        }
      } catch (parseError) {
        // This catch block prevents the function from crashing if the URL is malformed
        console.warn(
          `DB record deleted, but failed to parse image URL for cleanup: ${existingEvent.event_picture_url}`,
          parseError
        );
      }
    }
    // --- END OF APPLIED DIFF ---

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE Event Error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
