import { Metadata } from 'next';
import EventDetailsClient from './EventDetailsClient.tsx';

async function getEvent(id: string) {
  // We'll fetch the event data on the server for SEO
  // Use absolute URL for server-side fetching in Next.js if necessary, 
  // but usually we can reuse the fetch logic.
  try {
    const res = await fetch(`https://zigex.vercel.app/api/students/events?id=${id}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || data; // Handle different API response structures
  } catch (err) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const resolvedParams = await params;
  const event = await getEvent(resolvedParams.id);

  if (!event) {
    return {
      title: 'Event Not Found | Zigex',
    };
  }

  const title = `${event.title} | Zigex Events`;
  const description = event.description?.substring(0, 160) || `Join us for ${event.title} at Zigex.`;
  const image = event.event_picture_url || "https://i.ibb.co/k2Rpz2jQ/og-image-2x-100.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://zigex.vercel.app/events/${event.id}`,
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function Page({ params }: { params: any }) {
  const resolvedParams = await params;
  return <EventDetailsClient id={resolvedParams.id} />;
}
