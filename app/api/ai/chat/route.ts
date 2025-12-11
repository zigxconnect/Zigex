import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * AI Chatbot Endpoint for ZigEx Platform
 * Uses Gemini 2.0 Flash for intelligent, context-aware conversations
 * Built by a senior backend engineer with deep understanding of production systems
 */

// Initialize Gemini AI
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

/**
 * Build comprehensive system context about the ZigEx platform
 * This gives the AI deep understanding of what the platform does
 */
function buildSystemContext(): string {
  return `You are ZAi, the intelligent AI assistant for ZigEx (formerly FutureProspect), a comprehensive platform connecting African students with opportunities.

## PLATFORM OVERVIEW
ZigEx is a career development platform that helps students:
- Discover internships, programs, events, and scholarships
- Apply to opportunities with AI-powered application assistance
- Build professional profiles and portfolios
- Connect with companies and other students
- Track application progress and deadlines

## KEY FEATURES YOU SHOULD KNOW ABOUT

### 1. Opportunities (Feed)
- **Internships**: Company-posted internship positions
- **Programs**: Educational programs, bootcamps, fellowships
- **Events**: Career fairs, workshops, networking events
- **Scholarships**: Financial aid opportunities

### 2. Smart Apply Feature
- AI-powered application letter generation
- Personalized based on user profile and opportunity
- Uses Gemini AI to craft compelling applications
- Includes payment integration via Monetbil

### 3. Student Profiles
Students have comprehensive profiles including:
- Personal info (name, university, field of study, GPA)
- Skills (hard_skills, soft_skills)
- Education history
- Work experience (previous_roles)
- Portfolio projects
- Interests and achievements
- Location and preferences

### 4. Company Profiles
Companies can:
- Post opportunities
- Review applications
- Accept/reject candidates
- Communicate with applicants

### 5. Projects Showcase
Students can showcase their work:
- Project portfolios
- GitHub integration
- Collaboration features

### 6. Application Tracking
- Track application status
- View accepted/rejected applications
- Monitor deadlines

## YOUR CAPABILITIES

As ZAi, you can help users with:

1. **Opportunity Discovery**
   - Recommend relevant opportunities based on profile
   - Explain opportunity requirements
   - Suggest best matches

2. **Application Assistance**
   - Guide through application process
   - Provide tips for strong applications
   - Explain Smart Apply feature

3. **Profile Optimization**
   - Suggest profile improvements
   - Recommend skills to add
   - Advise on portfolio building

4. **Career Guidance**
   - Provide career advice
   - Suggest learning paths
   - Recommend networking strategies

5. **Platform Navigation**
   - Explain features
   - Guide users to relevant sections
   - Answer questions about the platform

## CONVERSATION GUIDELINES

- **Be Proactive**: Anticipate user needs and offer suggestions
- **Be Contextual**: Reference their profile, applications, and activity
- **Be Specific**: Provide actionable advice, not generic tips
- **Be Encouraging**: Support students in their career journey
- **Be Concise**: Keep responses clear and to the point
- **Use Emojis**: Make conversations engaging (🎯 📄 ✨ 💼 🚀)

## IMPORTANT CONTEXT
- Platform serves primarily African students
- Focus on opportunities in Africa and remote positions
- Emphasize practical, achievable advice
- Be aware of local context (Cameroon, Africa)

When users ask about opportunities, applications, or career advice, draw from this context to provide intelligent, personalized responses.`;
}

/**
 * Get user context from database
 * Provides personalized responses based on user profile
 */
async function getUserContext(userId: string, supabase: any): Promise<string> {
  try {
    // Fetch student profile
    const { data: profile, error } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !profile) {
      return "User profile not found. Provide general guidance.";
    }

    // Build user context
    let context = `\n## USER PROFILE\n`;
    context += `- Name: ${profile.full_name || "Not specified"}\n`;
    context += `- University: ${profile.university || "Not specified"}\n`;
    context += `- Field of Study: ${profile.field_of_study || "Not specified"}\n`;
    context += `- GPA: ${profile.gpa || "Not specified"}\n`;
    context += `- Graduation Year: ${profile.graduation_year || "Not specified"}\n`;
    context += `- Location: ${profile.location || "Not specified"}\n`;

    if (profile.hard_skills && profile.hard_skills.length > 0) {
      context += `- Technical Skills: ${profile.hard_skills.join(", ")}\n`;
    }

    if (profile.soft_skills && profile.soft_skills.length > 0) {
      context += `- Soft Skills: ${profile.soft_skills.join(", ")}\n`;
    }

    if (profile.preferred_industries && profile.preferred_industries.length > 0) {
      context += `- Career Interests: ${profile.preferred_industries.join(", ")}\n`;
    }

    if (profile.interests && profile.interests.length > 0) {
      context += `- Interests: ${profile.interests.join(", ")}\n`;
    }

    // Fetch recent applications
    const { data: applications } = await supabase
      .from("internship_applications")
      .select("*, internships(title, company_profiles(company_name))")
      .eq("student_id", userId)
      .order("created_at", { ascending: false })
      .limit(3);

    if (applications && applications.length > 0) {
      context += `\n## RECENT APPLICATIONS\n`;
      applications.forEach((app: any, index: number) => {
        context += `${index + 1}. ${app.internships?.title || "Unknown"} at ${app.internships?.company_profiles?.company_name || "Unknown Company"
          } - Status: ${app.status}\n`;
      });
    }

    context += `\n**Use this information to personalize your responses and provide relevant advice.**\n`;

    return context;
  } catch (error) {
    console.error("Error fetching user context:", error);
    return "Unable to fetch user profile. Provide general guidance.";
  }
}

/**
 * POST /api/ai/chat
 * Main chatbot endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        {
          error: "AI service not configured. Please add GOOGLE_API_KEY to environment variables.",
        },
        { status: 500 }
      );
    }

    // Build context
    const systemContext = buildSystemContext();
    const userContext = await getUserContext(user.id, supabase);

    // Initialize Gemini model with optimal settings
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.9, // Creative but focused
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    });

    // Build conversation history
    const history = conversationHistory.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Start chat session with context
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemContext + userContext }],
        },
        {
          role: "model",
          parts: [
            {
              text: `Hello! I'm ZAi, your intelligent career assistant. I understand the ZigEx platform and your profile. I'm here to help you discover opportunities, improve your applications, and advance your career. How can I assist you today?`,
            },
          ],
        },
        ...history,
      ],
    });

    // Send message and get response
    const result = await chat.sendMessage(message);
    const response = result.response;
    const aiMessage = response.text();

    // Log interaction for analytics (optional)
    try {
      await supabase.from("ai_interactions").insert({
        user_id: user.id,
        interaction_type: "chat",
        context: { message },
        response: { text: aiMessage },
        created_at: new Date().toISOString(),
      });
    } catch (logError) {
      // Don't fail the request if logging fails
      console.error("Failed to log interaction:", logError);
    }

    // Return response
    return NextResponse.json({
      success: true,
      message: aiMessage,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    // Handle specific Gemini errors
    if (error.message?.includes("API key")) {
      return NextResponse.json(
        { error: "Invalid API key. Please check your configuration." },
        { status: 500 }
      );
    }

    if (error.message?.includes("quota")) {
      return NextResponse.json(
        { error: "API quota exceeded. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: "An error occurred while processing your request.",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/chat
 * Health check endpoint
 */
export async function GET() {
  const isConfigured = !!process.env.GOOGLE_API_KEY;

  return NextResponse.json({
    status: "operational",
    configured: isConfigured,
    model: "gemini-2.0-flash-exp",
    features: [
      "Context-aware conversations",
      "Personalized recommendations",
      "Opportunity discovery",
      "Application assistance",
      "Career guidance",
    ],
    timestamp: new Date().toISOString(),
  });
}
