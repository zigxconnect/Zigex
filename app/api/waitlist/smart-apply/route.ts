import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { email, opportunityTitle, opportunityType } = await request.json();

        console.log("=== Waitlist Request ===");
        console.log("Email:", email);
        console.log("Opportunity:", opportunityTitle);

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email address" },
                { status: 400 }
            );
        }

        // Send confirmation email using EmailJS
        try {
            await sendWaitlistConfirmationEmail(email, opportunityTitle);
            console.log("✅ Email sent successfully!");
        } catch (emailError) {
            console.error("❌ Email sending error:", emailError);
            throw emailError;
        }

        return NextResponse.json({
            success: true,
            message: "Successfully joined the waitlist!",
        });
    } catch (error) {
        console.error("=== Waitlist API Error ===");
        console.error(error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to join waitlist. Please try again." },
            { status: 500 }
        );
    }
}

async function sendWaitlistConfirmationEmail(
    email: string,
    opportunityTitle: string
) {
    const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_WAITLIST_TEMPLATE_ID;
    const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    console.log("=== EmailJS Configuration ===");
    console.log("Service ID:", EMAILJS_SERVICE_ID ? "✅ Set" : "❌ Missing");
    console.log("Template ID:", EMAILJS_TEMPLATE_ID ? "✅ Set" : "❌ Missing");
    console.log("Public Key:", EMAILJS_PUBLIC_KEY ? "✅ Set" : "❌ Missing");

    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
        const missing = [];
        if (!EMAILJS_SERVICE_ID) missing.push("NEXT_PUBLIC_EMAILJS_SERVICE_ID");
        if (!EMAILJS_TEMPLATE_ID) missing.push("NEXT_PUBLIC_EMAILJS_WAITLIST_TEMPLATE_ID");
        if (!EMAILJS_PUBLIC_KEY) missing.push("NEXT_PUBLIC_EMAILJS_PUBLIC_KEY");

        throw new Error(`Missing EmailJS credentials: ${missing.join(", ")}`);
    }

    const templateParams = {
        to_email: email,
        opportunity_title: opportunityTitle,
        user_email: email,
        year: new Date().getFullYear(),
    };

    console.log("=== Sending Email ===");
    console.log("To:", email);
    console.log("Template Params:", templateParams);

    try {
        const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                service_id: EMAILJS_SERVICE_ID,
                template_id: EMAILJS_TEMPLATE_ID,
                user_id: EMAILJS_PUBLIC_KEY,
                template_params: templateParams,
            }),
        });

        const responseText = await response.text();
        console.log("EmailJS Status:", response.status);
        console.log("EmailJS Response:", responseText);

        if (!response.ok) {
            throw new Error(`EmailJS Error (${response.status}): ${responseText}`);
        }

        return { success: true };
    } catch (error) {
        console.error("EmailJS Fetch Error:", error);
        throw error;
    }
}
