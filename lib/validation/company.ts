import { z } from "zod";

// 1. This is the BASE schema that matches your database table exactly.
export const baseCompanySchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  company_name: z.string().min(2, "Company name is required."),
  email: z.string().email(), // This is required in the database
  description: z
    .string()
    .min(10, "A description of at least 10 characters is required."),
  industry: z.string().optional(),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  website_url: z
    .string()
    .url({ message: "Please enter a valid URL." })
    .optional()
    .or(z.literal("")),
  logo_url: z
    .string()
    .url({ message: "Please enter a valid URL." })
    .optional()
    .or(z.literal("")),
  cover_image_url: z
    .string()
    .url({ message: "Please enter a valid URL." })
    .optional()
    .or(z.literal("")),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// 2. THE FIX IS HERE:
//    We create a NEW schema specifically for the edit form by "picking"
//    only the fields that are actually editable on the page.
export const editCompanySchema = baseCompanySchema.pick({
  company_name: true,
  description: true,
  industry: true,
  phone: true,
  address: true,
  website_url: true,
  logo_url: true,
  cover_image_url: true,
});

// 3. Create a TypeScript type from our new, specific edit schema.
export type EditCompanyFormData = z.infer<typeof editCompanySchema>;
