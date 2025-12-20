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
    <Card className="overflow-hidden border border-border shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 bg-muted/30 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MapPin size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Location</h3>
              <p className="text-sm text-muted-foreground">{location}</p>
            </div>
          </div>
          
          <Button
            asChild
            variant="secondary"
            className="rounded-full border-primary/20 hover:bg-primary/5 hover:border-primary/40 hover:text-primary transition-all transition-colors"
          >
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
              <Navigation size={14} className="mr-2" />
              Directions
            </a>
          </Button>
        </div>
      </div>

      {/* Map */}
      <div className="relative w-full h-72 md:h-96 bg-muted">
        {/* Loading State */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Loading map...</p>
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