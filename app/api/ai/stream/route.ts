import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * AI Chatbot Streaming Endpoint
 * Provides ChatGPT-style word-by-word streaming
 */

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

async function createSupabaseServerClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get: async (name: string) => {
                    return (await cookieStore).get(name)?.value;
                },
                set: async (name: string, value: string, options: CookieOptions) => {
                    try {
                        (await cookieStore).set({ name, value, ...options });
                    } catch (error) { }
                },
                remove: async (name: string, options: CookieOptions) => {
                    try {
                        (await cookieStore).set({ name, value: "", ...options });
                    } catch (error) { }
                },
            },
        }
    );
}

function buildSystemContext(): string {
    return `You are ZAi, the intelligent AI assistant for ZigEx, a comprehensive platform connecting African students with opportunities.

## PLATFORM OVERVIEW
ZigEx is a career development platform that helps students:
- Discover internships, programs, events, and scholarships
- Apply to opportunities with AI-powered application assistance
- Build professional profiles and portfolios
- Connect with companies and other students
- Track application progress and deadlines

## YOUR CAPABILITIES
As ZAi, you can help users with:
1. **Opportunity Discovery** - Recommend relevant opportunities based on profile
2. **Application Assistance** - Guide through application process
3. **Profile Optimization** - Suggest profile improvements
4. **Career Guidance** - Provide career advice
5. **Platform Navigation** - Explain features

## CONVERSATION GUIDELINES
- **Be Proactive**: Anticipate user needs and offer suggestions
- **Be Contextual**: Reference their profile, applications, and activity
- **Be Specific**: Provide actionable advice, not generic tips
- **Be Encouraging**: Support students in their career journey
- **Be Concise**: Keep responses clear and to the point
- **Use Formatting**: Use markdown for better readability (bold, lists, etc.)

When users ask about opportunities, applications, or career advice, draw from this context to provide intelligent, personalized responses.`;
}

async function getUserContext(userId: string, supabase: any): Promise<string> {
    try {
        const { data: profile, error } = await supabase
            .from("student_profiles")
            .select("*")
            .eq("user_id", userId)
            .single();

        if (error || !profile) {
            return "User profile not found. Provide general guidance.";
        }

        let context = `\n## USER PROFILE\n`;
        context += `- Name: ${profile.full_name || "Not specified"}\n`;
        context += `- University: ${profile.university || "Not specified"}\n`;
        context += `- Field of Study: ${profile.field_of_study || "Not specified"}\n`;

        if (profile.hard_skills && profile.hard_skills.length > 0) {
            context += `- Technical Skills: ${profile.hard_skills.join(", ")}\n`;
        }

        context += `\n**Use this information to personalize your responses.**\n`;
        return context;
    } catch (error) {
        console.error("Error fetching user context:", error);
        return "Unable to fetch user profile. Provide general guidance.";
    }
}

export async function POST(request: NextRequest) {
    const encoder = new TextEncoder();

    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new Response(
                encoder.encode(JSON.stringify({ error: "Unauthorized" })),
                { status: 401 }
            );
        }

        const body = await request.json();
        const { message, conversationHistory = [] } = body;

        if (!message || typeof message !== "string") {
            return new Response(
                encoder.encode(JSON.stringify({ error: "Message required" })),
                { status: 400 }
            );
        }

        if (!process.env.GOOGLE_API_KEY) {
            return new Response(
                encoder.encode(JSON.stringify({ error: "AI service not configured" })),
                { status: 500 }
            );
        }

        const systemContext = buildSystemContext();
        const userContext = await getUserContext(user.id, supabase);

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const model = genAI.getGenerativeModel({
                        model: "gemini-2.5-flash",
                        generationConfig: {
                            temperature: 0.9,
                            topP: 0.95,
                            topK: 40,
                            maxOutputTokens: 2048,
                        },
                    });

                    const history = conversationHistory.map((msg: any) => ({
                        role: msg.role === "user" ? "user" : "model",
                        parts: [{ text: msg.content }],
                    }));

                    const chat = model.startChat({
                        history: [
                            {
                                role: "user",
                                parts: [{ text: systemContext + userContext }],
                            },
                            {
                                role: "model",
                                parts: [{
                                    text: `Hello! I'm ZAi, your intelligent career assistant. How can I help you today?`,
                                }],
                            },
                            ...history,
                        ],
                    });

                    // Retry logic for rate limits
                    let retries = 0;
                    const maxRetries = 3;
                    let result;

                    while (retries < maxRetries) {
                        try {
                            result = await chat.sendMessageStream(message);
                            break; // Success, exit retry loop
                        } catch (error: any) {
                            if (error.status === 429 && retries < maxRetries - 1) {
                                // Rate limit hit, wait and retry
                                const waitTime = Math.pow(2, retries) * 1000; // Exponential backoff
                                console.log(`Rate limit hit, retrying in ${waitTime}ms...`);
                                await new Promise(resolve => setTimeout(resolve, waitTime));
                                retries++;
                            } else {
                                throw error; // Re-throw if not rate limit or max retries reached
                            }
                        }
                    }

                    if (!result) {
                        throw new Error("Failed to get response after retries");
                    }

                    // Stream the response
                    for await (const chunk of result.stream) {
                        const chunkText = chunk.text();
                        controller.enqueue(
                            encoder.encode(`data: ${JSON.stringify({ text: chunkText })}\n\n`)
                        );
                    }

                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                    controller.close();
                } catch (error: any) {
                    console.error("Streaming error:", error);

                    // If rate limit, provide a helpful mock response
                    if (error.status === 429) {
                        const mockResponse = `Hello! I'm currently experiencing API rate limits, but I can still help you! 

**Here's what I can tell you about ZigEx:**

ZigEx is your comprehensive career development platform designed specifically for African students. Here's what we offer:

**🎯 Key Features:**
1. **Opportunities Feed** - Browse internships, programs, events, and scholarships
2. **Smart Apply** - AI-powered application letter generation
3. **Student Profiles** - Showcase your skills and achievements
4. **Company Connections** - Connect directly with employers
5. **Application Tracking** - Monitor your application progress

**💡 How I Can Help:**
- Find opportunities matching your skills
- Optimize your profile
- Provide career guidance
- Draft application letters
- Suggest skill improvements

**⚠️ Note:** I'm currently in demo mode due to API limits. For full AI capabilities, please wait a moment and try again, or contact support to upgrade the API tier.

What would you like to explore about ZigEx?`;

                        // Stream the mock response word by word
                        const words = mockResponse.split(' ');
                        for (const word of words) {
                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`)
                            );
                            // Small delay to simulate streaming
                            await new Promise(resolve => setTimeout(resolve, 50));
                        }
                    } else {
                        // Other errors - send user-friendly message
                        let errorMessage = "I'm having trouble connecting right now. Please try again in a moment.";

                        if (error.message?.includes("API key")) {
                            errorMessage = "There's an issue with my configuration. Please contact support.";
                        }

                        controller.enqueue(
                            encoder.encode(`data: ${JSON.stringify({ text: errorMessage })}\n\n`)
                        );
                    }

                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error: any) {
        console.error("Stream setup error:", error);
        return new Response(
            encoder.encode(JSON.stringify({ error: error.message })),
            { status: 500 }
        );
    }
}
