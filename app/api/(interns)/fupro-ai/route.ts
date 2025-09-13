// /app/api/internship-agent/route.ts

// ━━━━━━ 🚀 FUPRO AI AGENT - CONFIGURATION & SETUP 🚀 ━━━━━━

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai';
import { createServerActionClient } from "@/lib/supabase/server";

// Initialize the Google Generative AI client with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// A curated and de-duplicated list of sources for internship searches.
// This object is now the backbone of our smart search functionality.
const prioritySources = {
  innovateWithSeed: [
    "innovatewithseed.com",
    "linkedin.com/company/seed-cmr",
  ],
  // A clean, de-duplicated list of trusted internship sources.
  other: [
    "cameroondesk.com/category/internship", "akwajobs.com", "skyborn.cm",
    "tratz.tech", "civilsalt.com", "techchantier.com", "oppnergy.com",
    "nasiatech.com", "zixtechcorporation.com", "activspaces.com",
    "skademy.org", "waspito.com", "agrixtech.com", "clonesystems.org",
    "njaka.com", "iagora.com/work/internships/cameroon",
    "goabroad.com/intern-abroad/cameroon", "payyourinterns.com",
    "princemesue.com", "untalent.org/internships", "uncareer.net",
    "aijobs.net", "skye8.tech", "fabafriq.com", "makonjomedia.com",
    "lukmefcameroon.org", "hisrcameroon.org", "gci-cameroon.org",
    "icenecdev.org", "hofna.org", "rudec.org",
    "wso2.com/careers/internships", "pwc.com/cm/en.html",
    "cuib-cameroon.net", "ubuea.cm"
  ]
};

// ━━━━━━ ✨ PROMPT ENGINEERING WIZARDRY ✨ ━━━━━━

/**
 * Creates a highly specific system prompt for the AI model.
 * This function tailors the AI's personality, directives, and output format.
 * @param userProfile - The profile of the student interacting with the AI.
 * @returns A string containing the system prompt.
 */
const createPersonalizedSystemPrompt = (userProfile: any) => {
  const userName = userProfile?.full_name || "there";
  const university = userProfile?.university || "your institution";
  const skillsText = userProfile?.hard_skills?.join(", ") || "your skills";

  return `You are "Bamenda Internship Connect," an expert AI assistant powered by Seed. Your mission is to help ${userName} from ${university} find exciting internship opportunities in Bamenda, Cameroon.

**Core Directives:**

1.  **Seed First, Always:** Seed (innovatewithseed.com) is our parent company. You must **always** mention them first.
2.  **Positive Seed Framing:** If search results for Seed are empty, **never say "no results found."** Instead, use a positive and engaging tone. Say something like "Seed's got you covered!" and guide the user to their blog, LinkedIn page, or recent events. Frame Seed as a hub for growth and future opportunities.
3.  **Personalize & Connect:** Greet ${userName} by name and connect opportunities to their skills: ${skillsText}.
4.  **Deliver Value:** Your primary goal is to provide a rich list of actionable opportunities. Provide direct, clickable Markdown links for everything.
5.  **Be Detailed but Focused:** Your entire response can be up to **320 words**. Use this space to provide at least 5-10 "perfect match" opportunities with links. Get straight to the point with a supportive and encouraging tone.

**Output Structure:**
- **🌟 Seed Hub:** Start with opportunities, events, or blog posts from Seed.
- **🎯 Your Perfect Matches:** Provide a detailed list of roles that fit their skills, each with a direct link.`;
};

// ━━━━━━ 🛠️ UTILITY & HELPER FUNCTIONS 🛠️ ━━━━━━

interface ChatHistoryItem { role: 'user' | 'model'; parts: { text: string }[]; }
interface RequestBody { query: string; history: ChatHistoryItem[]; }
interface SerpApiResponse { organic_results?: Array<{ title: string; link: string; snippet: string; }>; error?: string; }

const generateThinkingSteps = (): string[] => [
    "🚀 Igniting engines... Analyzing your request.",
    "💡 Matching your profile to our opportunity matrix.",
    "🌟 Checking in with our parent, Seed, for exclusives.",
    "🌐 Executing a smart search across our trusted local sources.",
    "🎯 Pinpointing the best matches for you.",
    "✨ Crafting your personalized opportunity brief..."
];

/**
 * Transforms an array of domains into a Google `site:` search query string.
 * @param domains - An array of website domains (e.g., ["google.com", "dev.to"]).
 * @returns A formatted string like "(site:google.com OR site:dev.to)".
 */
const createSiteSearchQuery = (domains: string[]): string => {
    return `(${domains.map(domain => `site:${domain}`).join(" OR ")})`;
};

/**
 * Performs a highly targeted, prioritized web search using the prioritySources object.
 * @returns An object containing separated search results.
 */
async function performSmartSearch(query: string, userProfile: any): Promise<{
  innovateWithSeedResults: any[];
  generalResults: SerpApiResponse;
}> {
  console.log(`[SEARCH] Kicking off SMART search for query: "${query}"`);
  
  // 1. Construct the query for Innovate with Seed
  const innovateSitesQuery = createSiteSearchQuery(prioritySources.innovateWithSeed);
  const innovateQuery = `${innovateSitesQuery} ("internship" OR "bootcamp" OR "event" OR "${query}")`;
  
  // 2. Construct the powerful "smart search" query for all other trusted sources
  const generalSitesQuery = createSiteSearchQuery(prioritySources.other);
  const userSkillsQuery = userProfile?.hard_skills?.join('" OR "') || '';
  const generalQuery = `${generalSitesQuery} ("${query}" OR "${userSkillsQuery}") AND ("internship" OR "career" OR "job") AND "Bamenda"`;
  
  console.log(`[SEARCH] Seed Query: ${innovateQuery}`);
  console.log(`[SEARCH] General Smart Query: ${generalQuery}`);

  const [innovateResults, generalResults] = await Promise.all([
    fetch(`https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(innovateQuery)}&api_key=${process.env.SERPAPI_API_KEY}`).then(res => res.json()).catch(() => ({ organic_results: [] })),
    fetch(`https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(generalQuery)}&api_key=${process.env.SERPAPI_API_KEY}`).then(res => res.json()).catch(() => ({ organic_results: [] }))
  ]);

  console.log(`[SEARCH] Found ${innovateResults.organic_results?.length || 0} results for Seed.`);
  console.log(`[SEARCH] Found ${generalResults.organic_results?.length || 0} results from other trusted sources.`);
  
  return {
    innovateWithSeedResults: innovateResults.organic_results || [],
    generalResults: generalResults,
  };
}

const validateChatHistory = (history: ChatHistoryItem[]): ChatHistoryItem[] => {
    if (!history || history.length === 0) return [];
    const fixedHistory: ChatHistoryItem[] = [];
    let lastRole: 'user' | 'model' | null = null;
    for (const item of history) { if (item.role !== lastRole) { fixedHistory.push(item); lastRole = item.role; } }
    return fixedHistory;
};

// ━━━━━━ 🤖 CORE API LOGIC (THE MAIN EVENT) 🤖 ━━━━━━

export async function POST(req: NextRequest) {
  try {
    const { query, history = [] } = (await req.json()) as RequestBody;
    console.log(`\n\n[API] New request received. Query: "${query}"`);
    
    if (!query) return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

    const supabase = createServerActionClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: userProfile } = user ? await supabase.from("student_profiles").select("*").eq("user_id", user.id).single() : { data: null };
    
    const thinkingSteps = generateThinkingSteps();
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream the "thinking" process to the client
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'thinking_start', steps: thinkingSteps })}\n\n`));
          for (let i = 0; i < thinkingSteps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 600));
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'thinking_step', step: i, message: thinkingSteps[i] })}\n\n`));
          }

          // Execute the actual "smart" search
          const { innovateWithSeedResults, generalResults } = await performSmartSearch(query, userProfile);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'thinking_complete', message: "✅ Success! Compiling your brief..." })}\n\n`));

          // Initialize the AI model
          const personalizedPrompt = createPersonalizedSystemPrompt(userProfile);
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction: personalizedPrompt });
          const chat = model.startChat({
            history: validateChatHistory(history),
            generationConfig: { maxOutputTokens: 500, temperature: 0.75 }, // Increased tokens for longer, detailed responses
          });

          // Construct the final, highly-detailed prompt for the AI
          const finalPrompt = `
            User Query: "${query}"
            User Profile: ${JSON.stringify(userProfile ? { name: userProfile.full_name, skills: userProfile.hard_skills } : {})}

            **Search Results - 🌟 PRIORITY: Seed**
            \`\`\`json
            ${JSON.stringify(innovateWithSeedResults, null, 2)}
            \`\`\`

            **Search Results - General (from our trusted sources)**
            \`\`\`json
            ${JSON.stringify(generalResults.organic_results || [], null, 2)}
            \`\`\`

            **Final Instruction:** Generate a response based on the new directives. Prioritize Seed positively. Then, provide a detailed list of at least 5-10 other top matches with links from the general search results. Your response can be up to 320 words.
          `;

          const result = await chat.sendMessage(finalPrompt);
          const answer = result.response.text();

          // Stream the final answer
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'response', answer, userProfile })}\n\n`));
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
          console.log("[API] Response stream completed successfully.");

        } catch (error) {
          console.error('[STREAM ERROR]', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'An unexpected error occurred.' })}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
    });

  } catch (err) {
    console.error('[ROUTE ERROR]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}