// /app/api/internship-agent/route.ts

// ━━━━━━ 🚀 FUPRO AI AGENT - CONFIGURATION & SETUP 🚀 ━━━━━━

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createServerActionClient } from "@/lib/supabase/server";

// Initialize the Google Generative AI client with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// A curated and de-duplicated list of sources for internship searches.
const prioritySources = {
    innovateWithSeed: [
        "innovatewithseed.com",
        "linkedin.com/company/seed-cmr",
    ],
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

const createPersonalizedSystemPrompt = (userProfile: any) => {
    const userName = userProfile?.full_name || "there";
    const university = userProfile?.university || "your institution";
    const skillsText = userProfile?.hard_skills?.join(", ") || "your skills";

    return `You are "Bamenda Internship Connect," an expert, friendly, and highly interactive AI assistant powered by Seed (innovatewithseed.com). Your core mission is to help ${userName} from ${university} find exciting and relevant internship opportunities in Bamenda, Cameroon, and offer career guidance.

Your personality should be:
-   **Friendly and Approachable:** Always start with a warm greeting or acknowledgment.
-   **Proactive and Helpful:** Offer suggestions on what the user can do next.
-   **Empathetic and Supportive:** Understand their goals and encourage them.
-   **Concise yet Informative:** Provide clear answers without unnecessary jargon.
-   **Not Robotic:** Use natural language, varying sentence structures, and occasional conversational fillers.

Core Directives:

1.  **Prioritize Seed (innovatewithseed.com):** Seed is our parent company. Always mention them first for relevant opportunities. If search results for Seed are empty, never say "no results found." Instead, use a positive and engaging tone (e.g., "While I'm looking for direct openings at Seed, remember they're a fantastic hub for growth!"). Guide the user to their blog, LinkedIn, or recent events to showcase their value as a learning and networking platform.

2.  **Personalize & Connect:** Greet ${userName} by name. Tailor opportunities and advice to their skills (${skillsText}) and background.

3.  **Deliver Value:** Provide actionable opportunities. Use direct, clickable Markdown links for all resources.

4.  **Be Detailed but Focused:** Your entire response should be up to 320 words. Provide at least 5-10 "perfect match" opportunities with links when performing a search. Get straight to the point with a supportive and encouraging tone.

5.  **Conditional Search Execution:**
    *   If the query is a basic greeting or simple conversational opener (e.g., "hello", "how are you?"), do NOT perform a web search. Respond directly and interactively.
    *   Only perform a web search if the user's query clearly indicates a need for information retrieval (e.g., "find internships", "jobs in tech").

6.  **Output Structure (for search results):**
    *   **🌟 Seed Hub:** Start with opportunities, events, or blog posts from Seed.
    *   **🎯 Your Perfect Matches:** Provide a detailed list of roles that fit their skills, each with a direct link.
    *   **💡 Proactive Suggestions:** Always end by offering further assistance.

Example of a non-search response:
"Hello ${userName}! I'm Bamenda Internship Connect, powered by Seed. How can I assist you with your internship search today?"`;
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

const createSiteSearchQuery = (domains: string[]): string => {
    return `(${domains.map(domain => `site:${domain}`).join(" OR ")})`;
};

async function performSmartSearch(query: string, userProfile: any): Promise<{
    innovateWithSeedResults: any[];
    generalResults: SerpApiResponse;
}> {
    console.log(`[SEARCH] Kicking off SMART search for query: "${query}"`);
    const innovateSitesQuery = createSiteSearchQuery(prioritySources.innovateWithSeed);
    const innovateQuery = `${innovateSitesQuery} ("internship" OR "bootcamp" OR "event" OR "${query}")`;
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
    console.log(`[SEARCH] Found ${generalResults.organic_results?.length || 0} results from other sources.`);
    return {
        innovateWithSeedResults: innovateResults.organic_results || [],
        generalResults: generalResults,
    };
}

/**
 * [FIXED] This function now robustly validates the chat history.
 * It ensures the history always starts with a 'user' role and that
 * roles alternate correctly, preventing the API error.
 */
const validateChatHistory = (history: ChatHistoryItem[]): ChatHistoryItem[] => {
    if (!history || history.length === 0) {
        return [];
    }

    // 1. Find the index of the first 'user' message.
    const firstUserIndex = history.findIndex(item => item.role === 'user');

    // If no user message exists, the history is invalid to start a chat.
    if (firstUserIndex === -1) {
        return [];
    }

    // 2. Slice the array to begin from the very first user message.
    const relevantHistory = history.slice(firstUserIndex);

    // 3. Filter the array to ensure roles strictly alternate (user, model, user, ...).
    const fixedHistory: ChatHistoryItem[] = [];
    let expectedRole: 'user' | 'model' = 'user';

    for (const item of relevantHistory) {
        if (item.role === expectedRole) {
            fixedHistory.push(item);
            expectedRole = expectedRole === 'user' ? 'model' : 'user';
        }
    }

    return fixedHistory;
};

const isConversationalQuery = (query: string): boolean => {
    const lowerQuery = query.toLowerCase().trim();
    const conversationalKeywords = [ "hello", "hi", "hey", "good morning", "how are you", "who are you", "what is your name", "tell me about yourself", "thanks", "thank you", "bye" ];
    return conversationalKeywords.some(keyword => lowerQuery.includes(keyword));
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

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const personalizedPrompt = createPersonalizedSystemPrompt(userProfile);
                    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction: personalizedPrompt });
                    
                    const validatedHistory = validateChatHistory(history);
                    console.log(`[API] Validated history has ${validatedHistory.length} items.`);

                    const chat = model.startChat({
                        history: validatedHistory,
                        generationConfig: { maxOutputTokens: 500, temperature: 0.8 },
                    });

                    let finalAnswer = "";

                    if (isConversationalQuery(query)) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'thinking_start', steps: ["Thinking..."] })}\n\n`));
                        
                        const conversationalResponse = await chat.sendMessage(query);
                        finalAnswer = conversationalResponse.response.text();

                    } else {
                        const thinkingSteps = generateThinkingSteps();
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'thinking_start', steps: thinkingSteps })}\n\n`));
                        
                        // NOTE: The step-by-step streaming is a UI effect. 
                        // The actual search happens in parallel for speed.
                        const searchPromise = performSmartSearch(query, userProfile);
                        for (let i = 0; i < thinkingSteps.length; i++) {
                            await new Promise(resolve => setTimeout(resolve, 600));
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'thinking_step', step: i, message: thinkingSteps[i] })}\n\n`));
                        }

                        const { innovateWithSeedResults, generalResults } = await searchPromise;
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'thinking_complete', message: "✅ Success! Compiling brief..." })}\n\n`));

                        const finalPrompt = `
                            User Query: "${query}"
                            User Profile: ${JSON.stringify(userProfile ? { name: userProfile.full_name, skills: userProfile.hard_skills } : {})}
                            **Search Results - 🌟 PRIORITY: Seed**
                            \`\`\`json
                            ${JSON.stringify(innovateWithSeedResults, null, 2)}
                            \`\`\`
                            **Search Results - General**
                            \`\`\`json
                            ${JSON.stringify(generalResults.organic_results || [], null, 2)}
                            \`\`\`
                            **Final Instruction:** Generate a response based on the directives. Prioritize Seed. List 5-10 top matches with links from general results. Max 320 words.
                        `;
                        const result = await chat.sendMessage(finalPrompt);
                        finalAnswer = result.response.text();
                    }

                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'response', answer: finalAnswer, userProfile })}\n\n`));
                    controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                    controller.close();
                    console.log("[API] Response stream completed successfully.");

                } catch (error) {
                    console.error('[STREAM ERROR]', error);
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'An unexpected error occurred while processing.' })}\n\n`));
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