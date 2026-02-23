// lib/validation/event.ts
import { z } from 'zod';
import { noUrl, URL_NOT_ALLOWED_MESSAGE } from './url-guard';

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required").refine(noUrl, URL_NOT_ALLOWED_MESSAGE),
  description: z.string().min(1, "Description is required").refine(noUrl, URL_NOT_ALLOWED_MESSAGE),
  // event_type: z.enum(['conference', 'workshop', 'webinar', 'networking', 'hackathon']),
  start_date: z.string().datetime({ message: "Valid start date is required" }),
  end_date: z.string().datetime({ message: "Valid end date is required" }),
  location: z.string().min(1, "Location is required").refine(noUrl, URL_NOT_ALLOWED_MESSAGE),
  registration_link: z.string().url().optional().or(z.literal('')),
  company_id: z.string().uuid(),
  event_picture_url: z.string().url().optional().nullable(),
  // tags: z.array(z.string()).optional(),
  // capacity: z.number().int().positive().optional(),
  // is_virtual: z.boolean().default(false),
  // price: z.number().nonnegative().optional().default(0)
});

export type EventFormData = z.infer<typeof eventSchema>;