// lib/validation/event.ts
import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  // event_type: z.enum(['conference', 'workshop', 'webinar', 'networking', 'hackathon']),
  start_date: z.string().datetime({ message: "Valid start date is required" }),
  end_date: z.string().datetime({ message: "Valid end date is required" }),
  location: z.string().min(1, "Location is required"),
  registration_link: z.string().url().optional().or(z.literal('')),
  company_id: z.string().uuid(),
  event_picture_url: z.string().url().optional().nullable(),
  // tags: z.array(z.string()).optional(),
  // capacity: z.number().int().positive().optional(),
  // is_virtual: z.boolean().default(false),
  // price: z.number().nonnegative().optional().default(0)
  is_visible: z.boolean().default(true).optional(),
});

export type EventFormData = z.infer<typeof eventSchema>;