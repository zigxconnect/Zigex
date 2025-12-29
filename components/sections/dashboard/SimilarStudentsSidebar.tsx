"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Linkedin, MessageCircle, Mail, X, Users, AtSign, ArrowRight } from "lucide-react";
import StackedAvatars from "./StackedAvatars";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import DeveloperAvatarOverlap from "@/components/ui/DeveloperAvatarOverlap";

interface SimilarStudent {
  id: string;
  username?: string;
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
  const router = useRouter();
  
  // Helper to pick best avatar source
  function pickAvatar(s: SimilarStudent) {
    const anyS = s as any;
    if (s.avatar_url) return s.avatar_url;
    if (anyS.profile_picture) return anyS.profile_picture;
    if (anyS.profile?.avatar_url) return anyS.profile.avatar_url;
    if (anyS.user?.user_metadata?.avatar_url) return anyS.user.user_metadata.avatar_url;
    // fallback generated avatar
    const seed = encodeURIComponent(s.full_name || s.id || "unknown");
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  }

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
            className="w-full max-w-md h-full bg-card p-4 overflow-y-auto animate-slideRight custom-scroll"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-bold text-foreground">People you may know</h3>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-muted rounded-full">
                <X size={18} className="text-foreground" />
              </button>
            </div>

            <div className="space-y-3">
              {students.length === 0 && (
                <p className="text-sm text-gray-500">No similar students found.</p>
              )}

              {students.map((s) => (
                <article key={s.id} className="flex items-center gap-3 p-3 cursor-pointer rounded-xl hover:bg-muted transition"
                 onClick={() => router.push(`/dashboard/student/${s.username || s.id}`)}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-primary flex items-center justify-center text-white font-bold">
                    {(() => {
                      const src = pickAvatar(s);
                      return src ? (
                        <img 
                          src={src} 
                          alt={s.full_name || "S"} 
                          className="w-full h-full object-cover"
                          loading="lazy" 
                        />
                      ) : (
                        (s.full_name || "?").split(" ").map(n => n[0]).slice(0,2).join("")
                      )
                    })()}
                  </div>
                {/* <p className="text-4xl bg-red-600 w-23 h-43 text-white">{s.avatar_url}</p> */}

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm text-foreground">{s.username || s.full_name || 'Unnamed'}</div>
                        <div className="text-xs text-muted-foreground">{s.university}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">{(s.hard_skills || []).slice(0,2).join(', ')}</div>
                    </div>

                    <div className="mt-2 flex gap-2">
                      {s.linkedin_url && (
                        <Link href={s.linkedin_url} target="_blank" rel="noreferrer" className="px-2 py-1 bg-muted text-foreground rounded-md text-xs font-semibold hover:bg-primary hover:text-white transition-colors"> 
                          <AtSign size={14} />
                        </Link>
                      )}

                      {s.phone && (
                        <Link href={`https://wa.me/${s.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="px-2 py-1 bg-muted text-foreground rounded-md text-xs font-semibold hover:bg-green-500 hover:text-white transition-colors"> 
                          <MessageCircle size={14} />
                        </Link>
                      )}

                      {s.email && (
                        <Link href={`mailto:${s.email}`} className="px-2 py-1 bg-muted text-foreground rounded-md text-xs font-semibold hover:bg-primary hover:text-white transition-colors"> 
                          <Mail size={14} />
                        </Link>
                      )}

                     
                      <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-semibold hover:bg-gray-200">@</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t border-border">
              <Link href="/feed/mentorship" className="block group transition-all duration-300">
                <div className="bg-blue-50/30 rounded-2xl p-5 border border-blue-100/50">
                  <DeveloperAvatarOverlap 
                    size="sm"
                    title="Need a Mentor?"
                    subtitle="Connect with industrial experts"
                  />
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] font-black text-blue-700 uppercase tracking-[0.2em]">Get Mentor</span>
                    <ArrowRight size={14} className="text-blue-600" />
                  </div>
                </div>
              </Link>
            </div>

            <div className="mt-6 text-center">
              <button onClick={() => setOpen(false)} className="w-full py-3 rounded-xl border border-border font-bold text-sm text-muted-foreground hover:bg-muted transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

    
      <aside className="hidden lg:block fixed top-28 right-6 w-80 lg:w-96 h-[calc(100vh-7rem)] overflow-y-auto p-4 bg-card rounded-3xl border border-border custom-scroll">
        <div className="flex items-center justify-between mb-3">

       
          <h3 className="text-lg font-heading font-bold text-foreground">Recommendations</h3>
          <span className="text-xs text-muted-foreground">Connect • Explore</span>
        </div>

        <p className="text-sm text-muted-foreground mb-4">We found people who share at least a few of your skills. You can connect with them.</p>

        <div className="space-y-3">
          {students.length === 0 && (
            <p className="text-sm text-muted-foreground">No matches right now.</p>
          )}

          {students.map((s) => (
            <div
              key={s.id}
              role="link"
              tabIndex={0}
              onClick={() => router.push(`/dashboard/student/${s.username || s.id}`)}
              onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/dashboard/student/${s.username || s.id}`); }}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition cursor-pointer border border-transparent hover:border-border"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-primary flex items-center justify-center text-white font-bold shrink-0">
                {s.avatar_url ? (
                  <Image src={s.avatar_url} alt={s.full_name || "S"} width={48} height={48} className="object-cover" />
                ) : (
                  (s.full_name || "?").split(" ").map(n => n[0]).slice(0,2).join("")
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-foreground">{s.username || s.full_name || 'Unnamed'}</div>
                    <div className="text-xs text-muted-foreground">{s.university}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* subtle social style buttons (external links are safe because outer element is not an <a>) */}
                    {s.linkedin_url && (
                      <a 
                        href={s.linkedin_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-1.5 rounded-lg bg-muted text-foreground hover:bg-primary hover:text-white transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <AtSign size={15} />
                      </a>
                    )}
                    {s.email && (
                      <a 
                        href={`mailto:${s.email}`} 
                        className="p-1.5 rounded-lg bg-muted text-foreground hover:bg-primary hover:text-white transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Mail size={15} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">{(s.hard_skills || []).slice(0,3).join(', ')}</div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-semibold hover:scale-105">Message</button>
                    <button className="px-2 py-1 border border-border rounded-md text-xs hover:bg-muted">View</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center border-b border-border pb-6">
          <Link href="/dashboard/student" className="text-sm text-primary font-semibold">See more recommendations</Link>
        </div>

        {/* Get Mentor Section */}
        <div className="mt-8 pt-2">
          <Link href="/feed/mentorship" className="block group transition-all duration-300">
            <div className="bg-blue-50/50 rounded-[2rem] p-6 border border-blue-100/50 group-hover:bg-blue-50 group-hover:border-blue-200 transition-all">
              <DeveloperAvatarOverlap 
                size="sm"
                title="Elite Mentors"
                subtitle="Get career guidance from experts"
              />
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-black text-blue-700 uppercase tracking-widest">Get Mentor</span>
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </Link>
        </div>


        <style jsx>{`
          @keyframes slideRight {
            from { transform: translateX(100%); opacity: 0 }
            to { transform: translateX(0); opacity: 1 }
          }
          .animate-slideRight { animation: slideRight 240ms ease-out; }

          /* Custom scrollbar styling */
          .custom-scroll::-webkit-scrollbar {
            width: 8px;
          }
          
          .custom-scroll::-webkit-scrollbar-track {
            background: transparent;
            margin: 8px 0;
          }
          
          .custom-scroll::-webkit-scrollbar-thumb {
            background: var(--primary);
            border-radius: 999px;
            border: 2px solid rgba(255,255,255,0.6);
          }
          
          /* Firefox */
          .custom-scroll {
            scrollbar-width: thin;
            scrollbar-color: var(--primary) transparent;
          }
        `}</style>
      </aside>
    </>
  );
}
