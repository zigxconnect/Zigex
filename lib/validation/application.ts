import { z } from 'zod';

export const applicationSchema = z.object({
    id: z.string().uuid().optional(),
    application_id: z.string().uuid().optional(),
    cover_letter: z.string().min(10, 'Cover letter must be at least 10 characters long').optional(),
    cv_url: z.string().url('Invalid URL format for CV').optional(),
    linkedin_url: z.string().url('Invalid URL format for LinkedIn').optional(),
    answers: z.json().optional(),
    name: z.string().max(100, 'Name cannot exceed 100 characters').nonempty('Name is required'),
    email: z.string().email('Invalid email format').nonempty('Email is required'),
    age: z.number().min(18, 'Age must be at least 18').optional(),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
});

