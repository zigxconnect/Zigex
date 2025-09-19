// File: supabase/functions/send-new-post-notification/index.ts
// **FINAL, MOST ROBUST VERSION**

import { createClient } from "npm:@supabase/supabase-js@2.44.4";
import { Resend } from "npm:resend@3.4.0";
import { renderAsync } from "npm:@react-email/render@0.0.15";
import React from "npm:react@18.3.1";
import { NewPostEmail } from "./email-template.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

Deno.serve(async (req) => {
  // Add a log to confirm the function is invoked
  console.log("Function invoked. Method:", req.method);

  // Best practice: Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "content-type",
      },
    });
  }

  try {
    // More robustly parse the JSON payload
    const payload = await req.json();
    console.log("Payload received:", payload);

    const { record: newPost, table: tableName } = payload;

    let postType: "Internship" | "Event" | "Program" | "Opportunity" =
      "Opportunity";
    let postTitle = newPost.title;
    let postId = newPost.id;

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
        console.log(`Unhandled table: ${tableName}`);
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
      console.log("No subscribed users found.");
      return new Response(
        JSON.stringify({ message: "No subscribed users found." }),
        { status: 200 }
      );
    }
    const recipientEmails = users.map((u) => u.email).filter(Boolean);
    console.log(`Found ${recipientEmails.length} recipients.`);

    // Render the React component to an HTML string
    const postUrl = `http://localhost:3000/${tableName}/${postId}`; // TODO: Replace localhost with your production URL (const postUrl = `https://www.your-app.com/${tableName}/${postId}`;)
    const emailHtml = await renderAsync(
      React.createElement(NewPostEmail, {
        postTitle: postTitle,
        postType: postType,
        viewPostUrl: postUrl,
        companyLogoUrl:
          "https://tmvipinvvhgklmqwvows.supabase.co/storage/v1/object/public/company-assets/Seed%20Company/events/SEED%20community%20Challenge-1757769838240.jpg",
        introText:
          "Hello! A new opportunity that may interest you has just been posted. Check it out below!",
      })
    );

    // Send the email
    await resend.emails.send({
      from: "FutureProspect <onboarding@resend.dev>", // TODO: Replace with your verified domain email(from: 'FutureProspect <notifications@your-verified-domain.com>',)
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
