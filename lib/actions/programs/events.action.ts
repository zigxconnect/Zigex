"use server";

import { Event } from "@/lib/types/dashboard/index";

/**
 * Fetches the details for a specific event by its ID.
 * This function is a Server Action and will only run on the server.
 * @param id The unique identifier of the event.
 * @returns A promise that resolves to the Event object or null if not found or an error occurs.
 */
export async function getEventDetailsById(id: string): Promise<Event | null> {
  try {
    
    const res = await fetch(`http:localhost:3000/api/students/events/${id}`, {

      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      
      throw new Error("Failed to fetch event data.");
    }

    const eventData: Event = await res.json();
    return eventData;

  } catch (error) {

    console.error("Error fetching event details:", error);

    return null;
  }
}