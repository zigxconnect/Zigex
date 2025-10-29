import React from "react";
import { supabaseAdmin } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { 
  Github, 
  Link2, 
  MapPin, 
  Briefcase, 
  Award, 
  Calendar,
  Mail,
  Phone,
  MessageCircle,
  Linkedin
} from "lucide-react";
import ConnectBar from "@/components/sections/dashboard/ConnectBar";
import QRCodeButton from "@/components/sections/dashboard/QRCodeButton";

interface Props {
  params: { id: string };
}

export default async function StudentDetailPage({ params }: Props) {
  const { id } = params;

  const { data, error } = await supabaseAdmin
    .from("student_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-semibold">Student not found</h2>
          <p className="text-gray-500 mt-2">This profile may have been removed.</p>
        </div>
      </div>
    );
  }

  const skills = data.hard_skills || [];
  const soft = data.soft_skills || [];

  // deterministic dummy stats based on id
  const seed = id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const internshipsApplied = (seed % 5) + 0;
  const programsApplied = (seed % 3) + 0;
  const eventsApplied = (seed % 4) + 0;
  const avatarUrl = data.avatar_url || "/z3.png";
  const coverImageUrl = data.cover_image || "/n8.png";

  const initials = (data.full_name || "")
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // WhatsApp message template
  const whatsappMessage = `Hi ${data.full_name || 'there'}! 👋

I came across your profile on ZigX and I'm impressed by your background in ${skills[0] || 'your field'}. 

I'd love to connect and explore potential collaboration opportunities.

Looking forward to hearing from you!`;

  const whatsappUrl = data.phone 
    ? `https://wa.me/${data.phone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`
    : null;

  const linkedinUrl = data.linkedin_url;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header Card */}
      <div className="relative bg-white md:rounded-2xl md:w-full mx-auto shadow-lg md:border md:border-gray-200 overflow-hidden mb-6">
        {/* Cover Image */}
        <div className="relative h-32 md:h-36 lg:h-48 w-full">
          <Image
            src={coverImageUrl}
            alt="Cover image"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        </div>

        {/* Avatar and QR Code Section */}
        <div className="absolute top-20 md:top-24 lg:top-32 left-4 lg:left-6 right-4 lg:right-6 flex justify-between items-end">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={data.full_name || "Student"}
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-2xl">
                  {initials}
                </div>
              )}
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-md"></div>
          </div>

          {/* QR Code Button */}
          <QRCodeButton 
            linkedinUrl={linkedinUrl}
            whatsappUrl={whatsappUrl}
            email={data.email}
            fullName={data.full_name}
            profileUrl={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://zigex.vercel.app'}/dashboard/student/${id}`}
          />
        </div>

        {/* Content Area */}
        <div className="pt-12 md:pt-14 lg:pt-16 px-4 lg:px-6 pb-4 lg:pb-6">
          {/* User Info and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 lg:gap-6">
            {/* Name and Location */}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                  {data.full_name || "Unnamed Student"}
                </h1>
                {/* Verification Badge */}
                <div className="flex items-center justify-center bg-blue-500 rounded-full p-0.5">
                  <svg 
                    viewBox="0 0 24 24" 
                    className="w-5 h-5 lg:w-6 lg:h-6 fill-white"
                    aria-label="Verified"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600 mb-3">
                <MapPin size={18} className="text-gray-500" />
                <p className="text-base lg:text-lg font-medium">
                  {data.university || "University not specified"}
                </p>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-4 flex-wrap">
                {data.linkedin_url && (
                  <Link
                    href={data.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    <Link2 size={16} />
                    <span className="text-sm font-medium">LinkedIn</span>
                  </Link>
                )}

                {data.github_url && (
                  <Link
                    href={data.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    <Github size={16} />
                    <span className="text-sm font-medium">Github</span>
                  </Link>
                )}

                {data.email && (
                  <Link
                    href={`mailto:${data.email}`}
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    <Mail size={16} />
                    <span className="text-sm font-medium">Email</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* LinkedIn Connect Button */}
              {linkedinUrl ? (
                <Link
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 bg-[#0A66C2] text-white font-semibold rounded-full hover:bg-[#004182] shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Linkedin size={18} />
                  <span>Connect on LinkedIn</span>
                </Link>
              ) : (
                <button 
                  disabled
                  className="px-6 py-2.5 bg-gray-200 text-gray-400 font-semibold rounded-full cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Linkedin size={18} />
                  <span>Connect on LinkedIn</span>
                </button>
              )}

              {/* WhatsApp Message Button */}
              {whatsappUrl ? (
                <Link
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 bg-[#25D366] text-white font-semibold rounded-full hover:bg-[#1da851] shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  <span>Message on WhatsApp</span>
                </Link>
              ) : (
                <button 
                  disabled
                  className="px-6 py-2.5 bg-gray-200 text-gray-400 font-semibold rounded-full cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  <span>Message on WhatsApp</span>
                </button>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-around">
              <div className="flex flex-col items-center cursor-pointer group">
                <span className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {internshipsApplied}
                </span>
                <span className="text-xs text-gray-500 font-medium">Internships</span>
              </div>

              <div className="w-px h-12 bg-gray-200"></div>

              <div className="flex flex-col items-center cursor-pointer group">
                <span className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                  {programsApplied}
                </span>
                <span className="text-xs text-gray-500 font-medium">Programs</span>
              </div>

              <div className="w-px h-12 bg-gray-200"></div>

              <div className="flex flex-col items-center cursor-pointer group">
                <span className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                  {eventsApplied}
                </span>
                <span className="text-xs text-gray-500 font-medium">Events</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-4xl mx-auto px-4 lg:px-6 space-y-6">
        {/* Quick Connect Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Connect with {data.full_name?.split(' ')[0]}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* LinkedIn */}
            {linkedinUrl && (
              <Link
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 p-4 bg-white rounded-xl hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-[#0A66C2] group"
              >
                <div className="w-10 h-10 bg-[#0A66C2] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Linkedin size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 group-hover:text-[#0A66C2]">LinkedIn</div>
                  <div className="text-xs text-gray-500">Professional network</div>
                </div>
              </Link>
            )}

            {/* WhatsApp */}
            {whatsappUrl && (
              <Link
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 p-4 bg-white rounded-xl hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-[#25D366] group"
              >
                <div className="w-10 h-10 bg-[#25D366] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 group-hover:text-[#25D366]">WhatsApp</div>
                  <div className="text-xs text-gray-500">Instant messaging</div>
                </div>
              </Link>
            )}

            {/* Email */}
            {data.email && (
              <Link
                href={`mailto:${data.email}?subject=Connection Request from ZigX&body=Hi ${data.full_name || 'there'},%0D%0A%0D%0AI came across your profile on ZigX and I'm impressed by your background. I'd love to connect and explore potential collaboration opportunities.%0D%0A%0D%0ALooking forward to hearing from you!`}
                className="flex items-center justify-center gap-3 p-4 bg-white rounded-xl hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-blue-500 group"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 group-hover:text-blue-500">Email</div>
                  <div className="text-xs text-gray-500">Professional email</div>
                </div>
              </Link>
            )}

            {/* Phone */}
            {data.phone && (
              <Link
                href={`tel:${data.phone}`}
                className="flex items-center justify-center gap-3 p-4 bg-white rounded-xl hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-green-500 group"
              >
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 group-hover:text-green-500">Phone</div>
                  <div className="text-xs text-gray-500">Direct call</div>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* About Section */}
        {data.about && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br bg-blue-600 rounded-xl flex items-center justify-center">
                <Briefcase size={20} className="text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">About</h2>
            </div>
            <p className="text-gray-700 leading-relaxed text-base">
              {data.about}
            </p>
          </div>
        )}

        {/* Skills Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          {/* Hard Skills */}
          {skills.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Award size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Hard Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string, i: number) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Soft Skills */}
          {soft.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Award size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Soft Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {soft.map((skill: string, i: number) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 rounded-full text-sm font-medium border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Additional Info Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Calendar size={20} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Activity</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {internshipsApplied}
              </div>
              <div className="text-sm text-gray-600">Internships Applied</div>
            </div>

            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {programsApplied}
              </div>
              <div className="text-sm text-gray-600">Programs Applied</div>
            </div>

            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {eventsApplied}
              </div>
              <div className="text-sm text-gray-600">Events Applied</div>
            </div>
          </div>
        </div>
      </div>

      {/* Connect bar fixed to bottom */}
      <ConnectBar 
        linkedin={data.linkedin_url} 
        whatsapp={data.phone} 
        x={data.twitter_url || data.x_url} 
        email={data.email} 
      />
    </div>
  );
}