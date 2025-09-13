import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { eventSchema } from "@/lib/validation/event";
// import { v4 as uuidv4 } from 'uuid';
// import { GoogleSpreadsheet } from 'google-spreadsheet';
// import { JWT } from 'google-auth-library';

// Initialize Google Sheets connection

/**
 * @swagger
 * /api/companies/events:
 *   post:
 *     summary: Add a new event for a company with image upload
 *     description: Create a new event (conference, workshop, webinar, networking, hackathon) including an optional event picture. Data is stored in a spreadsheet.
 *     tags:
 *          - Company Events
 *     requestBody:
 *             required:
 *               - title
 *               - description
 *               - event_type
 *               - start_date
 *               - end_date
 *               - location
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Bad request (validation error)
 *       403:
 *         description: Unauthorized access
 *       404:
 *         description: Company profile not found
 *       500:
 *         description: Internal server error
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

/*
Handles the creation of a new company event with image upload.

Usage:
Send a POST request to /api/companies/events with multipart/form-data encoding.

Required Form Fields:
- title: The title of the event (string)
- description: A description of the event (string)
- event_type: The type of event (e.g., conference, workshop, webinar, networking, hackathon) (string)
- start_date: The start date of the event (ISO 8601 string)
- end_date: The end date of the event (ISO 8601 string)
- location: The location of the event (string)
- event_image: The image file for the event (File)

Authentication:
- The request must be authenticated as a company user. Unauthorized or non-company users will receive a 403 error.

Behavior:
- Validates the form data using the eventSchema.
- Uploads the provided image to Supabase Storage under the company's assets.
- Stores the event data, including the public URL of the uploaded image, in the Supabase event table.
- Returns the created event object on success.

Responses:
- 201: Event created successfully. Returns the event object.
- 400: Validation error or missing required fields.
- 403: Unauthorized access (not a company user).
- 404: Company profile not found.
- 500: Internal server error (e.g., failed image upload or database error).

@param request - The incoming HTTP request containing form data for the new event.
@returns A JSON response with the created event or an error message.
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

  const formData = await request.formData();

  //Extract image file
  const eventImage = formData.get("event_image") as File | null;

  // Validate other form fields by converting FormData to an object then use the eventSchema to validate
  const dataobject = Object.fromEntries(formData.entries());

  //Ensure image is present
  if (!eventImage) {
    return NextResponse.json(
      { error: "Event image is required" },
      { status: 400 }
    );
  }

  //uplaod image to supabase storage and get the public URL
  //Set the image name and filepath. file path is company_name/events/event_title-timestamp.ext
  const imageExt = eventImage.name.split(".").pop();
  const imageName = `${dataobject.title}-${Date.now()}.${imageExt}`;
  const imagePath = `${company.company_name}/events/${imageName}`;

  //Upload the image to company-assets bucket in supabase storage
  const { error: uploadError } = await supabaseAdmin.storage
    .from("company-assets")
    .upload(imagePath, eventImage, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Supabase storage upload error:", uploadError);
    return NextResponse.json(
      { error: "Failed to upload event image" },
      { status: 500 }
    );
  }

  //Get the public URL of the uploaded image
  const { data: imageData } = supabaseAdmin.storage
    .from("company-assets")
    .getPublicUrl(imagePath);
  const eventImageUrl = imageData.publicUrl;

  // Validate other form fields
  try {
    const validatedData = eventSchema.parse({
      ...dataobject,
      event_picture_url: eventImageUrl,
      company_id: company.id,
    });

    // Insert the new event into Supabase
    const { data, error } = await supabaseAdmin
      .from("event")
      .insert([validatedData])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to create event" },
        { status: 500 }
      );
    }
    return NextResponse.json(data, { status: 201 });
  } catch (validationError) {
    console.error("Validation error:", validationError);
    return NextResponse.json(
      { error: "Validation error", details: validationError },
      { status: 400 }
    );
  }
}
