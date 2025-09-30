import { z } from "zod";


export const companyVerificationSchema = z.object({
  company_id: z.string().uuid(),
  company_name: z.string().min(2),
  email: z.string().email(),
  verification_level: z.enum(['level1', 'level2', 'level3']).default('level1'),
  location: z.string().min(2),
  industry: z.string().min(2),
  website_url: z.string().url().optional(),
  registration_number: z.string().optional(),
  certificate_url: z.string().optional(), // file URL stored in database / storage
  phone: z.string(),
  tax_id: z.string(),
  proof_of_address: z.string().optional(), // could be file URL or base64 reference
  representative_id: z.string().optional(),
})


export const updateCompanyVerificationSchema = companyVerificationSchema.omit({
  company_id: true,
})