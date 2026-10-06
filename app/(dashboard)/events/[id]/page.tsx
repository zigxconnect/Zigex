import { Metadata } from 'next';
import { getFeedItem } from '@/lib/api/services/feed';
import EventDetailsClient from './EventDetailsClient.tsx';

async function getEvent(id: string) {
  try {
    return await getFeedItem("events", id);
  } catch {
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
      url: `https://www.zigexconnect.com/events/${event.id}`,
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
