"use client";

import { useFetchDetails } from "@/hooks/useFetchDetails";
import { Event } from "@/lib/types/dashoard/index";
import { Spinner } from "@/components/uiComponent/Spinner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Building2, ExternalLink, TriangleAlert, Calendar, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/uiComponent/Alert";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
      <span className="text-sm font-semibold text-gray-800 text-right max-w-[60%]">
        {value}
      </span>
    </div>
  );
};

// RSVP Form Modal Component
const RSVPModal = ({ 
  event, 
  isOpen, 
  onClose 
}: { 
  event: Event; 
  isOpen: boolean; 
  onClose: () => void;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    expectations: "",
    comments: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("event_id", event.id);
      formDataToSend.append("expectations", formData.expectations);
      formDataToSend.append("comments", formData.comments);
      formDataToSend.append("rsvp_status", "true");

      // Use the correct endpoint
      const response = await fetch("/api/students/applications/events/rsvp", {
        method: "POST",
        body: formDataToSend,
      });

      // Handle non-JSON responses
      const responseText = await response.text();
      let result;
      
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error("Server returned invalid response");
      }

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit RSVP");
      }

      alert("RSVP submitted successfully!");
      onClose();
      setFormData({ expectations: "", comments: "" });
    } catch (error: any) {
      console.error("RSVP submission error:", error);
      alert(error.message || "Failed to submit RSVP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-green-700">RSVP for Event</h2>
            <p className="text-sm text-gray-600 mt-1">{event.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="expectations" className="text-sm font-medium text-gray-700">
              What are your expectations for this event? *
            </Label>
            <Textarea
              id="expectations"
              value={formData.expectations}
              onChange={(e) => setFormData(prev => ({ ...prev, expectations: e.target.value }))}
              placeholder="I want to network with professionals, learn about new technologies..."
              required
              className="mt-1 min-h-[100px] resize-none"
            />
          </div>

          <div>
            <Label htmlFor="comments" className="text-sm font-medium text-gray-700">
              Additional Comments (Optional)
            </Label>
            <Textarea
              id="comments"
              value={formData.comments}
              onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
              placeholder="Any additional information you'd like to share..."
              className="mt-1 min-h-[80px] resize-none"
            />
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isSubmitting || !formData.expectations.trim()}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Calendar size={16} className="mr-2" />
                  Confirm RSVP
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
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
  const [showRSVPModal, setShowRSVPModal] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 text-red-500 text-lg">{error}</div>
      </div>
    );
  }
  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 text-gray-500 text-lg">Event not found.</div>
      </div>
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
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* RSVP Modal */}
      <RSVPModal 
        event={event} 
        isOpen={showRSVPModal} 
        onClose={() => setShowRSVPModal(false)} 
      />
      
      {/* Mobile-first layout - No padding on mobile, padding on larger screens */}
      <div className="lg:px-8 lg:py-8">
        <div className="lg:max-w-7xl lg:mx-auto">
          
          {/* Mobile: Stack layout, Desktop: Grid layout */}
          <div className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Mobile: Full width card with no border radius, Desktop: Rounded card */}
              <div className="bg-white lg:rounded-2xl lg:shadow-lg lg:border lg:border-gray-200 overflow-hidden min-h-screen lg:min-h-0">
                
                {/* Hero Image - Much larger on mobile */}
                <div className="relative h-64 sm:h-80 lg:h-96 w-full">
                  <Image
                    src={event.event_picture_url}
                    alt={event.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  {/* Gradient overlay for better text readability if needed */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {/* Content Section */}
                <div className="p-4 sm:p-6 lg:p-8">
                  {/* Title - Larger and more prominent */}
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-700 leading-tight">
                    {event.title}
                  </h1>

                  {/* Company Info - Better mobile layout */}
                  <div className="mt-6 flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center bg-green-500 text-white font-bold shadow-md">
                      <Building2 size={24} className="sm:w-8 sm:h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                        {company?.company_name}
                      </h2>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <MapPin size={14} className="flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description - Better typography */}
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      About this Event
                    </h3>
                    <div className="prose prose-gray max-w-none text-base leading-relaxed">
                      <p>{event.description || "No description provided."}</p>
                    </div>
                  </div>

                  {/* Mobile Event Details - Show here on small screens */}
                  <div className="mt-8 lg:hidden">
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
                    
                    {/* Mobile Action Buttons */}
                    <div className="space-y-4 mt-6">
                      {/* RSVP Button */}
                      <Button 
                        onClick={() => setShowRSVPModal(true)}
                        className="w-full text-base py-4 font-semibold bg-green-600 hover:bg-green-700"
                      >
                        <Calendar size={20} className="mr-2" />
                        RSVP for Event
                      </Button>
                      
                      {/* Register Button */}
                      {event.registration_link && (
                        <Button asChild variant="outline" className="w-full text-base py-4 font-semibold">
                          <Link
                            href={event.registration_link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Register Now <ExternalLink size={16} className="ml-2" />
                          </Link>
                        </Button>
                      )}
                    </div>

                    {/* Mobile Alert */}
                    <div className="mt-6 mb-8">
                      <Alert icon={TriangleAlert} variant="info">
                        <h4 className="font-bold">Event Timing</h4>
                        <p className="mt-1">
                          This event runs from {startDate} to {endDate}.
                        </p>
                      </Alert>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Sidebar - Hidden on mobile since content is moved above */}
            <div className="hidden lg:block space-y-6 lg:sticky lg:top-8">
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
              
              {/* Desktop Action Buttons */}
              <div className="space-y-4">
                {/* RSVP Button */}
                <Button 
                  onClick={() => setShowRSVPModal(true)}
                  className="w-full text-base py-3 font-semibold bg-green-600 hover:bg-green-700"
                >
                  <Calendar size={18} className="mr-2" />
                  RSVP for Event
                </Button>
                
                {/* Register Button */}
                {event.registration_link && (
                  <Button asChild variant="outline" className="w-full text-base py-3 font-semibold">
                    <Link
                      href={event.registration_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Register Now <ExternalLink size={16} className="ml-2" />
                    </Link>
                  </Button>
                )}
              </div>
              
              <Alert icon={TriangleAlert} variant="info">
                <h4 className="font-bold">Event Timing</h4>
                <p className="mt-1">
                  This event runs from {startDate} to {endDate}.
                </p>
              </Alert>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}