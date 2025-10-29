"use client";

import React from "react";
import { ProgramCard } from "@/components/sections/dashboard/ProgramCard";
import { EventCard } from "@/components/sections/dashboard/EventCard";
import { InternshipCard } from "@/components/sections/dashboard/InternshipCard";

const mockProgram = {
  id: "p1",
  title: "Live Design Sprint — October",
  program_category: "bootcamp",
  start_date: new Date().toISOString(),
  end_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
  company: { company_name: "Seed Labs" },
  program_picture_url: "/skye8-internship.jpg",
  is_live: true,
  live_stream_url: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
  description: "<p>Join our intensive design sprint where you'll build a prototype in one week. Expect live demos, critiques, and Q&amp;A.</p>",
};

const mockEvent = {
  id: "e1",
  title: "Live Networking Hour",
  start_date: new Date().toISOString(),
  end_date: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
  company: { company_name: "Community" },
  event_picture_url: "/sky8.png",
  is_live: true,
  live_stream_url: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
  description: "<p>Networking hour with industry leaders. Watch live talks and ask questions during the stream.</p>",
};

const mockInternship = {
  id: "i1",
  title: "Software Intern — Live Q&A",
  company: "NervTech",
  location: "Remote",
  type: "Full-time",
  category: "engineering",
  logoColor: "#0ea5e9",
  cover_image_url: "/intern.png",
  is_live: true,
};

export default function Page() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Live preview demo</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProgramCard program={mockProgram as any} />
        <EventCard event={mockEvent as any} />
        <InternshipCard {...mockInternship} />
      </div>
    </div>
  );
}
