// /app/api/internship-agent/route.ts
// ━━━━━━ 🚀 ZIGEX AI AGENT v2.0 - TAVILY-POWERED & PRODUCTION-READY 🚀 ━━━━━━

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TavilySearchAPIRetriever } from "@langchain/community/retrievers/tavily_search_api";
import { createServerActionClient } from "@/lib/supabase/server";

// --- CONFIGURATION ---
// Initialize these lazily to avoid build-time errors if env vars are missing
const getGenAI = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY environment variable not set.");
  return new GoogleGenerativeAI(key);
};

// Tavily is used inside searchWithTavily, check key there


// --- TYPE DEFINITIONS ---
interface UserProfile {
  full_name: string;
  university: string;
  hard_skills: string[];
  // Add any other relevant fields from your student_profiles table
}

interface SourceData {
  type: 'internship' | 'event' | 'program' | 'web';
  title: string;
  url?: string;
  company?: string;
  location?: string;
  date?: string;
}

interface AggregatedData {
  internships: any[];
  events: any[];
  programs: any[];
  metadata: any;
}

// ━━━━━━ 👤 USER PROFILE FETCHER ━━━━━━
// Encapsulates fetching the user's profile for personalization.
async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const supabase = await createServerActionClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("student_profiles")
      .select("full_name, university, hard_skills")
      .eq("user_id", user.id)
      .single();

    return profile as UserProfile | null;
  } catch (error) {
    console.error("[AGENT ERROR] Could not fetch user profile:", error);
    return null;
  }
}


// ━━━━━━ 📊 PLATFORM DATA CACHE ━━━━━━
// (This function remains the same - it's already optimized)
let cachedAggregatedData: AggregatedData | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

async function getAggregatedData(): Promise<AggregatedData> {
  const now = Date.now();
  if (cachedAggregatedData && (now - cacheTimestamp) < CACHE_DURATION_MS) {
    return cachedAggregatedData;
  }
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/students/aggregated-data`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed to fetch aggregated data. Status: ${response.status}`);
    const result = await response.json();
    cachedAggregatedData = result.data;
    cacheTimestamp = now;
    return cachedAggregatedData;
  } catch (error) {
    console.error('[AGENT ERROR] Failed to fetch platform data:', error);
    return { internships: [], events: [], programs: [], metadata: {} };
  }
}


// ━━━━━━ 🌐 TAVILY WEB SEARCH AGENT ━━━━━━
// This is the core of the new online search capability.
async function searchWithTavily(query: string, userProfile: UserProfile | null): Promise<SourceData[]> {
  console.log('[AGENT TAVILY] Initiating external web search.');

  // 1. Construct a highly specific, profile-driven search query for better results.
  let enhancedQuery = `Find job or internship opportunities related to: "${query}"`;
  if (userProfile?.hard_skills?.length) {
    enhancedQuery += ` for a candidate with skills in ${userProfile.hard_skills.join(', ')}.`;
  }
  enhancedQuery += " The results should include the company name, location (including 'Remote'), and a direct URL to the application page.";

  console.log(`[AGENT TAVILY] Enhanced Query: "${enhancedQuery}"`);

  // 2. Initialize the Tavily retriever. `k: 4` fetches the top 4 most relevant results.
  const retriever = new TavilySearchAPIRetriever({ k: 4 });

  try {
    // 3. Perform the search.
    const docs = await retriever.getRelevantDocuments(enhancedQuery);

    // 4. Format the raw results into our standardized SourceData structure.
    return docs.map(doc => ({
      type: 'web',
      title: doc.metadata.title || 'Untitled Web Result',
      url: doc.metadata.source || '#',
      company: doc.metadata.author || 'Unknown Company',
      location: 'Web / Remote', // Default location for web results
    }));
  } catch (error) {
    console.error("[AGENT TAVILY ERROR] Tavily search failed:", error);
    // 5. Reliability: Return an empty array on failure so the app doesn't crash.
    return [];
  }
}


// ━━━━━━ 🎯 QUERY ANALYSIS ENGINE ━━━━━━
// The gatekeeper that decides if an expensive web search is necessary.
interface QueryAnalysis {
  isConversational: boolean;
  needsExternalSearch: boolean;
}

function analyzeQuery(query: string): QueryAnalysis {
  const lowerQuery = query.toLowerCase().trim();
  const conversationalKeywords = ['hello', 'hi', 'hey', 'good morning', 'how are you', 'who are you', 'tell me about zigex'];
  const externalSearchTriggers = ['remote', 'online', 'abroad', 'europe', 'usa', 'canada', 'germany', 'find jobs'];

  // A query is conversational if it's a simple greeting or question about the platform itself.
  const isConversational = conversationalKeywords.some(k => lowerQuery.includes(k));
  // A query needs external search if it's NOT conversational AND contains triggers for external opportunities.
  const needsExternalSearch = !isConversational && externalSearchTriggers.some(k => lowerQuery.includes(k));

  return { isConversational, needsExternalSearch };
}


// ━━━━━━ ✨ DYNAMIC SYSTEM PROMPT ━━━━━━
const createSystemPrompt = () => {
  return `You are "Zigex Career Agent," an expert AI assistant for the Zigex platform in Bamenda, Cameroon. Your primary goal is to help users find internships and career opportunities.

    Your personality: Professional, encouraging, and an expert on the tech/job market.

    **CRITICAL INSTRUCTIONS:**
    1.  **SYNTHESIZE, DON'T LIST:** Do not just list data. Your value is in synthesizing information from two sources: Zigex's internal database AND real-time web search results from Tavily.
    2.  **PRIORITIZE ZIGEX:** Always mention relevant opportunities from the Zigex platform first. These are the most important.
    3.  **INTRODUCE WEB RESULTS:** When presenting opportunities from the web search, introduce them clearly (e.g., "I also found a few remote opportunities on the web that might be a good fit...").
    4.  **BE PERSONALIZED:** Use the provided user profile (skills, university) to tailor your recommendations and justify why an opportunity is a good match.
    5.  **CONVERSATIONAL MODE:** For simple greetings ("hello"), respond naturally without mentioning data or searches.
    6.  **BE RELIABLE:** If no relevant opportunities are found in either source, state that clearly. Do not invent opportunities.`;
};


// ━━━━━━ 🤖 MAIN API ROUTE HANDLER (POST) ━━━━━━
export async function POST(req: NextRequest) {
  try {
    const { query, history = [] } = await req.json();
    if (!query) return NextResponse.json({ error: 'Query is required' }, { status: 400 });

    console.log(`\n[AGENT] New Request | Query: "${query}"`);

    // --- Step 1: Analyze Intent & Fetch Profile ---
    const queryAnalysis = analyzeQuery(query);
    const [userProfile, platformData] = await Promise.all([
      getUserProfile(),
      getAggregatedData() // Fetches from cache if available
    ]);

    console.log(`[AGENT] Analysis: Conversational=${queryAnalysis.isConversational}, ExternalSearch=${queryAnalysis.needsExternalSearch}`);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          const model = getGenAI().getGenerativeModel({ model: 'gemini-2.5-flash', systemInstruction: createSystemPrompt() });
          const chat = model.startChat({ history });

          let finalAnswer: string;
          let allSources: SourceData[] = [];

          // --- Route 1: Fast Path for Conversational Queries ---
          if (queryAnalysis.isConversational) {
            const result = await chat.sendMessage(query);
            finalAnswer = result.response.text();

            // --- Route 2: Comprehensive Path for Opportunity Searches ---
          } else {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'thinking_start', steps: [
                "Analyzing your profile and request...",
                "Querying Zigex platform database...",
                ...(queryAnalysis.needsExternalSearch ? ["Searching the web for external opportunities..."] : []),
                "Synthesizing the best matches for you...",
              ]
            })}\n\n`));

            let externalSources: SourceData[] = [];
            if (queryAnalysis.needsExternalSearch) {
              externalSources = await searchWithTavily(query, userProfile);
            }

            // Prepare internal sources for display
            const platformSources: SourceData[] = [
              ...(platformData.internships || []).slice(0, 3).map((i: any) => ({ type: 'internship' as const, title: i.title, company: i.company, location: i.location, url: `/internships/${i.id}` })),
              ...(platformData.events || []).slice(0, 2).map((e: any) => ({ type: 'event' as const, title: e.title, company: e.company, date: e.start_date, url: `/events/${e.id}` })),
            ];

            allSources = [...platformSources, ...externalSources];

            // Construct the final, rich prompt for the AI
            const finalPrompt = `
                User Profile: ${JSON.stringify(userProfile, null, 2) || "Not available."}
                Original Query: "${query}"

                ---
                Source 1: Internal Zigex Platform Data
                Here are the most relevant opportunities from our platform. Prioritize these.
                \`\`\`json
                ${JSON.stringify(platformData, null, 2)}
                \`\`\`
                ---
                ${allSources.length > platformSources.length ? `
                Source 2: Real-time Web Search Results (from Tavily)
                Here are external opportunities found on the web.
                \`\`\`json
                ${JSON.stringify(externalSources, null, 2)}
                \`\`\`
                ` : ''}
                ---
                
                Now, acting as an expert career agent, synthesize all the information above to provide a helpful, personalized, and consolidated response to the user's original query.
              `;

            const result = await chat.sendMessage(finalPrompt);
            finalAnswer = result.response.text();
          }

          // --- Step 4: Stream the Final Response ---
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'response',
            answer: finalAnswer,
            // Send the combined sources to the frontend for display
            platformData: { topInternships: allSources.filter(s => s.type === 'internship' || s.type === 'web') }
          })}\n\n`));

          console.log("[AGENT] Successfully streamed response.");

        } catch (error) {
          console.error('[AGENT STREAM ERROR]', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'An error occurred during AI generation.' })}\n\n`));
        } finally {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
    });

  } catch (err) {
    console.error('[AGENT ROUTE ERROR]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}