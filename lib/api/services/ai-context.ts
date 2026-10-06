import "server-only";
import { serverApi } from "../server-client";
import { whenAvailable } from "../errors";
import { getMyProfile } from "./profile";
import { listApplications } from "./applications";

/**
 * Data access for the AI features. The language-model calls stay in the
 * Next.js routes; the profile and applications come from the backend.
 */

/** The prompt context describing the signed-in student, as the AI routes used to build it. */
export async function buildStudentAiContext({ withApplications = true } = {}): Promise<string> {
  try {
    const profile = await getMyProfile();
    if (!profile) return "User profile not found. Provide general guidance.";

    let context = `\n## USER PROFILE\n`;
    context += `- Name: ${profile.full_name || "Not specified"}\n`;
    context += `- University: ${profile.university || "Not specified"}\n`;
    context += `- Field of Study: ${profile.field_of_study || "Not specified"}\n`;
    context += `- GPA: ${profile.gpa || "Not specified"}\n`;
    context += `- Graduation Year: ${profile.graduation_year || "Not specified"}\n`;
    context += `- Location: ${profile.location || "Not specified"}\n`;
    if (profile.hard_skills?.length) context += `- Technical Skills: ${profile.hard_skills.join(", ")}\n`;
    if (profile.soft_skills?.length) context += `- Soft Skills: ${profile.soft_skills.join(", ")}\n`;
    if (profile.preferred_industries?.length) context += `- Career Interests: ${profile.preferred_industries.join(", ")}\n`;
    if (profile.interests?.length) context += `- Interests: ${profile.interests.join(", ")}\n`;

    if (withApplications) {
      const internships = (await listApplications().catch(() => []))
        .filter((app) => app.application_type === "internship" || app.internship_id)
        .slice(0, 3);
      if (internships.length > 0) {
        context += `\n## RECENT APPLICATIONS\n`;
        internships.forEach((app, index) => {
          const internship = app.internship ?? {};
          const company = internship.company?.company_name ?? internship.company_profiles?.company_name;
          context += `${index + 1}. ${internship.title || "Unknown"} at ${company || "Unknown Company"} - Status: ${app.status}\n`;
        });
      }
    }

    context += `\n**Use this information to personalize your responses and provide relevant advice.**\n`;
    return context;
  } catch (error) {
    console.error("Error building AI user context:", error);
    return "Unable to fetch user profile. Provide general guidance.";
  }
}

/**
 * Logs an AI exchange (POST /ai/interactions, spec'd). Never throws: a
 * missing endpoint or failed log must not break the chat.
 */
export async function logAiInteraction(entry: { prompt: string; response: string; model: string; metadata?: Record<string, unknown> }) {
  try {
    await whenAvailable(() => serverApi.post("/ai/interactions", entry), undefined);
  } catch (error) {
    console.error("Failed to log AI interaction:", error);
  }
}
