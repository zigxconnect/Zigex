"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, Linkedin, MessageCircle } from "lucide-react";

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
  { id: "all", name: "All Mentors", count: mentors.length },
  { id: "iot", name: "IoT", count: mentors.filter(m => m.field === "iot").length },
  { id: "web", name: "Web Development", count: mentors.filter(m => m.field === "web").length },
  { id: "ai", name: "Artificial Intelligence", count: mentors.filter(m => m.field === "ai").length },
  { id: "ml", name: "Machine Learning", count: mentors.filter(m => m.field === "ml").length },
  { id: "embedded", name: "Embedded Systems", count: mentors.filter(m => m.field === "embedded").length },
  { id: "cybersecurity", name: "Cybersecurity", count: mentors.filter(m => m.field === "cybersecurity").length },
];

export default function MentorshipPage() {
  const [activeField, setActiveField] = useState("all");
  const [hoveredMentor, setHoveredMentor] = useState<string | null>(null);

  const filteredMentors = activeField === "all" 
    ? mentors 
    : mentors.filter(m => m.field === activeField);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Find Your Mentor</h1>
            <p className="mt-1 text-sm text-gray-600">
              Connect with experienced professionals to level up your skills
            </p>
          </div>

          {/* Field Tabs - Horizontal Scroll */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
            <div className="flex gap-2 pb-4 min-w-max">
              {fields.map((field) => (
                <button
                  key={field.id}
                  onClick={() => setActiveField(field.id)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                    ${activeField === field.id
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                    }
                  `}
                >
                  {field.name}
                  <span className={`ml-2 text-xs ${activeField === field.id ? "text-blue-100" : "text-gray-500"}`}>
                    ({field.count})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMentors.map((mentor) => (
            <div
              key={mentor.id}
              onMouseEnter={() => setHoveredMentor(mentor.id)}
              onMouseLeave={() => setHoveredMentor(null)}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Avatar Section */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <Image
                      src={mentor.avatar}
                      alt={mentor.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Info Section */}
              <div className="p-5">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{mentor.name}</h3>
                  <p className="text-sm text-gray-600 mt-0.5">{mentor.title}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-center gap-4 mb-4 pb-4 border-b border-gray-100">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <span className="text-lg font-bold">{mentor.rating}</span>
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Rating</p>
                  </div>
                  <div className="w-px h-8 bg-gray-200" />
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{mentor.students}</div>
                    <p className="text-xs text-gray-500 mt-0.5">Students</p>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-gray-600 leading-relaxed mb-4 line-clamp-2">
                  {mentor.bio}
                </p>

                {/* Expertise Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {mentor.expertise.slice(0, 3).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {mentor.expertise.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                      +{mentor.expertise.length - 3}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link
                    href={mentor.whatsapp}
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </Link>
                  <Link
                    href={mentor.linkedin}
                    target="_blank"
                    className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMentors.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No mentors found</h3>
            <p className="text-sm text-gray-600">Try selecting a different field</p>
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