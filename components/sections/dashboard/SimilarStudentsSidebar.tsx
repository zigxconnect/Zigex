"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Linkedin, MessageCircle, Mail, X, Users, AtSign } from "lucide-react";
import StackedAvatars from "./StackedAvatars";

interface SimilarStudent {
  id: string;
  full_name: string | null;
  avatar_url?: string | null;
  university?: string | null;
  linkedin_url?: string | null;
  phone?: string | null;
  email?: string | null;
  hard_skills?: string[] | null;
  soft_skills?: string[] | null;
}

export default function SimilarStudentsSidebar({
  students,
}: {
  students: SimilarStudent[];
}) {
  const [open, setOpen] = useState(false);
  
  // Debug log to verify data
  console.log("SimilarStudentsSidebar received students:", students);

  return (
    <>
      {/* Stacked Avatars - removed fixed positioning */}
      <div className="lg:hidden">
        {students && students.length > 0 ? (
          <StackedAvatars
            avatars={students.map(s => ({ src: s.avatar_url, name: s.full_name }))}
            maxVisible={3}
            moreCount={students.length > 3 ? students.length - 3 : 0}
            onClick={() => setOpen(true)}
          />
        ) : null}
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex justify-end lg:hidden"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md h-full bg-white shadow-2xl p-4 overflow-y-auto animate-slideRight"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">People you may know</h3>
              <button onClick={() => setOpen(false)} className="p-2">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {students.length === 0 && (
                <p className="text-sm text-gray-500">No similar students found.</p>
              )}

              {students.map((s) => (
                <article key={s.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {s.avatar_url ? (
                      <Image src={s.avatar_url} alt={s.full_name || "S"} width={48} height={48} className="object-cover" />
                    ) : (
                      (s.full_name || "?").split(" ").map(n => n[0]).slice(0,2).join("")
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm">{s.full_name || 'Unnamed'}</div>
                        <div className="text-xs text-gray-500">{s.university}</div>
                      </div>
                      <div className="text-xs text-gray-400">{(s.hard_skills || []).slice(0,2).join(', ')}</div>
                    </div>

                    <div className="mt-2 flex gap-2">
                      {s.linkedin_url && (
                        <a href={s.linkedin_url} target="_blank" rel="noreferrer" className="px-2 py-1 bg-[#0A66C2]/10 text-[#0A66C2] rounded-md text-xs font-semibold hover:bg-[#0A66C2]/20"> 
                          <Linkedin size={14} />
                        </a>
                      )}

                      {s.phone && (
                        <a href={`https://wa.me/${s.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="px-2 py-1 bg-[#25D366]/10 text-[#25D366] rounded-md text-xs font-semibold hover:bg-[#25D366]/20"> 
                          <MessageCircle size={14} />
                        </a>
                      )}

                      {s.email && (
                        <a href={`mailto:${s.email}`} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold hover:bg-blue-100"> 
                          <Mail size={14} />
                        </a>
                      )}

                      {/* Quick connect placeholder (X / Instagram style) */}
                      <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-semibold hover:bg-gray-200">@</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-4 text-center">
              <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg border">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop / large screen sidebar */}
      <aside className="hidden lg:block fixed top-28 right-6 w-80 h-[calc(100vh-7rem)] overflow-y-auto p-4 bg-white rounded-l-3xl shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold">People with similar skills</h3>
          <span className="text-xs text-gray-400">Connect • Explore</span>
        </div>

        <p className="text-sm text-gray-500 mb-4">We found people who share at least a few of your skills. You can message, view or follow them.</p>

        <div className="space-y-3">
          {students.length === 0 && (
            <p className="text-sm text-gray-500">No matches right now.</p>
          )}

          {students.map((s) => (
            <div key={s.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                {s.avatar_url ? (
                  <Image src={s.avatar_url} alt={s.full_name || "S"} width={48} height={48} className="object-cover" />
                ) : (
                  (s.full_name || "?").split(" ").map(n => n[0]).slice(0,2).join("")
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{s.full_name || 'Unnamed'}</div>
                    <div className="text-xs text-gray-500">{s.university}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* subtle social style buttons */}
                    {s.linkedin_url && (
                      <a href={s.linkedin_url} target="_blank" rel="noreferrer" className="p-2 rounded-md bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20">
                        <Linkedin size={16} />
                      </a>
                    )}
                    {s.email && (
                      <a href={`mailto:${s.email}`} className="p-2 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100">
                        <Mail size={16} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="text-xs text-gray-500">{(s.hard_skills || []).slice(0,3).join(', ')}</div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-xs font-semibold hover:scale-105">Message</button>
                    <button className="px-2 py-1 border rounded-md text-xs">View</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <a href="/dashboard/student" className="text-sm text-blue-600 font-semibold">See more recommendations</a>
        </div>

        <style jsx>{`
          @keyframes slideRight {
            from { transform: translateX(100%); opacity: 0 }
            to { transform: translateX(0); opacity: 1 }
          }
          .animate-slideRight { animation: slideRight 240ms ease-out; }
        `}</style>
      </aside>
    </>
  );
}
