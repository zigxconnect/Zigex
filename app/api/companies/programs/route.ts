import { createClient, supabaseAdmin } from "@/lib/supabase/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { programSchema } from "@/lib/validation/program";
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";
import { dispatchBroadcastNotification } from "@/lib/notifications";

/*
 * Function to handle CRUD operations for company programs
 * GET /api/companies/programs (Authenticated: returns programs for the authenticated company)
 * POST /api/companies/programs (Authenticated: create a new program)
 * PATCH /api/companies/programs (Authenticated: update an existing program)
 * DELETE /api/companies/programs (Authenticated: delete a program)
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

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("company_id", company.id);

  if (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

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
    const programPicture = formData.get("program_picture") as File | null;

    // Extract other fields, handling potential comma-separated strings for arrays
    const rawData: { [key: string]: any } = {};
    for (const [key, value] of formData.entries()) {
      if (key === "required_skills" && typeof value === "string") {
        rawData[key] = value
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s);
      } else if (key !== "program_picture") {
        rawData[key] = value;
      }
    }

    // Add company_id before validation
    const validatedData = programSchema.parse({
      ...rawData,
      company_id: company.id,
    });

    let program_picture_url: string | undefined;

    // Handle image upload to Supabase Storage
    if (programPicture) {
      // Validate file extension and MIME type
      const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
      const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      let fileExtension = programPicture.name.split(".").pop();
      if (!fileExtension) {
        return NextResponse.json(
          { error: "Uploaded file must have an extension." },
          { status: 400 }
        );
      }
      fileExtension = fileExtension.toLowerCase().trim();
      if (!allowedExtensions.includes(fileExtension)) {
        return NextResponse.json(
          {
            error: `File type .${fileExtension} is not allowed. Allowed types: ${allowedExtensions.join(
              ", "
            )}`,
          },
          { status: 400 }
        );
      }
      if (
        programPicture.type &&
        !allowedMimeTypes.includes(programPicture.type)
      ) {
        return NextResponse.json(
          {
            error: `MIME type ${programPicture.type
              } is not allowed. Allowed types: ${allowedMimeTypes.join(", ")}`,
          },
          { status: 400 }
        );
      }
      const fileName = `${uuidv4()}.${fileExtension}`; // Use UUID for unique filename
      const filePath = `${company.id}/${fileName}`; // Store images per company ID

      const supabase = await createClient();
      const { data: uploadData, error: uploadError } =
        await supabaseAdmin.storage
          .from("program_pictures") // Your bucket name
          .upload(filePath, programPicture, {
            cacheControl: "3600",
            upsert: true, // Allow overwriting if a file with same path exists
            contentType: programPicture.type,
          });

      if (uploadError) {
        console.error("Supabase Storage upload error:", uploadError);
        return NextResponse.json(
          { error: `Failed to upload image: ${uploadError.message}` },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from("program_pictures")
        .getPublicUrl(filePath);

      program_picture_url = publicUrlData.publicUrl;
    }

    // Insert program data into the database
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("programs")
      .insert([
        {
          ...validatedData,
          program_picture_url: program_picture_url,
        },
      ])
      .select("*")
      .single();

    if (error) {
      console.error("Error creating program:", error);
      // Optionally, delete the uploaded image if DB insertion fails
      if (program_picture_url) {
        await supabaseAdmin.storage
          .from("program_pictures")
          .remove([`${company.id}/${program_picture_url.split("/").pop()}`]);
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // --- BROADCAST NOTIFICATIONS ---
    try {
      await dispatchBroadcastNotification({
        title: validatedData.title,
        message: `A new program "${validatedData.title}" has been launched.`,
        type: 'program',
        referenceId: data.id,
        link: `/programs/${data.id}`,
        location: validatedData.location || 'Remote'
      });
      console.log("[PROGRAM_NOTIFY] Broadcast dispatched successfully.");
    } catch (notifErr) {
      console.error("[PROGRAM_NOTIFY] Failed to dispatch broadcast:", notifErr);
    }
    // ---------------------------------

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Validation or processing error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
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
    const programPicture = formData.get("program_picture") as File | null;
    const programId = formData.get("id") as string | null;

    if (!programId) {
      return NextResponse.json(
        { error: "Program ID is required for updates" },
        { status: 400 }
      );
    }

    // Extract other fields, handling potential comma-separated strings for arrays
    const rawUpdates: { [key: string]: any } = {};
    for (const [key, value] of formData.entries()) {
      if (key === "required_skills" && typeof value === "string") {
        rawUpdates[key] = value
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s);
      } else if (key !== "program_picture" && key !== "id") {
        // Exclude program_picture and id
        rawUpdates[key] = value;
      }
    }

    // Validate partial updates
    const updates = programSchema.partial().parse(rawUpdates);

    const supabase = await createClient();
    const { data: existingProgram, error: fetchError } = await supabase
      .from("programs")
      .select("id, company_id, program_picture_url")
      .eq("id", programId)
      .eq("company_id", company.id)
      .single();

    if (fetchError || !existingProgram) {
      return NextResponse.json(
        { error: "Program not found or does not belong to this company" },
        { status: 404 }
      );
    }

    let program_picture_url: string | undefined = existingProgram.program_picture_url;
    let oldImageFileName: string | null = null;
    let newImageFileName: string | null = null;

    // Handle new image upload
    if (programPicture) {
      // 1. Validate new image
      const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
      const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

      let fileExtension = programPicture.name.split(".").pop();
      if (!fileExtension) {
        return NextResponse.json({ error: "Uploaded file must have an extension." }, { status: 400 });
      }
      fileExtension = fileExtension.toLowerCase().trim();

      if (!allowedExtensions.includes(fileExtension) || (programPicture.type && !allowedMimeTypes.includes(programPicture.type))) {
        return NextResponse.json({ error: "Invalid file type or format." }, { status: 400 });
      }

      // 2. Prepare upload
      newImageFileName = `${uuidv4()}.${fileExtension}`;
      const filePath = `${company.id}/${newImageFileName}`;

      // 3. Upload new image
      const { error: uploadError } = await supabaseAdmin.storage
        .from("program_pictures")
        .upload(filePath, programPicture, {
          cacheControl: "3600",
          upsert: true,
          contentType: programPicture.type,
        });

      if (uploadError) {
        console.error("Supabase Storage upload error:", uploadError);
        return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from("program_pictures")
        .getPublicUrl(filePath);

      program_picture_url = publicUrlData.publicUrl;

      // Track old image for later deletion
      if (existingProgram.program_picture_url) {
        oldImageFileName = existingProgram.program_picture_url.split("/").pop() || null;
      }
    }

    // 4. Update program data in the database
    const { data, error: updateError } = await supabase
      .from("programs")
      .update({
        ...updates,
        program_picture_url: program_picture_url,
      })
      .eq("id", programId)
      .select("*")
      .single();

    if (updateError) {
      console.error("Error updating program:", updateError);

      // ROLLBACK: Delete the new image if DB update failed
      if (newImageFileName) {
        await supabaseAdmin.storage
          .from("program_pictures")
          .remove([`${company.id}/${newImageFileName}`]);
      }

      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 5. SUCCESS: Cleanup old image from storage
    if (oldImageFileName && newImageFileName) {
      await supabaseAdmin.storage
        .from("program_pictures")
        .remove([`${company.id}/${oldImageFileName}`]);
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Validation or processing error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    );
  }
}

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
        { error: "Program ID is required for deletion" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    // Verify program belongs to company and get its image URL
    const { data: existingProgram, error: fetchError } = await supabase
      .from("programs")
      .select("id, company_id, program_picture_url")
      .eq("id", id)
      .eq("company_id", company.id)
      .single();

    if (fetchError || !existingProgram) {
      return NextResponse.json(
        { error: "Program not found or does not belong to this company" },
        { status: 404 }
      );
    }

    // Delete program from database
    const { error: dbError } = await supabase
      .from("programs")
      .delete()
      .eq("id", id);

    if (dbError) {
      console.error("Error deleting program from DB:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // If DB deletion is successful, delete the associated image from storage
    if (existingProgram.program_picture_url) {
      const fileName = existingProgram.program_picture_url.split("/").pop();
      if (fileName) {
        const { error: storageError } = await supabaseAdmin.storage
          .from("program_pictures")
          .remove([`${company.id}/${fileName}`]);

        if (storageError) {
          console.warn(
            "Warning: Program deleted from DB, but failed to delete image from storage:",
            storageError
          );
          // You might want to log this but not fail the entire request,
          // as the main goal (DB deletion) was successful.
        }
      }
    }

    return NextResponse.json({ message: "Program deleted successfully" });
  } catch (err) {
    console.error("Processing error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    );
  }
}
