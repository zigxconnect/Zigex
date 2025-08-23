import z from "zod";

export const companySchema = z.object({
    id: z.string().uuid().optional().readonly(),
    user_id: z.string().uuid().optional(),
    company_name: z.string().min(2).max(100),
    email: z.string().email(), // Ensure valid email format
    description: z.string().min(10),
    location:z.string().min(2),
    industry:z.string().min(2).optional(),
    phone: z.string().min(10).max(15).optional(),
    address: z.string().min(5).max(200).optional(),
    website_url: z.string().url().optional(),  // Ensure valid URL format
    logo_url: z.string().url().optional(), // Ensure valid URL format
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
    is_verified: z.boolean().optional(),
});