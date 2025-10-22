import React from "react";
import { supabaseAdmin } from "@/lib/supabase/server";
// ConnectBar is a client component (uses "use client"). Import it directly.
import ConnectBar from "@/components/sections/dashboard/ConnectBar";

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
  const internshipsApplied = (seed % 5) + 0; // 0-4
  const programsApplied = (seed % 3) + 0; // 0-2
  const eventsApplied = (seed % 4) + 0; // 0-3

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <div>
            {data.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.avatar_url} alt={data.full_name} className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-2xl">{(data.full_name || "").split(" ").map((n: string) => n[0]).slice(0,2).join("")}</div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{data.full_name || "Unnamed"}</h1>
            <p className="text-gray-600">{data.university || "University not specified"}</p>
            <div className="mt-3 flex gap-3">
              {data.linkedin_url && (
                <a href={data.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-600">LinkedIn</a>
              )}
              {data.github_url && (
                <a href={data.github_url} target="_blank" rel="noreferrer" className="text-gray-800">GitHub</a>
              )}
            </div>
          </div>
        </div>

        {/* Stats panel */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-center">
            <div className="text-lg font-semibold text-gray-900">{internshipsApplied}</div>
            <div className="text-xs text-gray-500">Internships applied</div>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-center">
            <div className="text-lg font-semibold text-gray-900">{programsApplied}</div>
            <div className="text-xs text-gray-500">Programs applied</div>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-center">
            <div className="text-lg font-semibold text-gray-900">{eventsApplied}</div>
            <div className="text-xs text-gray-500">Events applied</div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold">Hard Skills</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {skills.map((s: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{s}</span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold">Soft Skills</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {soft.map((s: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-yellow-50 rounded-full text-sm">{s}</span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold">About</h3>
          <p className="text-gray-700 mt-2">{data.about || "No bio available."}</p>
        </div>
      </div>
      {/* Connect bar fixed to bottom */}
      <ConnectBar linkedin={data.linkedin_url} whatsapp={data.phone} x={data.twitter_url || data.x_url} email={data.email} />
    </div>
  );
}
