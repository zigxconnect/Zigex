import { z } from 'zod';

export const applicationSchema = z.object({
    name: z.string().max(100, 'Name cannot exceed 100 characters').nonempty('Name is required'),
    email: z.string().email('Invalid email format').nonempty('Email is required'),
    age: z.number().min(18, 'Age must be at least 18').optional(),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
});

export type Application = z.infer<typeof applicationSchema>;