import { z } from 'zod';

export const internshipSchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(5000),
    company_id: z.string().uuid(),
    cover_image_url: z.string().url().optional().nullable(),
    start_date: z.string().datetime(),
    end_date: z.string().datetime().nullable().optional(),
    deadline: z.string().datetime(),
    location: z.string().min(2).max(100),
    type: z.enum(['onsite', 'remote', 'hybrid']).default('onsite').nullable(),
    is_paid: z.boolean().default(false).optional(),
    compensation_amount: z.string().max(100).nullable().optional(),
    compensation: z.string().max(100).nullable().optional(), // Legacy support if needed
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
    required_skills: z.array(z.string()).optional(),
    category: z.string().min(2),
    monthly_rate: z.coerce.number().default(0).optional()
});

export type Internship = z.infer<typeof internshipSchema>;