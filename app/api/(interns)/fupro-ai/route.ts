// // /app/api/internship-agent/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai';

// // Initialize the Generative AI client
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// // --- A more focused and relevant list of websites ---
// // This list is now a starting point, not the only source.
// const baseInternshipSources = [
// // Your list of websites remains the same
// // Job & Internship Aggregators
// "https://www.cameroondesk.com/category/internship/",
// "https://www.akwajobs.com/",
// "https://www.iagora.com/work/internships/cameroon",
// "https://www.goabroad.com/intern-abroad/cameroon",
// "https://www.gooverseas.com/internships-abroad/cameroon",
// "https://payyourinterns.com/",
// "https://princemesue.com/",
// "https://untalent.org/internships",
// "https://uncareer.net/",
// "https://aijobs.net/",
// "https://skye8.tech/",
// // Tech, Creative & Innovation Hubs
// "https://innovatewithseed.com/",
// "https://www.skyborn.cm/",
// "https://tratz.tech/",
// "https://civilsalt.com/",
// "https://techchantier.com/",
// "https://www.oppnergy.com/",
// "https://nasiatech.com/",
// "https://www.zixtechcorporation.com/",
// "https://www.activspaces.com/",
// "https://skademy.org/",
// "https://waspito.com/",
// "http://agrixtech.com/",
// "https://www.clonesystems.org/",
// "https://njaka.com/",
// // Media & Digital Marketing
// "https://fabafriq.com/",
// "https://www.makonjomedia.com/",
// // NGOs and Development Organizations
// "https://lukmefcameroon.org/",
// "https://www.hisrcameroon.org/",
// "https://gci-cameroon.org/",
// "https://www.icenecdev.org/",
// "https://hofna.org/",
// "http://rudec.org/",
// // Professional Services & Other Institutions
// "https://www.wso2.com/careers/internships/", // WSO2 Main Internship Page
// "https://www.pwc.com/cm/en.html", // PwC Cameroon
// "https://www.cuib-cameroon.net/", // Catholic University Institute of Buea (CUIB)
// "https://www.ubuea.cm/" // University of Buea
// ];
// // --- The New, More Intelligent System Prompt ---
// const systemPrompt = `You are "Bamenda Internship Connect," an expert AI assistant. Your sole purpose is to help students and recent graduates find internship opportunities specifically within Bamenda, Cameroon. You must be encouraging, resourceful, and precise.

// **Your Core Directives:**

// 1.  **Acknowledge and Understand:** Start by acknowledging the user's request to show you've understood it.
// 2.  **Analyze and Synthesize, Don't Just List:** Your primary goal is to use the provided search results to answer the user's query. The search results are your main source of truth. The static list of URLs is a secondary reference.
// 3.  **Prioritize Direct Opportunities:** Scan the search results for any direct mentions of "internships," "careers," "recruitment," or "jobs" related to companies in Bamenda.
// 4.  **Company Identification:** If no direct internships are found, identify the official websites of relevant companies in Bamenda from the search results. Suggest these as places the user can look.
// 5.  **Actionable & Clickable Links:**
//     *   **NEVER** say "check the websites I listed" or "visit the sites above."
//     *   Instead, for every company, opportunity, or resource you mention, you **MUST** provide a direct, clickable Markdown link. Example: \`[InnovateWithSeed](https://innovatewithseed.com/internshipts, https://innovatewithseed.com/blog)\`.
//     *   If you find a potential company but not a specific careers page, link to their homepage: \`[Traitz Tech](https://tratz.tech)\`.
// 6.  **Structured & Clear Formatting:**
//     *   Present your findings in a clear, well-structured Markdown format. Use headings, bold text, and bullet points to make the information easy to digest.
//     *   If you find specific openings, list them with the Title, Company, and a direct link to the application or careers page.
// 7.  **Handling No Results:** If after a thorough analysis of the search results, you still find no relevant companies or openings, provide a helpful and encouraging response. Suggest broadening their search terms or checking back later, and provide links to the most reliable general job portals from the base list.
// 8.  **Maintain Context:** Use the chat history to understand the flow of the conversation and answer follow-up questions intelligently.
// 9.  **Stay Focused:** If the user asks about anything other than internships in Bamenda or Cameroon, gently guide them back to your purpose. Respond with: "My focus is on helping you find internships in Bamenda. How can I assist you with that search?"`;

// interface ChatHistoryItem {
//   role: 'user' | 'model';
//   parts: { text: string }[];
// }

// interface RequestBody {
//   query: string;
//   history: ChatHistoryItem[]; // Expect chat history from the frontend
// }

// interface SerpApiResponse {
//   organic_results?: Array<{
//     title: string;
//     link: string;
//     snippet: string;
//   }>;
//   error?: string;
// }

// export async function POST(req: NextRequest) {
//   try {
//     const { query, history = [] } = (await req.json()) as RequestBody;
    
//     if (!query) {
//       return NextResponse.json({ error: 'Query is required' }, { status: 400 });
//     }

//     // Validate required environment variables
//     if (!process.env.GEMINI_API_KEY) {
//       return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
//     }

//     if (!process.env.SERPAPI_API_KEY) {
//       return NextResponse.json({ error: 'SERPAPI_API_KEY not configured' }, { status: 500 });
//     }

//     // --- Dynamic & Targeted Search Query ---
//     // Make the search query more specific to Bamenda to get better results.
//     const searchQuery = `${query} in Bamenda Cameroon`;
//     const serpApiUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(
//       searchQuery
//     )}&api_key=${process.env.SERPAPI_API_KEY}`;
    
//     let searchResults: SerpApiResponse = {};
    
//     try {
//       const response = await fetch(serpApiUrl);
//       if (response.ok) {
//         searchResults = await response.json();
//       } else {
//         // Silently fail or log if SerpApi fails, so the bot can still function.
//         console.warn(`SerpApi request failed with status: ${response.status}`);
//       }
//     } catch (apiError) {
//       console.error("Error fetching from SerpApi:", apiError);
//       // Continue with empty search results
//     }

//     // --- Initialize the Model with History ---
//     const model = genAI.getGenerativeModel({ 
//       model: 'gemini-1.5-flash', 
//       systemInstruction: systemPrompt 
//     });
    
//     const chat: ChatSession = model.startChat({
//       history: history,
//       generationConfig: {
//         maxOutputTokens: 1000,
//       },
//     });

//     // --- Construct a Richer Prompt for the Model ---
//     const finalPrompt = `
// **Web Search Results for "${searchQuery}":**
// \`\`\`json
// ${JSON.stringify(searchResults, null, 2)}
// \`\`\`

// **Base List of Reliable Internship Sources (for reference):**
// \`\`\`
// ${baseInternshipSources.join('\n')}
// \`\`\`

// Based on the user's query and the search results provided, please generate a helpful response.
//     `;

//     const result = await chat.sendMessage(finalPrompt);
//     const answer = result.response.text();

//     return NextResponse.json({ answer });

//   } catch (err) {
//     console.error('Error in internship-agent route:', err);
//     const errorMessage = err instanceof Error ? err.message : 'Internal server error';
//     return NextResponse.json({ error: errorMessage }, { status: 500 });
//   }
// }



// /app/api/internship-agent/route.ts
// /app/api/internship-agent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai';
import { createServerActionClient } from "@/lib/supabase/server";

// Initialize the Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const baseInternshipSources = [
  "https://www.cameroondesk.com/category/internship/",
  "https://www.akwajobs.com/",
  "https://innovatewithseed.com/",
  "https://www.skyborn.cm/",
  "https://tratz.tech/",
  "https://civilsalt.com/",
  "https://techchantier.com/",
// // Your list of websites remains the same
// Job & Internship Aggregators
"https://www.cameroondesk.com/category/internship/",
"https://www.akwajobs.com/",
"https://www.iagora.com/work/internships/cameroon",
"https://www.goabroad.com/intern-abroad/cameroon",
"https://www.gooverseas.com/internships-abroad/cameroon",
"https://payyourinterns.com/",
"https://princemesue.com/",
"https://untalent.org/internships",
"https://uncareer.net/",
"https://aijobs.net/",
"https://skye8.tech/",
// Tech, Creative & Innovation Hubs
"https://innovatewithseed.com/",
"https://www.skyborn.cm/",
"https://tratz.tech/",
"https://civilsalt.com/",
"https://techchantier.com/",
"https://www.oppnergy.com/",
"https://nasiatech.com/",
"https://www.zixtechcorporation.com/",
"https://www.activspaces.com/",
"https://skademy.org/",
"https://waspito.com/",
"http://agrixtech.com/",
"https://www.clonesystems.org/",
"https://njaka.com/",
// Media & Digital Marketing
"https://fabafriq.com/",
"https://www.makonjomedia.com/",
// NGOs and Development Organizations
"https://lukmefcameroon.org/",
"https://www.hisrcameroon.org/",
"https://gci-cameroon.org/",
"https://www.icenecdev.org/",
"https://hofna.org/",
"http://rudec.org/",
// Professional Services & Other Institutions
"https://www.wso2.com/careers/internships/", // WSO2 Main Internship Page
"https://www.pwc.com/cm/en.html", // PwC Cameroon
"https://www.cuib-cameroon.net/", // Catholic University Institute of Buea (CUIB)
"https://www.ubuea.cm/" // University of Buea
];

// Enhanced system prompt with personalization
const createPersonalizedSystemPrompt = (userProfile: any) => {
  const userName = userProfile?.full_name || "there";
  const university = userProfile?.university || "your institution";
  const skills = userProfile?.hard_skills || [];
  const skillsText = skills.length > 0 ? skills.join(", ") : "your skills";

  return `You are "Bamenda Internship Connect," an expert AI assistant helping ${userName} find personalized internship opportunities in Bamenda, Cameroon.

**User Profile Context:**
- Name: ${userName}
- University: ${university}
- Skills: ${skillsText}
- Location: Bamenda, Cameroon

**Your Enhanced Directives:**

1. **Personal Greeting:** Address the user by name (${userName}) and acknowledge their background from ${university}.

2. **Skills-Based Matching:** Prioritize internships that match their skills: ${skillsText}. When suggesting opportunities, explain how their specific skills align with the requirements.

3. **Personalized Recommendations:** 
   - Reference their university background when relevant
   - Suggest internships that complement their existing skills
   - Recommend opportunities for skill development in related areas

4. **Contextual Responses:** Use their profile information to provide more relevant advice:
   - If they have tech skills, prioritize tech companies
   - If they're from a specific university, mention any partnerships or connections
   - Tailor language and suggestions to their academic background

5. **Direct Opportunities Analysis:** Scan search results for internships matching their profile, specifically looking for:
   - Roles requiring their specific skills (${skillsText})
   - Companies that typically hire from ${university}
   - Entry-level positions suitable for their background

6. **Actionable & Clickable Links:** Always provide direct, clickable Markdown links for every opportunity or company mentioned.

7. **Structured Formatting:** Present findings with:
   - **Perfect Matches:** Opportunities that directly match their skills
   - **Growth Opportunities:** Roles that could help develop complementary skills
   - **Alternative Suggestions:** Related opportunities worth considering

8. **Encouraging Tone:** Be supportive and acknowledge their unique strengths from their academic and skill background.

9. **Stay Focused:** Keep conversations centered on internship opportunities in Bamenda, always relating back to their personal profile and goals.`;
};

interface ChatHistoryItem {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface RequestBody {
  query: string;
  history: ChatHistoryItem[];
}

interface SerpApiResponse {
  organic_results?: Array<{
    title: string;
    link: string;
    snippet: string;
  }>;
  error?: string;
}

// Helper function to validate and fix chat history
function validateChatHistory(history: ChatHistoryItem[]): ChatHistoryItem[] {
  if (!history || history.length === 0) {
    return [];
  }

  const validHistory = history.filter(item => 
    item && item.role && ['user', 'model'].includes(item.role) &&
    item.parts && Array.isArray(item.parts) && item.parts.length > 0 && item.parts[0].text
  );

  if (validHistory.length > 0 && validHistory[0].role !== 'user') {
    validHistory.shift();
  }

  const fixedHistory: ChatHistoryItem[] = [];
  let expectedRole: 'user' | 'model' = 'user';
  
  for (const item of validHistory) {
    if (item.role === expectedRole) {
      fixedHistory.push(item);
      expectedRole = expectedRole === 'user' ? 'model' : 'user';
    }
  }

  return fixedHistory;
}

export async function POST(req: NextRequest) {
  try {
    const { query, history = [] } = (await req.json()) as RequestBody;
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY || !process.env.SERPAPI_API_KEY) {
      return NextResponse.json({ error: 'API keys not configured' }, { status: 500 });
    }

    let userProfile = null;
    try {
      const supabase = createServerActionClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("student_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
        userProfile = profile;
      }
    } catch (profileError) {
      console.warn("Could not fetch user profile:", profileError);
    }

    let searchQuery = `${query} internship in Bamenda Cameroon`;
    if (userProfile?.hard_skills?.length > 0) {
      const topSkills = userProfile.hard_skills.slice(0, 3).join(" ");
      searchQuery += ` ${topSkills}`;
    }

    const serpApiUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(
      searchQuery
    )}&api_key=${process.env.SERPAPI_API_KEY}`;
    
    let searchResults: SerpApiResponse = {};
    try {
      const response = await fetch(serpApiUrl);
      if (response.ok) {
        searchResults = await response.json();
      } else {
        console.warn(`SerpApi request failed with status: ${response.status}`);
      }
    } catch (apiError) {
      console.error("Error fetching from SerpApi:", apiError);
    }

    const personalizedPrompt = createPersonalizedSystemPrompt(userProfile);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash', 
      systemInstruction: personalizedPrompt 
    });

    const validatedHistory = validateChatHistory(history);
    
    const chat: ChatSession = model.startChat({
      history: validatedHistory,
      generationConfig: {
        maxOutputTokens: 1200,
        temperature: 0.7,
      },
    });

    const finalPrompt = `
**User Query:** "${query}"

**User Profile Summary:**
${userProfile ? `
- Name: ${userProfile.full_name || 'Not provided'}
- University: ${userProfile.university || 'Not provided'}
- Skills: ${userProfile.hard_skills?.join(', ') || 'Not provided'}
- Bio: ${userProfile.bio || 'Not provided'}
` : 'Profile not available - provide general assistance'}

**Web Search Results for "${searchQuery}":**
\`\`\`json
${JSON.stringify(searchResults, null, 2)}
\`\`\`

**Base Internship Sources (for reference):**
\`\`\`
${baseInternshipSources.join('\n')}
\`\`\`

Please provide a personalized response that:
1. Uses the user's name and profile information naturally
2. Matches opportunities to their specific skills and background
3. Provides actionable next steps
4. Includes relevant clickable links
5. Maintains an encouraging and supportive tone
    `;

    const result = await chat.sendMessage(finalPrompt);
    const answer = result.response.text();

    return NextResponse.json({ 
      answer,
      userProfile: userProfile ? {
        name: userProfile.full_name,
        university: userProfile.university,
        skills: userProfile.hard_skills
      } : null
    });

  } catch (err) {
    console.error('Error in internship-agent route:', err);
    const errorMessage = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}