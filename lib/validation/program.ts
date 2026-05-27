// lib/validation/program.ts
import { z } from 'zod';

export const programSchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(5000),
    company_id: z.string().uuid(),
    program_category: z.enum(['bootcamp', 'hackathon', 'volunteer', 'mentorship', 'apprenticeship']),
    start_date: z.string().datetime(),
    end_date: z.string().datetime(), // Programs often have a clear end date
    application_deadline: z.string().datetime().optional(), // Optional, some programs might not have a strict application deadline
    location: z.string().min(2).max(100).optional(), // Some programs might be fully remote without a specific location
    type: z.enum(['onsite', 'remote', 'hybrid']).default('remote'),
    compensation: z.string().max(100).optional(), // Can be 'paid', 'unpaid', or a specific amount
    program_picture_url: z.string().url().optional(), // URL to the image stored in Supabase Storage
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
    required_skills: z.array(z.string()).optional(),
    is_visible: z.boolean().default(true).optional(),
});

export type Program = z.infer<typeof programSchema>;