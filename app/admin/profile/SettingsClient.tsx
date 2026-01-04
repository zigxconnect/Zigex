"use client";

import React from "react";
import Image from "next/image";
import { SettingsTabs } from "@/components/sections/admin/settings/SettingsTabs";
import { EditCompanyProfileForm } from "@/components/sections/admin/EditCompanyProfileForm";
import { AccountSettings } from "@/components/sections/admin/settings/AccountSettings";
import { NotificationSettings } from "@/components/sections/admin/settings/NotificationSettings";
import { Camera, Sparkles } from "lucide-react";

export const SettingsClient = ({ initialData }: { initialData: any }) => {
  return (
    <div className="animate-in fade-in duration-700">
      {/* Premium Header */}
      <div className="relative mb-12">
        <div className="w-full h-64 bg-slate-900 rounded-[3rem] overflow-hidden group shadow-2xl relative">
          {initialData.cover_image_url ? (
            <Image
              src={initialData.cover_image_url}
              alt="Company Cover"
              width={1600}
              height={400}
              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-slate-900 to-black opacity-80" />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          <button className="absolute bottom-6 right-8 bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-2">
            <Camera size={16} />
            Update Cover
          </button>
          
          <div className="absolute top-8 left-10">
             <div className="flex items-center gap-2 bg-indigo-500/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-indigo-400/30">
               <Sparkles size={12} className="text-indigo-300" />
               <span className="text-[10px] font-black text-indigo-100 uppercase tracking-widest">Organization Admin</span>
             </div>
          </div>
        </div>

        <div className="absolute -bottom-10 left-12 group">
          <div className="w-32 h-32 bg-white rounded-[2rem] border-[6px] border-[#F6F8FF] shadow-2xl overflow-hidden relative">
            {initialData.logo_url ? (
              <Image
                src={initialData.logo_url}
                alt="Logo"
                width={128}
                height={128}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-primary flex items-center justify-center text-white text-3xl font-black">
                {initialData.company_name?.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Camera size={24} className="text-white" />
            </div>
          </div>
        </div>
        
        <div className="ml-48 pt-4">
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">{initialData.company_name}</h1>
           <p className="text-slate-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
              Settings & Control Center 
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
           </p>
        </div>
      </div>

      <SettingsTabs>
        {(activeTab) => (
          <div className="min-h-[500px]">
            {activeTab === "profile" && (
              <div className="bg-white p-2 rounded-[2.5rem] shadow-sm">
                <EditCompanyProfileForm initialData={initialData} />
              </div>
            )}
            {activeTab === "account" && <AccountSettings />}
            {activeTab === "notifications" && <NotificationSettings />}
            {activeTab === "team" && (
              <div className="p-20 text-center bg-white rounded-[2.5rem] shadow-sm border-2 border-dashed border-slate-100">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Users size={32} className="text-slate-200" />
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-2">Invite your Team</h4>
                <p className="text-sm text-slate-400 max-w-sm mx-auto mb-8 font-medium">Collaborate with your colleagues and manage applications together.</p>
                <button className="px-8 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                   Add Team Member
                </button>
              </div>
            )}
            {activeTab === "billing" && (
               <div className="p-20 text-center bg-indigo-50/30 rounded-[2.5rem] shadow-sm border-2 border-dashed border-indigo-100 overflow-hidden relative">
                <div className="relative z-10">
                   <h4 className="text-2xl font-black text-indigo-950 mb-4 italic">Corporate Pro</h4>
                   <p className="text-sm text-indigo-400 mb-10 max-w-sm mx-auto font-medium">You are currently on the free pilot plan. Upgrade to unlock all premium features.</p>
                   <button className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200">
                     View Pricing Plans
                   </button>
                </div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/50 rounded-full blur-3xl" />
              </div>
            )}
          </div>
        )}
      </SettingsTabs>
    </div>
  );
};

const Users = ({ size, className }: { size: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
