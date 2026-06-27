import { z } from 'zod';

export const internshipSchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(5000),
    company_id: z.string().uuid(),
    cover_image_url: z.string().url().optional().nullable(),
    start_date: z.coerce.date().transform(d => d.toISOString()),
    end_date: z.coerce.date().nullable().optional().transform(d => d ? d.toISOString() : null),
    deadline: z.coerce.date().transform(d => d.toISOString()),
    location: z.string().min(2).max(100),
    type: z.enum(['onsite', 'remote', 'hybrid']).default('onsite').nullable(),
    is_paid: z.boolean().default(false).optional(),
    compensation_amount: z.string().max(100).nullable().optional(),
    compensation: z.string().max(100).nullable().optional(), // Legacy support if needed
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
    required_skills: z.array(z.string()).optional(),
    category: z.string().min(2),
    monthly_rate: z.coerce.number().default(0).optional(),
    is_visible: z.boolean().default(true).optional(),
    whatsapp_community_link: z.string().url().optional().nullable().or(z.literal('')),
    require_geolocation: z.boolean().default(false).optional(),
    geo_latitude: z.coerce.number().min(-90).max(90).nullable().optional(),
    geo_longitude: z.coerce.number().min(-180).max(180).nullable().optional(),
    geo_radius_meters: z.coerce.number().min(10).max(5000).default(100).optional(),
});

export type Internship = z.infer<typeof internshipSchema>;