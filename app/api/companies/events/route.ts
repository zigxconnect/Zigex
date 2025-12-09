import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { eventSchema } from "@/lib/validation/event";

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
  const { data, error } = await supabaseAdmin
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

    const { data, error } = await supabaseAdmin
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

    // --- NOTIFICATION & EMAIL LOGIC ---
    try {
        // 1. Get subscribed users
        const { data: users, error: userError } = await supabaseAdmin.rpc("get_subscribed_emails");
        
        let recipients = users || [];
        if (userError) {
            console.error("RPC get_subscribed_emails failed:", userError);
        }

        if (recipients.length > 0) {
            const recipientEmails = recipients.map((u: any) => u.email).filter(Boolean);
            
            // 2. Send Email (Batch BCC)
            if (process.env.RESEND_API_KEY) {
                const { Resend } = await import("resend");
                const resend = new Resend(process.env.RESEND_API_KEY);
                const { NewPostEmail } = await import("@/emails/NewPostEmail");

                // Use "notifications@futureprospect.online" as 'to' and everyone else as 'bcc'
                await resend.emails.send({
                    from: "FutureProspect <notifications@futureprospect.online>",
                    to: "notifications@futureprospect.online", 
                    bcc: recipientEmails,
                    subject: `New Event Posted: ${data.title}`,
                    react: NewPostEmail({
                        postTitle: data.title,
                        postType: "Event",
                        postLocation: data.location || "Online", // Fallback if location missing
                        viewPostUrl: `https://futureprospect.online/events/${data.id}`,
                        companyLogoUrl: "https://tmvipinvvhgklmqwvows.supabase.co/storage/v1/object/public/company-assets/Seed%20Company/events/SEED%20community%20Challenge-1757769838240.jpg", 
                        managePreferencesUrl: "https://futureprospect.online/profile/notifications",
                        postedDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
                    }),
                });
            }

            // 3. Create Notifications in DB
            // Deduplicate recipients to ensure only one notification per user
            const uniqueRecipients = Array.from(new Map(recipients.map((item:any) => [item.id || item.user_id, item])).values());

            const notifications = uniqueRecipients.map((u: any) => ({
                user_id: u.id || u.user_id, 
                title: "New Event Posted!",
                message: `A new event "${data.title}" is available.`,
                type: "event",
                reference_id: data.id,
            }));

            const { error: notifError } = await supabaseAdmin.from("notifications").insert(notifications);
            if (notifError) console.error("Failed to create notifications:", notifError);
        }
    } catch (innerErr) {
        console.error("Async notification error:", innerErr);
    }
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

    const { data: existingEvent, error: fetchError } = await supabaseAdmin
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
