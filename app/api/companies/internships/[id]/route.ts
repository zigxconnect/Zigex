import { createClient, supabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { internshipSchema } from "@/lib/validation/internship";

//Update Company Internhip details

/**
 *  @swagger
 *  /api/companies/internships/[id]:
 *    patch:
 *      tags:
 *        - Company Postings
 *      summary: Update an existing internship for a company
 *      description: Update an existing internship for a particular company
 *      responses:
 *    200:
 *      description: Internship updated successfully
 *    400:
 *      description: Bad request
 *    403:
 *      description: Unauthorized access
 *    404:
 *      description: Internship not found or does not belong to this company
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Authenticate the user
  const auth = await authMiddleware(request);
  if (auth instanceof NextResponse) {
    return auth;
  }


  const { type } = auth;
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

  // Handle FormData
  try {
    const formData = await request.formData();
    const coverImage = formData.get("cover_image") as File | null;

    // Extract fields from FormData
    const rawData: any = {};
    formData.forEach((value, key) => {
      if (key === "required_skills") {
        try {
          rawData[key] = JSON.parse(value as string);
        } catch {
          rawData[key] = [];
        }
      } else if (key === "is_paid") {
        rawData[key] = value === "true";
      } else if (key !== "cover_image") {
        rawData[key] = value === "null" ? null : value;
      }
    });

    const sanitizePathComponent = (str: string) =>
      str.replace(/[^a-zA-Z0-9_-]/g, "_");

    let cover_image_url = rawData.cover_image_url || null;

    const supabase = await createClient();

    // Verify ownership
    const { data: existingInternship, error: fetchError } = await supabase
      .from("internships")
      .select("*")
      .eq("id", id)
      .eq("company_id", company.id)
      .single();

    if (fetchError || !existingInternship) {
      return NextResponse.json(
        { error: "Internship not found or does not belong to this company" },
        { status: 404 }
      );
    }

    // Handle Image Upload if new image provided
    if (coverImage) {
      console.log("Updating internship cover image...");
      const imageExt = coverImage.name.split(".").pop();
      const imageName = `internship-${Date.now()}.${imageExt}`;
      const imagePath = `${sanitizePathComponent(company.company_name)}/internships/${imageName}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("company-assets")
        .upload(imagePath, coverImage, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        console.error("Supabase storage upload error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload cover image" },
          { status: 500 }
        );
      }

      const { data: imageData } = supabaseAdmin.storage
        .from("company-assets")
        .getPublicUrl(imagePath);
      cover_image_url = imageData.publicUrl;
    }

    // Validate updates
    const validatedUpdates = internshipSchema.partial().parse({
      ...rawData,
      cover_image_url
    });

    // Update data
    const { data, error } = await supabase
      .from("internships")
      .update(validatedUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("PATCH DB Update Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("PATCH Handler Error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

//Delete Company Internship
/**
 * @swagger
 * /api/companies/internships/[id]:
 *  delete:
 *      tags:
 *          - Company Postings
 *      summary: Delete an internship for a company
 *      description:
 *          delete company internship or posting.
 *          id is the id of the internship.
 *          no body.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Authenticate the user
  const auth = await authMiddleware(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { type } = auth;
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
  // verify internship belongs to company
  const { data: existingInternship, error: fetchError } = await supabase
    .from("internships")
    .select("*")
    .eq("id", id)
    .eq("company_id", company.id)
    .single();
  if (fetchError || !existingInternship) {
    return NextResponse.json(
      { error: "Internship not found or does not belong to this company" },
      { status: 404 }
    );
  }

  const { data, error } = await supabase
    .from("internships")
    .delete()
    .eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

/**
 * @swagger
 * /api/companies/internships/[id]:
 *  get:
 *      tags:
 *          - Company Postings
 *      description: get a unique internship for a company. id is the id of the internship
 *      summary: Get details of a specific internship for a company
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Authenticate the user
  const auth = await authMiddleware(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { type } = auth;
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
  // Fetch the single internship that matches the ID and is owned by the requesting company.
  const { data: internship, error } = await supabase
    .from("internships")
    .select(`*`)
    .eq("id", id)
    .eq("company_id", company.id)
    .single();

  // Handle cases where the internship is not found or not owned by the company
  if (error || !internship) {
    console.error("Supabase query error:", error);
    return NextResponse.json(
      { error: "Internship not found or not owned by your company" },
      { status: 404 }
    );
  }

  return NextResponse.json(internship);
}
