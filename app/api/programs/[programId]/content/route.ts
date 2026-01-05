import { NextRequest, NextResponse } from "next/server";
import { createClient, supabaseAdmin } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const { programId } = await params;
    const supabase = await createClient();

    // Fetch all content for the program (lessons + resources)
    const { data: content, error } = await supabase
      .from("program_content")
      .select("*")
      .eq("program_id", programId)
      .order("display_order", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ content }, { status: 200 });
  } catch (error) {
    console.error("Error fetching program content:", error);
    return NextResponse.json(
      { error: "Failed to fetch program content" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const { programId } = await params;
    const supabase = await createClient();
    const { title, content_type, description, content_url, resource_type } =
      await req.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify user is admin for this program
    const { data: program } = await supabase
      .from("programs")
      .select("company_id, title")
      .eq("id", programId)
      .single();

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    // Verify user is company admin
    const { data: company } = await supabase
      .from("company_profiles")
      .select("id, company_name")
      .eq("id", program.company_id)
      .eq("user_id", user.id)
      .single();

    if (!company) {
      return NextResponse.json(
        { error: "Not authorized to add content" },
        { status: 403 }
      );
    }

    // Create content
    const { data, error } = await supabase
      .from("program_content")
      .insert({
        program_id: programId,
        title,
        content_type,
        description,
        content_url,
        resource_type,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // --- NOTIFICATION LOGIC FOR PAID USERS ---
    try {
      console.log("Starting notification process for new content...");

      // 1. Fetch "paid" applications for this program
      // We check for is_paid OR payment_completed OR accepted status if implied
      const { data: paidApps, error: appsError } = await supabase
        .from("Applications")
        .select("student_id")
        .eq("program_id", programId)
        .eq("payment_completed", true);

      if (appsError) {
        console.error("Error fetching paid apps for notification:", appsError);
      } else if (paidApps && paidApps.length > 0) {
        console.log(`Found ${paidApps.length} paid applications to notify.`);

        // 2. Get Student Profiles
        const studentIds = paidApps.map((app) => app.student_id);
        const { data: students, error: profilesError } = await supabase
          .from("student_profiles")
          .select("id, user_id, full_name")
          .in("id", studentIds);

        if (profilesError) {
          console.error("Error fetching student profiles:", profilesError);
        } else if (students) {
          // 3. Loop and Send
          // We use Promise.all to send in parallel but catch errors individually
          await Promise.all(
            students.map(async (student) => {
              try {
                // Get Email from Auth (since profile might not have it or it's safer)
                let email = "";
                // Try to check if we can get email from profile if it exists (schema ambiguous)
                // But safest is auth user
                const { data: userData } = await supabaseAdmin.auth.admin.getUserById(
                  student.user_id
                );
                email = userData?.user?.email || "";

                if (email) {
                  console.log(`Sending notification to ${email} (${student.full_name})...`);

                  await sendEmail({
                    to: email,
                    subject: `New Content: ${title}`,
                    heading: "New Learning Resource Added 📚",
                    message: `Hi ${student.full_name?.split(" ")[0] || "Learner"
                      }, \n\nA new resource "${title}" has been added to the **${program.title}** program.\n\nDescription: ${description || "No description provided."}\n\nLog in now to access it!`,
                    ctaText: "Access Content",
                    ctaLink: `https://zigexconnect.com/dashboard/programs/${programId}/content`,
                    opportunityTitle: program.title,
                    companyName: company.company_name,
                    statusBadge: "NEW CONTENT",
                    statusColor: "#155DFC"
                  });

                  console.log(`[Email Status] Sent to ${email}: Success=true`);
                } else {
                  console.warn(`No email found for student ${student.full_name} (User ID: ${student.user_id})`);
                }
              } catch (innerError) {
                console.error(`Failed to notify student ${student.id}:`, innerError);
              }
            })
          );
        }
      } else {
        console.log("No paid users found for this program, skipping notifications.");
      }
    } catch (notifyError) {
      console.error("Unexpected error in notification details:", notifyError);
      // We do NOT fail the request if notifications fail
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating content:", error);
    return NextResponse.json(
      { error: "Failed to create content" },
      { status: 500 }
    );
  }
}

