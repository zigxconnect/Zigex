import { revalidateTag, revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

// Sanity webhook secret (should be set in environment variables)
const SANITY_WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
    try {
        // If webhook secret is configured, validate the request
        if (SANITY_WEBHOOK_SECRET) {
            const { body, isValidSignature } = await parseBody<{
                _type: string;
                slug?: { current?: string };
            }>(req, SANITY_WEBHOOK_SECRET);

            if (!isValidSignature) {
                return NextResponse.json(
                    { message: "Invalid signature", revalidated: false },
                    { status: 401 }
                );
            }

            // Revalidate based on document type
            if (body?._type === "post") {
                // Revalidate blog listing pages
                revalidateTag("sanity");
                revalidatePath("/dashboard/blog");

                // Revalidate individual post if slug is provided
                if (body.slug?.current) {
                    revalidatePath(`/dashboard/blog/${body.slug.current}`);
                }

                return NextResponse.json({
                    revalidated: true,
                    now: Date.now(),
                    body,
                });
            }

            // Handle other document types
            if (body?._type === "category" || body?._type === "author") {
                revalidateTag("sanity");
                revalidatePath("/dashboard/blog");

                return NextResponse.json({
                    revalidated: true,
                    now: Date.now(),
                    body,
                });
            }
        } else {
            // No secret configured - accept all requests (development mode)
            // Parse the body manually
            const body = await req.json();

            console.log("[Sanity Webhook] Received:", body);

            // Revalidate all sanity content
            revalidateTag("sanity");
            revalidatePath("/dashboard/blog");

            if (body?.slug?.current) {
                revalidatePath(`/dashboard/blog/${body.slug.current}`);
            }

            return NextResponse.json({
                revalidated: true,
                now: Date.now(),
                message: "Content revalidated (no secret verification)",
            });
        }

        return NextResponse.json({
            revalidated: false,
            message: "No matching document type",
        });
    } catch (err: any) {
        console.error("[Sanity Webhook Error]", err);
        return NextResponse.json(
            { message: err.message || "Error revalidating", revalidated: false },
            { status: 500 }
        );
    }
}

// Health check endpoint
export async function GET() {
    return NextResponse.json({
        status: "ok",
        message: "Sanity webhook endpoint is ready",
        timestamp: new Date().toISOString(),
    });
}
