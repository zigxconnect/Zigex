"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import Image from "next/image";
import { ApplicationModal } from "../Application/ApplicationModal";

interface EventDetailsModalProps {
  event: {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    capacity: number;
    imageUrl: string;
  };
  trigger: React.ReactNode;
}

export function EventDetailsModal({ event, trigger }: EventDetailsModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:w-[90vw] sm:max-w-[800px] max-h-[90vh] 
        overflow-y-auto bg-white/95 backdrop-blur-lg p-0 rounded-2xl border-0">
        <div className="relative h-[200px] sm:h-[300px] w-full">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover rounded-t-2xl"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent rounded-t-2xl" />
        </div>
        
        <div className="p-6 sm:p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              {event.title}
            </DialogTitle>
            <DialogDescription className="mt-4 text-base text-gray-600 leading-relaxed">
              {event.description}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium text-gray-900">{event.date}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium text-gray-900">{event.time}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900">{event.location}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Capacity</p>
                <p className="font-medium text-gray-900">{event.capacity} attendees</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center pb-6">
            <ApplicationModal
              type="event"
              id={event.id}
              buttonText="RSVP Now"
              title={`RSVP for ${event.title}`}
              description="Secure your spot at this exciting event!"
            />
          </div>
        </div>

        {/* Modal bottom mobile bar inside the dialog to keep CTA visible */}
        <div className="sm:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[92%]">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100/20 flex items-center justify-between gap-4 py-3 px-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-gray-500">When</div>
                <div className="text-sm font-medium text-gray-900">{event.date}</div>
              </div>
            </div>
            <div>
              <ApplicationModal type="event" id={event.id} buttonText="RSVP" title={`RSVP for ${event.title}`} description={event.description} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}