import { supabaseAdmin } from "@/lib/supabase/server";
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

  // Validate data
  const body = await request.json();
  const { ...updates } = internshipSchema.partial().parse(body);

  const { data: existingInternship, error: fetchError } = await supabaseAdmin
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

  // Update data
  const { data, error } = await supabaseAdmin
    .from("internships")
    .update(updates)
    .eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
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

  // verify internship belongs to company
  const { data: existingInternship, error: fetchError } = await supabaseAdmin
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

  const { data, error } = await supabaseAdmin
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


  // Fetch the single internship that matches the ID and is owned by the requesting company.
  const { data: internship, error } = await supabaseAdmin
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
