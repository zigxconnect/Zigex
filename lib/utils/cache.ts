import { unstable_cache } from 'next/cache';

// Cache program details for 4 minutes
export const getProgramDetails = unstable_cache(
  async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/programs/${id}`, {
        next: { tags: [`program-${id}`] }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch program');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching program:', error);
      return null;
    }
  },
  ['program-details'],
  { revalidate: 240 } // 4 minutes
);

// Cache internship details for 4 minutes
export const getInternshipDetails = unstable_cache(
  async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/internships/${id}`, {
        next: { tags: [`internship-${id}`] }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch internship');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching internship:', error);
      return null;
    }
  },
  ['internship-details'],
  { revalidate: 240 } // 4 minutes
);

// Cache event details for 4 minutes
export const getEventDetails = unstable_cache(
  async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${id}`, {
        next: { tags: [`event-${id}`] }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch event');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching event:', error);
      return null;
    }
  },
  ['event-details'],
  { revalidate: 240 } // 4 minutes
);