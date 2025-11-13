import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";

export const profileSchema = z.object({
  // --- Step 1 ---
  first_name: z.string().min(2, { message: "First name is required." }),
  last_name: z.string().min(2, { message: "Last name is required." }),
  phone: z
    .string()
    .min(10, { message: "Please enter a valid phone number." })
    .refine(isValidPhoneNumber, { message: "The phone number is invalid." }),
  location: z.string().min(2, { message: "Location is required." }),
  about: z
    .string()
    .min(20, { message: "Tell us more about yourself (min 20 characters)." }),

  // --- Step 2 ---
  university: z.string().min(1, { message: "University name is required." }),
  degree: z.string().min(1, { message: "Degree is required." }),
  field_of_study: z.string().min(1, { message: "Field of study is required." }),

  graduation_year: z.preprocess(
    (val) => (val === "" ? null : val),
    z.coerce
      .number({ invalid_type_error: "Please enter a valid year." })
      .int()
      .min(1950, { message: "Please enter a valid year." })
      .max(new Date().getFullYear() + 10, {
        message: "Please enter a valid future year.",
      })
      .nullable()
  ),

  gpa: z.preprocess(
    (val) => (val === "" ? null : val),
    z.coerce
      .number({ invalid_type_error: "GPA must be a number." })
      .min(0, { message: "GPA cannot be negative." })
      .max(5, { message: "GPA seems too high." })
      .nullable()
  ),

  // --- Step 3 ---
  hard_skills: z
    .array(z.string())
    .min(1, { message: "Add at least one hard skill." }),
  soft_skills: z
    .array(z.string())
    .min(1, { message: "Add at least one soft skill." }),
  languages: z
    .array(z.string())
    .min(1, { message: "Add at least one language." }),
  portfolio_url: z.union([
    z.literal(""),
    z.string().url({ message: "Please enter a valid URL." }),
  ]),
  github_url: z.union([
    z.literal(""),
    z
      .string()
      .url({ message: "Please enter a valid URL." })
      .refine((url) => url.includes("github.com"), {
        message: "URL must be a valid GitHub profile link.",
      }),
  ]),
  linkedin_url: z.union([
    z.literal(""),
    z
      .string()
      .url({ message: "Please enter a valid URL." })
      .refine((url) => url.includes("linkedin.com/in/"), {
        message: "Please enter a valid LinkedIn profile URL.",
      }),
  ]),

  // --- Step 4 ---
  previous_roles: z.array(z.string()).optional(),
  preferred_industries: z
    .array(z.string())
    .min(1, { message: "Select at least one industry." }),
  work_mode: z.enum(["Remote", "On-site", "Hybrid"], {
    required_error: "Please select your preferred work mode.",
  }),

  // --- Step 5 ---
  interests: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),
  accommodations: z.string().max(500).optional().or(z.literal("")),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
