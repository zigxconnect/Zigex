// /app/api/smartapply/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Define the expected structure for the request body
interface SmartApplyRequest {
  companyName: string;
  userProfile: {
    name: string;
    university: string;
    skills: string[];
    // We can add major, bio, etc. in the future
  };
}

/**
 * Creates a detailed prompt for the AI to generate a high-quality cover letter.
 */
const createCoverLetterPrompt = (companyName: string, userProfile: any) => {
  return `
    As an expert career coach, write a professional and compelling cover letter for a student applying for an internship at **${companyName}**.

    **Student Profile:**
    - Name: ${userProfile.name}
    - University: ${userProfile.university}
    - Key Skills: ${userProfile.skills.join(', ')}

    **Instructions:**
    1.  **Structure:** Create a standard cover letter format: Introduction (state purpose), Body Paragraphs (connect skills to the company's potential needs), and a Conclusion (reiterate interest and call to action).
    2.  **Tone:** Professional, enthusiastic, and confident.
    3.  **Content:** Highlight 2-3 of the student's key skills. Speculate on how these skills would benefit a forward-thinking company like ${companyName}.
    4.  **Formatting:** Use proper paragraph breaks with a single empty line between them.
    5.  **Final Output:** The response should contain *only* the text of the cover letter, starting with "Dear Hiring Manager," and ending with the student's name. Do not include any other explanatory text.
  `;
};

export async function POST(req: NextRequest) {
  try {
    const { companyName, userProfile } = (await req.json()) as SmartApplyRequest;

    if (!companyName || !userProfile) {
      return NextResponse.json({ error: 'Company name and user profile are required' }, { status: 400 });
    }

    console.log(`[SmartApply] Generating application for ${companyName}`);

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = createCoverLetterPrompt(companyName, userProfile);

    const result = await model.generateContent(prompt);
    const coverLetterText = result.response.text();

    return NextResponse.json({ coverLetterText });

  } catch (error) {
    console.error('[SmartApply API Error]', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}