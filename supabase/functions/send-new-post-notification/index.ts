import { createClient } from "npm:@supabase/supabase-js@2.44.4";
import { Resend } from "npm:resend@3.4.0";
import { renderAsync } from "npm:@react-email/render@0.0.15";
import React from "npm:react@18.3.1";
import { readTextFileStr } from "npm:std@0.177.0/fs/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": Deno.env.get("FRONTEND_URL") || "http://localhost:3000",
        "Access-Control-Allow-Headers": "content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }

  try {
    const payload = await req.json();
    const { record: newPost, table: tableName } = payload;

    let postType: "Internship" | "Event" | "Program" = "Internship";
    let postTitle = newPost.title;
    let postId = newPost.id;
    let postLocation = newPost.location;

    switch (tableName) {
      case "internships":
        postType = "Internship";
        break;
      case "events":
        postType = "Event";
        break;
      case "programs":
        postType = "Program";
        break;
      default:
        return new Response(
          JSON.stringify({ message: `Unhandled table: ${tableName}` }),
          { status: 200 }
        );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: users, error: userError } = await supabaseAdmin.rpc(
      "get_subscribed_emails"
    );
    if (userError) throw userError;
    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ message: "No subscribed users found." }),
        { status: 200 }
      );
    }
    const recipientEmails = users.map((u) => u.email).filter(Boolean);

    // Define URLs for the template
    const postUrl = `https://zigexconnect.com/${tableName}/${postId}`;
    const managePreferencesUrl = `https://zigexconnect.com/profile/notifications`;

    // Format the posted date (e.g., 'Sep 22, 2025')
    const postedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    // Load the HTML template from disk and substitute placeholders.
    const templatePath = new URL("./email-template.html", import.meta.url);
    let template = await readTextFileStr(templatePath);

    const recipientGreeting = `Dear ${"recipientName" in newPost ? newPost.recipientName : "ZIGEX Member"},`;

    const replacements: { [k: string]: string } = {
      "{{postType}}": postType,
      "{{postTitle}}": postTitle,
      "{{postLocation}}": postLocation || "",
      "{{viewPostUrl}}": postUrl,
      "{{managePreferencesUrl}}": managePreferencesUrl,
      "{{companyLogoUrl}}":
        "https://tmvipinvvhgklmqwvows.supabase.co/storage/v1/object/public/company-assets/Seed%20Company/events/SEED%20community%20Challenge-1757769838240.jpg",
      "{{postedDate}}": postedDate,
      "{{recipientGreeting}}": recipientName ? `Dear ${recipientName},` : "Dear ZIGEX Member,",
    };

    for (const key of Object.keys(replacements)) {
      template = template.split(key).join(replacements[key]);
    }

    const emailHtml = template;

    // Send the email
    await resend.emails.send({
      from: "ZIGEX <notifications@zigexconnect.com>",
      to: "delivered@resend.dev",
      bcc: recipientEmails,
      subject: `New ${postType} Posted: ${postTitle}`,
      html: emailHtml,
    });

    console.log("Email dispatch successful.");
    return new Response(
      JSON.stringify({
        message: `Email dispatch initiated for ${recipientEmails.length} users.`,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Caught Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});
