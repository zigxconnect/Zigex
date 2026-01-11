import { NextRequest, NextResponse } from "next/server";
import { sendBlogFeedbackEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const { postTitle, postSlug, senderName, senderEmail, message, feedbackType } = body;

        // Validation
        if (!postTitle || !postSlug || !senderName || !senderEmail || !message) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(senderEmail)) {
            return NextResponse.json(
                { error: "Invalid email address" },
                { status: 400 }
            );
        }

        // Message length validation
        if (message.length < 10) {
            return NextResponse.json(
                { error: "Message must be at least 10 characters" },
                { status: 400 }
            );
        }

        if (message.length > 2000) {
            return NextResponse.json(
                { error: "Message must be less than 2000 characters" },
                { status: 400 }
            );
        }

        // Send the feedback email
        const result = await sendBlogFeedbackEmail({
            postTitle,
            postSlug,
            senderName,
            senderEmail,
            message,
            feedbackType: feedbackType || 'comment',
        });

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: "Your feedback has been sent successfully!",
            });
        } else {
            return NextResponse.json(
                { error: result.error || "Failed to send feedback" },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error("[Blog Feedback API Error]", error);
        return NextResponse.json(
            { error: "An unexpected error occurred" },
            { status: 500 }
        );
    }
}
