import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabase/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { eventSchema } from "@/lib/validation/event";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const auth = await authMiddleware(request);
  if (auth instanceof NextResponse) return auth;

  if (auth.type !== "company" || !auth.company) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }


  const { data: event, error } = await supabaseAdmin
    .from("event")
    .select("*")
    .eq("id", id)
    .eq("company_id", auth.company.id)
    .single();

  if (error) {
    return NextResponse.json(
      { error: `Event with ID ${id} not found.` },
      { status: 404 }
    );
  }

  return NextResponse.json(event);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const auth = await authMiddleware(request);
  if (auth instanceof NextResponse) return auth;

  const { type, company } = auth;

  if (type !== "company" || !company) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  try {
    // 1. Verify ownership before doing anything
    const { data: existingEvent, error: fetchError } = await supabaseAdmin
      .from("event")
      .select("id, event_picture_url")
      .eq("id", id)
      .eq("company_id", company.id)
      .single();

    if (fetchError || !existingEvent) {
      return NextResponse.json(
        { error: "Event not found or you do not have permission to edit it." },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const dataObject = Object.fromEntries(formData.entries());
    const eventImage = formData.get("event_image") as File | null;

    let eventImageUrl = existingEvent.event_picture_url;

    // 2. If a new image is provided, upload it and update the URL
    if (eventImage) {
      const imageExt = eventImage.name.split(".").pop();
      const imageName = `${dataObject.title || "event"
        }-${Date.now()}.${imageExt}`;
      const imagePath = `${company.company_name}/events/${imageName}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("company-assets")
        .upload(imagePath, eventImage, { upsert: true });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        throw new Error("Failed to upload new event image.");
      }

      // If upload is successful, get the new public URL
      const { data: newImageData } = supabaseAdmin.storage
        .from("company-assets")
        .getPublicUrl(imagePath);
      eventImageUrl = newImageData.publicUrl;
    }

    // 3. Validate the text fields for the update
    const validatedUpdates = eventSchema.partial().parse({
      ...dataObject,
      event_picture_url: eventImageUrl,
    });

    // 4. Perform the update in the database
    const { data: updatedEvent, error: updateError } = await supabaseAdmin
      .from("event")
      .update(validatedUpdates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json(updatedEvent);
  } catch (err: any) {
    console.error("PATCH Event Error:", err);
    if (err.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: err.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: err.message || "An internal server error occurred." },
      { status: 500 }
    );
  }
}

// DELETE Handler - Remove an event

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const auth = await authMiddleware(request);
  if (auth instanceof NextResponse) return auth;

  const { type, company } = auth;

  if (type !== "company" || !company) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  // 1. Verify ownership and get the image URL before deleting
  const { data: existingEvent, error: fetchError } = await supabaseAdmin
    .from("event")
    .select("id, event_picture_url")
    .eq("id", id)
    .eq("company_id", company.id)
    .single();

  if (fetchError || !existingEvent) {
    return NextResponse.json(
      { error: "Event not found or you do not have permission to delete it." },
      { status: 404 }
    );
  }

  // 2. Perform the database deletion first
  const { error: deleteError } = await supabaseAdmin
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

  // 3. If DB deletion is successful, delete the associated image from storage
  if (existingEvent.event_picture_url) {
    const imagePath =
      existingEvent.event_picture_url.split("/company-assets/")[1];
    if (imagePath) {
      const { error: storageError } = await supabaseAdmin.storage
        .from("company-assets")
        .remove([imagePath]);
      if (storageError) {
        // Log a warning but don't fail the request, as the DB entry is gone.
        console.warn(
          `DB record deleted, but failed to delete image from storage: ${imagePath}`,
          storageError
        );
      }
    }
  }

  return new NextResponse(null, { status: 204 });
}
