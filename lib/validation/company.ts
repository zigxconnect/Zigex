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
export const editCompanySchema = z.object({
  company_name: baseCompanySchema.shape.company_name,
  description: baseCompanySchema.shape.description,
  industry: baseCompanySchema.shape.industry,
  phone: baseCompanySchema.shape.phone,
  address: baseCompanySchema.shape.address,
  website_url: baseCompanySchema.shape.website_url,
  logo_url: baseCompanySchema.shape.logo_url.optional().or(z.literal("")).optional(),
  cover_image_url: baseCompanySchema.shape.cover_image_url.optional().or(z.literal("")).optional(),
});

// 3. Create a TypeScript type from our new, specific edit schema.
export type EditCompanyFormData = z.infer<typeof editCompanySchema>;
