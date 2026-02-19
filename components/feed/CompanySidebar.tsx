// components/feed/CompanySidebar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, Globe, MessageSquare } from "lucide-react";
import { normalizeImageSrc } from "@/lib/utils";

interface Company {
  id: string;
  company_name: string;
  logo_url?: string;
  email?: string;
  website_url?: string;
}

interface CompanySidebarProps {
  companies: Company[];
}

export function CompanySidebar({ companies }: CompanySidebarProps) {
  return (
    <div className="flex flex-col gap-6 sticky top-24">
      {/* Company Directory Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
          Partner Ecosystem
        </h3>
        
        <div className="space-y-6">
          {companies.slice(0, 10).map((company) => (
            <div 
              key={company.id} 
              className="flex items-center justify-between group py-2 border-b border-slate-50 last:border-0"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0 border border-slate-100 dark:border-slate-800">
                  <Image
                    src={normalizeImageSrc(company.logo_url || "/zigex.svg")}
                    alt={company.company_name}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#155DFC] transition-colors">
                    {company.company_name}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {company.email && (
                  <a 
                    href={`mailto:${company.email}`}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-[#155DFC]/10 hover:text-[#155DFC] transition-all"
                    title="Send Email"
                  >
                    <Mail size={14} />
                  </a>
                )}
                {company.website_url && (
                  <a 
                    href={company.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-[#155DFC]/10 hover:text-[#155DFC] transition-all"
                    title="Visit Website"
                  >
                    <Globe size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
          
          {companies.length === 0 && (
            <div className="text-center py-10">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No partners detected yet</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Contact Us CTA */}
      <Link 
        href="/contact"
        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 transition-all shadow-xl shadow-slate-200 dark:shadow-none uppercase tracking-[0.2em] text-[10px]"
      >
        <MessageSquare size={16} />
        <span>Contact Administration</span>
      </Link>
    </div>
  );
}
