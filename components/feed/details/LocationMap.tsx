// components/feed/detail/LocationMap.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationMapProps {
  location: string;
  title: string;
}

export function LocationMap({ location, title }: LocationMapProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    location
  )}`;
  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    location
  )}&output=embed`;

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <MapPin size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Location</h3>
              <p className="text-sm text-gray-600">{location}</p>
            </div>
          </div>
          
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all"
          >
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
              <Navigation size={14} className="mr-2" />
              Directions
            </a>
          </Button>
        </div>
      </div>

      {/* Map */}
      <div className="relative w-full h-72 md:h-96 bg-gray-100">
        {/* Loading State */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        )}

        {/* Map iframe */}
        <iframe
          title={`Map showing ${title} location`}
          src={embedUrl}
          className="w-full h-full border-0"
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          referrerPolicy="no-referrer-when-downgrade"
        />

        {/* Open in Google Maps Overlay */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 group"
        >
          <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />
          Open in Maps
        </a>
      </div>
    </Card>
  );
}