// /app/api/internship-agent/artifact/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface SmartApplyRequest {
  companyName: string;
  userProfile: { name: string; university: string; skills: string[]; };
}

const createCoverLetterPrompt = (companyName: string, userProfile: any) => {
  return `
    As an expert career coach, write a professional and compelling cover letter for a student applying for an internship at **${companyName}**.

    **Student Profile:**
    - Name: ${userProfile.name}
    - University: ${userProfile.university}
    - Key Skills: ${userProfile.skills.join(', ')}

    **Instructions:**
    1.  **Structure:** Follow a standard cover letter format: Introduction (state purpose), Body Paragraphs (connect 2-3 key skills to the company's potential needs), and a Conclusion (reiterate interest and provide a call to action).
    2.  **Tone:** Professional, enthusiastic, and confident.
    3.  **Content:** Speculate on how the student's skills would bring value to a forward-thinking company like ${companyName}.
    4.  **Formatting:** Use proper paragraph breaks.
    5.  **Final Output:** The response must contain *only* the text of the cover letter, starting with "Dear Hiring Manager," and ending with the student's name. Do not include any other explanatory text.
  `;
};

export async function POST(req: NextRequest) {
  try {
    const { companyName, userProfile } = (await req.json()) as SmartApplyRequest;
    if (!companyName || !userProfile) {
      return new NextResponse('Company name and user profile are required', { status: 400 });
    }

    console.log(`[SmartApply] Generating application for ${userProfile.name} at ${companyName}`);

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = createCoverLetterPrompt(companyName, userProfile);
    const result = await model.generateContentStream(prompt);

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          controller.enqueue(new TextEncoder().encode(chunk.text()));
        }
        controller.close();
      },
    });

    return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

  } catch (error) {
    console.error('[SmartApply API Error]', error);
    return new NextResponse('Internal server error during artifact generation', { status: 500 });
  }
}