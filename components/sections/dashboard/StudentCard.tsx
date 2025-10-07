"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';

interface StudentProps {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  university?: string | null;
  hard_skills?: string[] | null;
  soft_skills?: string[] | null;
  linkedin_url?: string | null;
}

interface StudentStats {
  internshipsApplied?: number;
  programsApplied?: number;
  eventsApplied?: number;
}

export const StudentCard: React.FC<{ student: StudentProps; stats?: StudentStats }> = ({ student, stats }) => {
  const initials =
    student.full_name?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ST";

  const primarySkills = (student.hard_skills || []).slice(0, 3);

  const router = useRouter();

  const goToProfile = () => router.push(`/dashboard/student/${student.id}`);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goToProfile();
    }
  };

  return (
    <div tabIndex={0} role="button" onKeyDown={onKeyDown} onClick={goToProfile} className="block">
      <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {student.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={student.avatar_url} alt={student.full_name || "Student"} className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">{initials}</div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="truncate">
                <p className="font-semibold text-gray-900 truncate">{student.full_name || "Unnamed Student"}</p>
                <p className="text-sm text-gray-500 truncate">{student.university || "University not specified"}</p>
              </div>
              <div className="text-sm text-gray-400">{/* optional timestamp */}</div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {primarySkills.map((s, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">{s}</span>
              ))}

              {student.soft_skills && student.soft_skills.length > 0 && (
                <span className="text-xs bg-yellow-50 text-yellow-800 px-2 py-1 rounded-full">{student.soft_skills[0]}</span>
              )}
            </div>

            <div className="mt-4 flex items-center gap-3 justify-between">
              <div className="flex items-center gap-3">
                {student.linkedin_url && (
                  <a href={student.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm">LinkedIn</a>
                )}
                {student.full_name && (
                  <span className="text-xs text-gray-400">•</span>
                )}
                <span className="text-xs text-gray-500">Connect</span>
              </div>

              <div className="flex-shrink-0">
                {/* Follow button: stops propagation so clicking it doesn't trigger outer navigation immediately */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToProfile();
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Follow
                </button>
              </div>
            </div>

            {/* Dummy statistics area */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <div className="flex flex-col items-center">
                  <span className="text-sm font-semibold text-gray-900">{stats?.internshipsApplied ?? 0}</span>
                  <span className="text-[11px] text-gray-400">Internships</span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-sm font-semibold text-gray-900">{stats?.programsApplied ?? 0}</span>
                  <span className="text-[11px] text-gray-400">Programs</span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-sm font-semibold text-gray-900">{stats?.eventsApplied ?? 0}</span>
                  <span className="text-[11px] text-gray-400">Events</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCard;
