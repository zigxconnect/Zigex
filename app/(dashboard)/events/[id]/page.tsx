"use client";

import { useFetchDetails } from "@/hooks/useFetchDetails";
import { Event } from "@/lib/types/dashoard/index";
import { Spinner } from "@/components/uiComponent/Spinner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Building2, ExternalLink, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/uiComponent/Alert";

// A helper component for displaying detail items in the sidebar
const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) => {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <span className="text-sm font-semibold text-gray-800 text-right">
        {value}
      </span>
    </div>
  );
};

// Main Page Component
export default function EventDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const {
    data: event,
    isLoading,
    error,
  } = useFetchDetails<Event>("/api/students/events", params.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner />
      </div>
    );
  }
  if (error) {
    return <div className="text-center p-12 text-red-500">{error}</div>;
  }
  if (!event) {
    return (
      <div className="text-center p-12 text-gray-500">Event not found.</div>
    );
  }

  const company = event.company;
  const startDate = new Date(event.start_date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const endDate = new Date(event.end_date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-[#F8FAFC] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
          <h1 className="text-4xl font-bold text-green-700">{event.title}</h1>
          <div className="mt-6 h-56 bg-gray-200 rounded-xl overflow-hidden relative">
            <Image
              src={event.event_picture_url}
              alt={event.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="mt-8 flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-green-500 text-white font-bold text-2xl shadow-md">
              <Building2 size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {company?.company_name}
              </h2>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <MapPin size={14} /> {event.location}
              </div>
            </div>
          </div>
          <div className="mt-8 prose max-w-none">
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              About this Event
            </h3>
            <p>{event.description || "No description provided."}</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 sticky top-8">
          <Card>
            <div className="p-6">
              <h3 className="font-bold text-lg mb-4 text-green-700">
                Event Details
              </h3>
              <DetailItem label="Location" value={event.location} />
              <DetailItem label="Start Date" value={startDate} />
              <DetailItem label="End Date" value={endDate} />
              <DetailItem
                label="Time"
                value={event.start_time || "Not specified"}
              />
            </div>
          </Card>
          {event.registration_link && (
            <Button asChild className="w-full text-base py-3 font-semibold">
              <Link
                href={event.registration_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Register Now <ExternalLink size={16} className="ml-2" />
              </Link>
            </Button>
          )}
          <Alert icon={TriangleAlert} variant="info">
            <h4 className="font-bold">Event Timing</h4>
            <p className="mt-1">
              This event runs from {startDate} to {endDate}.
            </p>
          </Alert>
        </div>
      </div>
    </div>
  );
}
