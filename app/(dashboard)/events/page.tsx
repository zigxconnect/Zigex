"use client";

import { EventDetailsModal } from "@/components/sections/dashboard/Event/EventDetailsModal";
import { ShareButton } from "@/components/sections/dashboard/ShareButton";
import { Card } from "@/components/ui/card";
import { CalendarDays, MapPin } from "lucide-react";

// Sample events data - replace with your actual data fetching logic
const sampleEvents = [
  {
    id: "tech-conf-2024",
    title: "Tech Conference 2024",
    description: "Join us for an exciting tech conference featuring industry experts and hands-on workshops. Network with leading professionals and learn about the latest trends in technology.",
    date: "March 15, 2024",
    time: "9:00 AM - 5:00 PM",
    location: "Tech Hub Convention Center",
    capacity: 500,
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop",
  },
  {
    id: "ai-workshop-2024",
    title: "AI Workshop Series",
    description: "Learn about the latest advancements in AI through hands-on workshops. From machine learning basics to advanced neural networks, this series covers it all.",
    date: "April 1-3, 2024",
    time: "10:00 AM - 4:00 PM",
    location: "Innovation Campus",
    capacity: 100,
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop",
  },
  {
    id: "hackathon-2024",
    title: "Global Hackathon 2024",
    description: "48 hours of coding, innovation, and amazing prizes! Work with teams from around the world to build solutions for real-world problems.",
    date: "May 20-22, 2024",
    time: "Starts at 9:00 AM",
    location: "Virtual Event",
    capacity: 1000,
    imageUrl: "https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?w=800&auto=format&fit=crop",
  },
];

export default function EventsPage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center mb-12 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
          Upcoming Events
        </h1>
        <p className="text-gray-600 max-w-2xl">
          Join our exciting events and expand your knowledge. From tech conferences to workshops,
          we have something for everyone.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleEvents.map((event) => (
          <EventDetailsModal
            key={event.id}
            event={event}
            trigger={
              <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200 group">
                <div className="relative h-48 w-full">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute top-2 right-2 z-20">
                    <ShareButton
                      title={event.title}
                      description={event.description}
                      url={`/event/${event.id}`}
                      imageUrl={event.imageUrl}
                      type="event"
                    />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-500 text-sm">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      {event.date}
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                  </div>
                </div>
              </Card>
            }
          />
        ))}
      </div>
      {/* Mobile bottom bar showing next event and quick RSVP */}
      {sampleEvents[0] && (
        <div className="fixed bottom-4 left-0 right-0 px-4 sm:hidden z-50">
          <div className="mx-auto max-w-4xl bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100/20 flex items-center justify-between gap-4 py-3 px-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Next Event</div>
                <div className="text-sm font-medium text-gray-900">{sampleEvents[0].title}</div>
              </div>
            </div>
            <div>
              <EventDetailsModal event={sampleEvents[0]} trigger={<button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg shadow">RSVP</button>} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}