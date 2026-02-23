import { z } from 'zod';
import { noUrl, URL_NOT_ALLOWED_MESSAGE } from './url-guard';

export const internshipSchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(3).max(100).refine(noUrl, URL_NOT_ALLOWED_MESSAGE),
    description: z.string().min(10).max(5000).refine(noUrl, URL_NOT_ALLOWED_MESSAGE),
    company_id: z.string().uuid(),
    cover_image_url: z.string().url().optional().nullable(),
    start_date: z.string().datetime(),
    end_date: z.string().datetime().nullable().optional(),
    deadline: z.string().datetime(),
    location: z.string().min(2).max(100).refine(noUrl, URL_NOT_ALLOWED_MESSAGE),
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