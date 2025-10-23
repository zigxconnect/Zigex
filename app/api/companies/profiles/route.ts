import { NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { baseCompanySchema, editCompanySchema } from "@/lib/validation/company";

/**
 * Handles GET request to fetch the current company's profile.
 */
export async function GET(request: Request) {
  const auth = await authMiddleware(request);
  if (auth instanceof NextResponse) return auth;

  const { type, company } = auth;
  if (type !== "company" || !company) {
    return NextResponse.json(
      { error: "Company profile not found or unauthorized" },
      { status: 404 }
    );
  }

  return NextResponse.json(company);
}

/**
 * Handles PATCH request to update the current company's profile.
 * This is the function that was missing from this route.
 */
export async function PATCH(request: Request) {
  const auth = await authMiddleware(request);
  if (auth instanceof NextResponse) return auth;

  const { type, company } = auth;
  if (type !== "company" || !company) {
    return NextResponse.json(
      { error: "Company profile not found or unauthorized" },
      { status: 404 }
    );
  }

  const updates = await request.formData();

  // Extraact the logo and cover image files if they exist
  const logo = updates.get("logo") as File | null;
  const coverImage = updates.get("cover_image") as File | null;


  let logo_url: string | undefined;
  let cover_image_url: string | undefined;  // Upload images if they are provided
  

  // Check if the logo and cover images are provided before uploading
  if (logo && (logo instanceof File)) {

    // Generate a unique file name using company ID and timestamp and set the file path
    const logoName = `${company.id}_logo_${Date.now()}`;
    const logoExt = logo.name.split('.').pop();
    const logoPath = `${company.company_name}/Logo/${logoName}.${logoExt}`;

    // Uplaod the Logo to the supabase storage
    const { data: logoData, error: logoError } = await supabaseAdmin.storage
      .from('company-assets')
      .upload(logoPath, logo, { cacheControl: '3600', upsert: true });
    if (logoError) {
      console.error('Error uploading logo:', logoError);
      return NextResponse.json({ error: 'Failed to upload logo' }, { status: 500 });
    }

    // Get the public URL of the uploaded logo
    const { data: logoPublicURL } = supabaseAdmin.storage
      .from('company-assets')
      .getPublicUrl(logoPath);
    logo_url = logoPublicURL.publicUrl;
  }


  // Check if cover image is provided before uploading
  if (coverImage && (coverImage instanceof File)) {

    // Generate a unique file name using company ID and timestamp and set the file path
    const coverName = `${company.id}_cover_${Date.now()}`;
    const coverExt = coverImage.name.split('.').pop();
    const coverPath = `${company.company_name}/Cover/${coverName}.${coverExt}`;

    // Uplaod the cover image to the supabase storage
    const { data: coverData, error: coverError } = await supabaseAdmin.storage
      .from('company-assets')
      .upload(coverPath, coverImage, { cacheControl: '3600', upsert: true });
    if (coverError) {
      console.error('Error uploading cover image:', coverError);
      return NextResponse.json({ error: 'Failed to upload cover image' }, { status: 500 });
    }

    // Get the public URL of the uploaded cover image
    const { data: coverPublicURL } = supabaseAdmin.storage
      .from('company-assets')
      .getPublicUrl(coverPath);
    cover_image_url = coverPublicURL.publicUrl;
  }


  // Prepare the updates object
  const updatesObj = Object.fromEntries(updates.entries());

  // Validate the updates
  const validatedUpdates = editCompanySchema.partial().safeParse({
    ...updatesObj,
    // Only include the URLs if they were updated
    logo_url,
    cover_image_url
  })

  
 
  // Validate the updates against a partial version of the schema.
  // const validationResult = baseCompanySchema.partial().safeParse(updates);
  // if (!validationResult.success) {
  //   return NextResponse.json(
  //     {
  //       error: "Invalid data provided.",
  //       details: validationResult.error.flatten(),
  //     },
  //     { status: 400 }
  //   );
  // }

  // Update the company profile in the database using the ID from the authenticated session.
  const { data, error } = await supabaseAdmin
    .from("company_profiles")
    .update(validatedUpdates.data)
    .eq("id", company.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating company profile:", error);
    return NextResponse.json(
      { error: "Failed to update company profile." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Company profile updated successfully",
    data,
  });
}
