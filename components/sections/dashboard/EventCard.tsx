"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, ExternalLink, Calendar } from "lucide-react";
import { Event } from "@/lib/types/dashoard";
import { SharePopover } from "@/components/SharePopover";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const EventCard = ({ event }: { event: Event }) => {
  const companyName = event.company?.company_name || "Community Event";
  const coverImage = event.event_picture_url || "/events-placeholder.jpg";

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group relative">
      <div className="relative h-40 w-full overflow-hidden">
        <Image
          src={coverImage}
          alt={`Cover image for ${event.title}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0 shadow-md bg-green-500">
            <Calendar size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 line-clamp-2">
              {event.title}
            </h3>
            <div className="flex items-center gap-1">
              <Building2 size={14} className="text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800 font-medium truncate">
                {companyName}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center justify-center bg-green-100 text-green-700 p-1 rounded-full">
              <Calendar size={12} />
            </div>
            <span className="font-medium">{formatDate(event.start_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center justify-center bg-green-100 text-green-700 p-1 rounded-full">
              <MapPin size={12} />
            </div>
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center gap-3">
          <Link href={`/events/${event.id}`} className="block flex-grow">
            <Button className="bg-green-700 hover:bg-green-600 text-white rounded-lg py-3 flex items-center justify-center gap-2 group/btn">
              <span>View Event</span>
              <ExternalLink
                size={14}
                className="transition-transform group-hover/btn:translate-x-0.5"
              />
            </Button>
          </Link>
          <SharePopover title={event.title} urlPath={`/events/${event.id}`} />
        </div>
      </div>
    </div>
  );
};
