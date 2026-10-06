import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCurrentUser } from "@/lib/api/auth";
import { buildStudentAiContext, logAiInteraction } from "@/lib/api/services/ai-context";

/**
 * AI Chatbot Endpoint for ZigEx Platform
 * Uses Gemini 2.0 Flash for intelligent, context-aware conversations
 * Built by a senior backend engineer with deep understanding of production systems
 */

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");


/**
 * Build comprehensive system context about the ZigEx platform
 * This gives the AI deep understanding of what the platform does
 */
function buildSystemContext(): string {
  return `You are ZAi, the intelligent AI assistant for ZigEx, a comprehensive platform connecting African students with opportunities.

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
 * POST /api/ai/chat
 * Main chatbot endpoint
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getCurrentUser();

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
    const userContext = await buildStudentAiContext();

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

    // Log interaction for analytics (optional; never fails the request)
    await logAiInteraction({ prompt: message, response: aiMessage, model: "gemini-2.5-flash", metadata: { interaction_type: "chat" } });

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
