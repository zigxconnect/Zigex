import { NextResponse } from "next/server";

/**
 * GET /api/ai/test
 * Test endpoint to verify AI configuration
 */
export async function GET() {
    const hasGoogleKey = !!process.env.GOOGLE_API_KEY;
    const hasGeminiKey = !!process.env.GEMINI_API_KEY;

    return NextResponse.json({
        status: "ok",
        environment: process.env.NODE_ENV,
        apiKeys: {
            GOOGLE_API_KEY: hasGoogleKey ? "✅ Set" : "❌ Not set",
            GEMINI_API_KEY: hasGeminiKey ? "✅ Set" : "❌ Not set",
        },
        recommendation: !hasGoogleKey && !hasGeminiKey
            ? "Please add GOOGLE_API_KEY to your .env.local file"
            : "API keys configured correctly",
        instructions: {
            step1: "Get API key from: https://aistudio.google.com/apikey",
            step2: "Add to .env.local: GOOGLE_API_KEY=your_key_here",
            step3: "Restart the dev server: npm run dev"
        }
    });
}
