"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MessageCircle, Linkedin } from "lucide-react";

type Mentor = {
  id: string;
  name: string;
  avatar: string;
  title: string;
  field: string;
  expertise: string[];
  bio: string;
  whatsapp: string;
  linkedin: string;
  rating: number;
  students: number;
};

const mentors: Mentor[] = [
  {
    id: "1",
    name: "Chinonso Okafor",
    avatar: "/z3.png",
    title: "Senior IoT Engineer",
    field: "iot",
    expertise: ["Arduino", "Raspberry Pi", "ESP32", "Sensors"],
    bio: "10+ years building smart devices and IoT solutions for industrial applications.",
    whatsapp: "https://wa.me/237123456789",
    linkedin: "https://linkedin.com/in/chinonso-okafor",
    rating: 4.9,
    students: 234,
  },
  {
    id: "2",
    name: "Amina Bello",
    avatar: "/z3.png",
    title: "Full Stack Developer",
    field: "web",
    expertise: ["React", "Next.js", "Node.js", "TypeScript"],
    bio: "Building scalable web applications and mentoring developers across Africa.",
    whatsapp: "https://wa.me/237123456790",
    linkedin: "https://linkedin.com/in/amina-bello",
    rating: 5.0,
    students: 456,
  },
  {
    id: "3",
    name: "Emmanuel Ndukwe",
    avatar: "/z3.png",
    title: "AI Research Scientist",
    field: "ai",
    expertise: ["Machine Learning", "Deep Learning", "NLP", "Computer Vision"],
    bio: "PhD in AI, passionate about democratizing AI education in Africa.",
    whatsapp: "https://wa.me/237123456791",
    linkedin: "https://linkedin.com/in/emmanuel-ndukwe",
    rating: 4.8,
    students: 189,
  },
  {
    id: "4",
    name: "Fatima Yusuf",
    avatar: "/z3.png",
    title: "ML Engineer",
    field: "ml",
    expertise: ["TensorFlow", "PyTorch", "Scikit-learn", "Data Science"],
    bio: "Transforming data into insights. Former Google ML engineer now mentoring in Cameroon.",
    whatsapp: "https://wa.me/237123456792",
    linkedin: "https://linkedin.com/in/fatima-yusuf",
    rating: 4.9,
    students: 312,
  },
  {
    id: "5",
    name: "David Tambe",
    avatar: "/z3.png",
    title: "Embedded Systems Expert",
    field: "embedded",
    expertise: ["C/C++", "ARM Cortex", "RTOS", "Firmware"],
    bio: "15 years in embedded systems. Built solutions for automotive and aerospace industries.",
    whatsapp: "https://wa.me/237123456793",
    linkedin: "https://linkedin.com/in/david-tambe",
    rating: 4.7,
    students: 167,
  },
  {
    id: "6",
    name: "Kemi Adeleke",
    avatar: "/z3.png",
    title: "Cybersecurity Specialist",
    field: "cybersecurity",
    expertise: ["Penetration Testing", "Network Security", "Ethical Hacking"],
    bio: "CISSP certified. Protecting organizations from cyber threats for over 12 years.",
    whatsapp: "https://wa.me/237123456794",
    linkedin: "https://linkedin.com/in/kemi-adeleke",
    rating: 5.0,
    students: 278,
  },
  {
    id: "7",
    name: "Chukwuma Eze",
    avatar: "/z3.png",
    title: "IoT Solutions Architect",
    field: "iot",
    expertise: ["LoRaWAN", "MQTT", "Cloud IoT", "Edge Computing"],
    bio: "Building smart cities solutions across West Africa. Let's build the future together.",
    whatsapp: "https://wa.me/237123456795",
    linkedin: "https://linkedin.com/in/chukwuma-eze",
    rating: 4.8,
    students: 201,
  },
  {
    id: "8",
    name: "Sarah Musa",
    avatar: "/z3.png",
    title: "Frontend Specialist",
    field: "web",
    expertise: ["React", "Vue", "UI/UX", "Tailwind CSS"],
    bio: "Crafting beautiful, accessible web experiences. Teaching the next generation of developers.",
    whatsapp: "https://wa.me/237123456796",
    linkedin: "https://linkedin.com/in/sarah-musa",
    rating: 4.9,
    students: 389,
  },
];

const fields = [
  { id: "all", name: "All" },
  { id: "iot", name: "IoT" },
  { id: "web", name: "Web Dev" },
  { id: "ai", name: "AI" },
  { id: "ml", name: "ML" },
  { id: "embedded", name: "Embedded" },
  { id: "cybersecurity", name: "Security" },
];

function pickAvatar(mentor: Mentor) {
  if (mentor.avatar && mentor.avatar !== "/z3.png") return mentor.avatar;
  const seed = encodeURIComponent(mentor.name || mentor.id || "unknown");
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
}

export default function MentorshipPage() {
  const [activeField, setActiveField] = useState("all");

  const filteredMentors = activeField === "all" 
    ? mentors 
    : mentors.filter(m => m.field === activeField);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 sticky top-0 z-40 bg-white/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Mentors</h1>
          
          {/* Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto hide-scrollbar pb-1">
            {fields.map((field) => (
              <button
                key={field.id}
                onClick={() => setActiveField(field.id)}
                className={`
                  px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                  ${activeField === field.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                {field.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-3xl mx-auto">
        {filteredMentors.map((mentor) => {
          const whatsappMessage = encodeURIComponent(`Hi ${mentor.name}, I'd like to learn more about ${mentor.expertise[0]}. Can you mentor me?`);
          const whatsappUrl = `${mentor.whatsapp}?text=${whatsappMessage}`;
          const avatarSrc = pickAvatar(mentor);
          
          return (
            <div
              key={mentor.id}
              className="border-b border-gray-200 px-4 py-4 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                    <img
                      src={avatarSrc}
                      alt={mentor.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-900 text-[15px] truncate">
                          {mentor.name}
                        </span>
                        <span className="text-gray-500 text-[15px]">·</span>
                        <span className="text-gray-500 text-sm">
                          ⭐ {mentor.rating}
                        </span>
                      </div>
                      <div className="text-gray-500 text-sm">{mentor.title}</div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-[15px] text-gray-900 leading-normal mb-2">
                    {mentor.bio}
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {mentor.expertise.slice(0, 4).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Stats & Actions */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {mentor.students} students mentored
                    </div>
                    
                    {/* Action Icons */}
                    <div className="flex gap-2">
                      <Link
                        href={whatsappUrl}
                        target="_blank"
                        className="group flex items-center justify-center w-9 h-9 rounded-full hover:bg-green-50 transition-colors"
                        title="Message on WhatsApp"
                      >
                        <MessageCircle className="w-[18px] h-[18px] text-gray-500 group-hover:text-green-600 transition-colors" />
                      </Link>
                      <Link
                        href={mentor.linkedin}
                        target="_blank"
                        className="group flex items-center justify-center w-9 h-9 rounded-full hover:bg-blue-50 transition-colors"
                        title="Connect on LinkedIn"
                      >
                        <Linkedin className="w-[18px] h-[18px] text-gray-500 group-hover:text-blue-600 transition-colors" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {filteredMentors.length === 0 && (
          <div className="text-center py-16 px-4">
            <p className="text-gray-500">No mentors found in this category</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}