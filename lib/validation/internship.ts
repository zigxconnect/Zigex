import { z } from 'zod';

export const internshipSchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(1000),
    company_id: z.string().uuid(),
    start_date: z.string().datetime(),
    end_date: z.string().datetime(),
    application_deadline: z.string().datetime(),
    location: z.string().min(2).max(100),
    is_remote: z.boolean().optional().default(false),
    requirements: z.array(z.string()).optional(),
    compensation: z.string().max(100).optional(),
    status: z.enum(['draft', 'published', 'closed']).default('draft'),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});

export type Internship = z.infer<typeof internshipSchema>;