"use server";

import { Event } from "@/lib/types/dashoard/index";

export async function getEventDetailsById(id: string): Promise<Event | null> {
  // Dynamically determine the base URL
  // On Vercel, VERCEL_URL is provided. In local dev, we use our .env.local variable.
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL;

  // Now, construct the full, absolute URL
  const targetUrl = `${baseUrl}/api/students/events/${id}`;
  
  console.log(`Fetching data from: ${targetUrl}`); // Helpful for debugging

  try {
    const res = await fetch(targetUrl, {
      next: { revalidate: 3600 }, // Revalidate cache every hour
    });

    if (!res.ok) {
      // Log the status for better error tracking in production
      console.error(`API request failed with status: ${res.status}`);
      throw new Error("Failed to fetch event data.");
    }

    const eventData: Event = await res.json();
    return eventData;

  } catch (error) {
    console.error("Error fetching event details:", error);
    return null;
  }
}