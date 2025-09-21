import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { companyVerificationSchema, updateCompanyVerificationSchema } from "@/lib/validation/company_verification";
import { object } from "zod";

import { v4 as uuidv4 } from 'uuid';


export async function POST(request: Request) {
  // 1. Authenticate the user
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
    // 2. Parse and validate the request body
    const body = await request.formData();
    const proof_of_address = body.get("proof_of_address") as File | null;
    const certificate = body.get("certificate") as File | null;
    const representative_id = body.get("representative_id") as File | null;


    
    let proof_of_address_url: string| null = null
    let certificate_url: string | null = null
    let representative_id_url: string | null = null



    // Here we check if the documents are available and upload to suppabase storage

    // We begin with the Certificate. 
    // Extract the extention and check if it is a pdf
    // Set the file name and path
    // Upload to supabase storage and set the url

    if (certificate && (certificate instanceof File)) {
      certificate_url = await uploadToSupabaseStorage(certificate, "certificate", ["pdf"], ["application/pdf"], "certificate", company.id)
    }
    
    if (proof_of_address && (proof_of_address instanceof File)) {
      proof_of_address_url = await uploadToSupabaseStorage(proof_of_address, "proof_of_address", ["pdf","jpg","jpeg","png"], ["application/pdf","image/jpeg","image/png"], "proof_of_address", company.id)
    }
    if (representative_id && (representative_id instanceof File)) {
      representative_id_url = await uploadToSupabaseStorage(representative_id, "representative_id", ["pdf","jpg","jpeg","png"], ["application/pdf","image/jpeg","image/png"], "representative_id", company.id)
    }

    const bodyObject: any = Object.fromEntries(body.entries());

    const parsedData = companyVerificationSchema.parse({
        ...bodyObject,
        proof_of_address: proof_of_address_url,
        certificate_url: certificate_url,
        representative_id: representative_id_url,
        company_id: company.id,
  });

    // 3. Insert the verification request into the database
    const { data, error: dbError } = await supabaseAdmin
      .from("company_verifications")
      .insert({
        ...parsedData
    })
      .select()
      .single();

    if (dbError) {
      console.error("Database insertion error:", dbError);
      return NextResponse.json(
        { error: "Failed to create verification request", details: dbError.message },
        { status: 500 }
      );
    }

    // 4. Return success response
    return NextResponse.json(
      { message: "Verification request submitted successfully", data },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Invalid request data", details: error.message },
      { status: 400 }
    );
  }
}


export async function GET(request: Request) {
  // 1. Authenticate the user
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
    // 2. Fetch the verification request from the database
    const { data, error: dbError } = await supabaseAdmin
      .from("company_verifications")
      .select("*")
      .eq("company_id", company.id)
      .order('created_at', { ascending: false }) // Get the latest request first
      .limit(1)
      .single();

    if (dbError) {
      if (dbError.code === "PGRST116") {
        // No verification request found
        return NextResponse.json(
          { message: "No verification request found" },
          { status: 404 }
        );
      }
      console.error("Database fetch error:", dbError);
      return NextResponse.json(
        { error: "Failed to fetch verification request", details: dbError.message },
        { status: 500 }
      );
    }

    // 3. Return the verification request data
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Invalid request", details: error.message },
      { status: 400 }
    );
  }
}


export async function PATCH(request: Request) {
  // 1. Authenticate the user
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
    // 2. Parse and validate the request body
    const body = await request.formData();
    const proof_of_address = body.get("proof_of_address") as File | null;
    const certificate = body.get("certificate") as File | null;
    const representative_id = body.get("representative_id") as File | null;
    let proof_of_address_url: string | null = null;
    let certificate_url: string | null = null;
    let representative_id_url: string | null = null;

    if (certificate && (certificate instanceof File)) {
        certificate_url = await uploadToSupabaseStorage(
            certificate,
            "certificate",
            ["pdf"],
            ["application/pdf"],
            "certificate",
            company.id
        );
    }

    if (proof_of_address && (proof_of_address instanceof File)) {
        proof_of_address_url = await uploadToSupabaseStorage(
            proof_of_address,
            "proof_of_address",
            ["pdf", "jpg", "jpeg", "png"],
            ["application/pdf", "image/jpeg", "image/png"],
            "proof_of_address",
            company.id
        );
    }

    if (representative_id && (representative_id instanceof File)) {
        representative_id_url = await uploadToSupabaseStorage(
            representative_id,
            "representative_id",
            ["pdf", "jpg", "jpeg", "png"],
            ["application/pdf", "image/jpeg", "image/png"],
            "representative_id",
            company.id
        );
    }

    const bodyObject: any = Object.fromEntries(body.entries());

    const parsedData = updateCompanyVerificationSchema.safeParse({
        ...bodyObject,
        proof_of_address: proof_of_address_url,
        certificate_url: certificate_url,
        representative_id: representative_id_url,
        company_id: company.id,
    });

    // Find the latest verification request for this company
    const { data: existingVerification, error: fetchError } = await supabaseAdmin
        .from("company_verifications")
        .select("*")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Database fetch error:", fetchError);
        return NextResponse.json(
            { error: "Failed to fetch verification request", details: fetchError.message },
            { status: 500 }
        );
    }

    if (!existingVerification) {
        return NextResponse.json(
            { error: "No verification request found to update" },
            { status: 404 }
        );
    }

    // Update the verification request
    const { data, error: updateError } = await supabaseAdmin
        .from("company_verifications")
        .update(parsedData)
        .eq("id", existingVerification.id)
        .select()
        .single();

    if (updateError) {
        console.error("Database update error:", updateError);
        return NextResponse.json(
            { error: "Failed to update verification request", details: updateError.message },
            { status: 500 }
        );
    }

    return NextResponse.json(
        { message: "Verification request updated successfully", data },
        { status: 200 }
    );
}
catch(error){
    return NextResponse.json(
        {
            message: "Error updating request"
        },
        {status: 400}
    )
}
}




async function uploadToSupabaseStorage(file: File, path: string, allowedExtensions: string[], allowedMimeTypes: string[], fileType: string, id:string): Promise<string | any> {
      
      // Validate file extension and MIME type
      let fileExtension = file.name.split(".").pop();
      if (!fileExtension) {
        return NextResponse.json(
          { error: "file file must have an extension." },
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
        file.type &&
        !allowedMimeTypes.includes(file.type)
      ) {
        return NextResponse.json(
          {
            error: `MIME type ${
              file.type
            } is not allowed. Allowed types: ${allowedMimeTypes.join(", ")}`,
          },
          { status: 400 }
        );
      }
      const fileName = `${uuidv4()}.${fileExtension}`; // Use UUID for unique filename
      const filePath = `${id}/verification/${fileType}s/${fileName}`; // Store images per company ID

      const { data: uploadData, error: uploadError } =
        await supabaseAdmin.storage
          .from("company_assets") // Your bucket name
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true, // Allow overwriting if a file with same path exists
            contentType: file.type,
          });

      if (uploadError) {
        console.error("Supabase Storage upload error:", uploadError);
        return NextResponse.json(
          { error: `Failed to upload image: ${uploadError.message}` },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from("company_assets")
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
}