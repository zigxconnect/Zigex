"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { 
  MessageCircle, Linkedin, Star, Users, Calendar, Clock,
  X, Send, ChevronRight, UserPlus, GraduationCap, Award,
  ArrowRight, CheckCircle2, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "@/components/feed/details/BackButton";

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
    name: "Fonyuy Gita",
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
    name: "Fien Dora",
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
    name: "Abdul Fadiga",
    avatar: "https://i.ibb.co/wFVCrg5K/Whats-App-Image-2025-11-23-at-11-14-41-AM.jpg",
    title: "AI Research Scientist",
    field: "ai",
    expertise: ["Machine Learning", "Deep Learning", "NLP", "Computer Vision"],
    bio: "PhD in AI, passionate about democratizing AI education in Africa.",
    whatsapp: "https://wa.me/237683532083",
    linkedin: "https://www.linkedin.com/in/abdul-fadiga-775a5a284",
    rating: 4.8,
    students: 14,
  },
  {
    id: "4",
    name: "John Brindi",
    avatar: "https://i.ibb.co/xqWXw548/Whats-App-Image-2025-11-23-at-12-38-01-PM.jpg",
    title: "Cybersecurity & Backend Engineer",
    field: "cybersecurity",
    expertise: ["TensorFlow", "PyTorch", "Scikit-learn", "Data Science"],
    bio: "Transforming data into insights. Former Google ML engineer now mentoring in Cameroon.",
    whatsapp: "https://wa.me/650146590",
    linkedin: "https://linkedin.com/in/fatima-yusuf",
    rating: 4.9,
    students: 12,
  },
  {
    id: "5",
    name: "Tayuh Favour",
    avatar: "https://i.ibb.co/JFpCHS9h/Whats-App-Image-2025-11-23-at-11-12-52-AM.jpg",
    title: "Frontend & Machine Learning",
    field: "ml",
    expertise: ["Frontend", "ML"],
    bio: "15 years in embedded systems. Built solutions for automotive and aerospace industries.",
    whatsapp: "https://wa.me/23768160069",
    linkedin: "https://www.linkedin.com/in/tayuh-favour",
    rating: 4.7,
    students: 7,
  },
  {
    id: "6",
    name: "Tracy Jacy",
    title: "Cybersecurity Specialist",
    field: "cybersecurity",
    expertise: ["Penetration Testing", "Network Security", "Ethical Hacking"],
    bio: "CISSP certified. Protecting organizations from cyber threats for over 12 years.",
    whatsapp: "https://wa.me/237653283254",
    linkedin: "https://www.linkedin.com/in/mbighonyi-tracy-7030a329b",
    avatar: "https://i.ibb.co/zH2c0MhN/Whats-App-Image-2025-11-23-at-2-56-03-PM.jpg",
    rating: 5.0,
    students: 2,
  },
  {
    id: "9",
    name: "Ngwa Frank",
    title: "Backend Expert",
    field: "backend",
    expertise: ["Node.js", "Python", "PostgreSQL", "API Design"],
    bio: "Building robust backend systems. Passionate about clean architecture and performance.",
    whatsapp: "https://wa.me/237653283254",
    linkedin: "https://linkedin.com/in/ngwa-frank",
    avatar: "https://i.ibb.co/4RrtVfS9/Whats-App-Image-2025-11-23-at-10-06-20-AM.jpg",
    rating: 5.0,
    students: 7,
  },
  {
    id: "7",
    name: "Emma Rita",
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
    name: "Will Yefon",
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
  { id: "all", name: "All Mentors", icon: Users },
  { id: "iot", name: "IoT", icon: Award },
  { id: "web", name: "Web Dev", icon: GraduationCap },
  { id: "ai", name: "AI", icon: Award },
  { id: "ml", name: "ML", icon: Award },
  { id: "backend", name: "Backend", icon: GraduationCap },
  { id: "cybersecurity", name: "Security", icon: Award },
];

function pickAvatar(mentor: Mentor) {
  if (mentor.avatar && mentor.avatar !== "/z3.png") return mentor.avatar;
  const seed = encodeURIComponent(mentor.name || mentor.id || "unknown");
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
}

// Booking Modal Component
function BookingModal({ 
  mentor, 
  isOpen, 
  onClose 
}: { 
  mentor: Mentor | null; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    topic: "",
    message: "",
    preferredTime: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    // Reset after showing success
    setTimeout(() => {
      onClose();
      setIsSuccess(false);
      setFormData({ name: "", email: "", phone: "", topic: "", message: "", preferredTime: "" });
    }, 2000);
  };

  if (!isOpen || !mentor || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ maxHeight: '90vh' }}
      >
        {/* Hidden scrollbar wrapper */}
        <div 
          className="overflow-y-auto"
          style={{ 
            maxHeight: '90vh',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center z-20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {isSuccess ? (
            // Success State
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Request Sent!</h3>
              <p className="text-slate-500">
                {mentor.name} will contact you soon.
              </p>
            </div>
          ) : (
            <>
              {/* Header with Mentor Info */}
              <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-6 py-8 text-white relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
                
                <div className="relative z-10 flex items-center gap-4">
                  <img
                    src={pickAvatar(mentor)}
                    alt={mentor.name}
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-white/20 shadow-xl"
                  />
                  <div>
                    <p className="text-blue-200 text-sm font-medium mb-1">Book a Session with</p>
                    <h2 className="text-2xl font-bold">{mentor.name}</h2>
                    <p className="text-blue-200 text-sm">{mentor.title}</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Name & Email Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 text-sm"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 text-sm"
                      placeholder="you@email.com"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">+</span>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 text-sm"
                      placeholder="237 6XX XXX XXX"
                    />
                  </div>
                </div>

                {/* Topic */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Topic of Interest
                  </label>
                  <select
                    required
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 text-sm appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
                  >
                    <option value="">Select a topic</option>
                    {mentor.expertise.map((skill) => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Preferred Time */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Preferred Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.preferredTime}
                      onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 text-sm"
                      placeholder="e.g., Weekdays 6-8 PM"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Message <span className="text-slate-400 normal-case">(optional)</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 text-sm resize-none"
                    placeholder="Tell the mentor about your goals..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/25 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending Request...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Request Mentorship Session
                    </>
                  )}
                </button>

                {/* Privacy note */}
                <p className="text-xs text-center text-slate-400 mt-3">
                  Your information is secure and will only be shared with the mentor.
                </p>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default function MentorshipPage() {
  const [activeField, setActiveField] = useState("all");
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const filteredMentors = activeField === "all" 
    ? mentors 
    : mentors.filter(m => m.field === activeField);

  const handleBookMentor = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <BackButton />
          </div>
          
          <div className="pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Find Your Mentor</h1>
                  <p className="text-slate-500 text-sm">Connect with industry experts who can guide your journey</p>
                </div>
              </div>
              
              {/* Become a Mentor Button */}
              <a
                href="https://tally.so/r/your-mentor-form"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-all whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4" />
                Become a Mentor
              </a>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex gap-2 mt-6 overflow-x-auto pb-2 no-scrollbar">
              {fields.map((field) => (
                <button
                  key={field.id}
                  onClick={() => setActiveField(field.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeField === field.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {field.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredMentors.map((mentor, index) => {
              const avatarSrc = pickAvatar(mentor);
              
              return (
                <motion.div
                  key={mentor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all overflow-hidden group"
                >
                  {/* Mentor Image - LARGER */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
                    <img
                      src={avatarSrc}
                      alt={mentor.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold text-slate-900">{mentor.rating}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Name & Title */}
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{mentor.name}</h3>
                      <p className="text-blue-600 text-sm font-medium">{mentor.title}</p>
                    </div>

                    {/* Bio */}
                    <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">
                      {mentor.bio}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {mentor.expertise.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {mentor.expertise.length > 3 && (
                        <span className="px-3 py-1 bg-slate-100 text-slate-400 rounded-full text-xs font-medium">
                          +{mentor.expertise.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                        <Users className="w-4 h-4" />
                        <span>{mentor.students} students</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleBookMentor(mentor)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors"
                      >
                        <Calendar className="w-4 h-4" />
                        Book Session
                      </button>
                      <Link
                        href={mentor.whatsapp}
                        target="_blank"
                        className="w-12 h-12 flex items-center justify-center bg-green-50 hover:bg-green-100 text-green-600 rounded-xl transition-colors"
                        title="WhatsApp"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </Link>
                      <Link
                        href={mentor.linkedin}
                        target="_blank"
                        className="w-12 h-12 flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors"
                        title="LinkedIn"
                      >
                        <Linkedin className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredMentors.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No mentors found</h3>
            <p className="text-slate-500">Try selecting a different category</p>
          </div>
        )}

        {/* Become a Mentor CTA Banner */}
        <div className="mt-16 mb-8">
          <div className="relative bg-blue-600 rounded-2xl p-8 md:p-10 overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                  <UserPlus className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                    Want to Become a Mentor?
                  </h3>
                  <p className="text-blue-100 text-sm md:text-base">
                    Share your expertise and help shape the next generation of tech leaders.
                  </p>
                </div>
              </div>
              
              <a
                href="https://tally.so/r/your-mentor-form"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-blue-600 rounded-xl font-semibold text-sm transition-all whitespace-nowrap"
              >
                Apply Now
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        mentor={selectedMentor}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />

      <style jsx global>{`
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}