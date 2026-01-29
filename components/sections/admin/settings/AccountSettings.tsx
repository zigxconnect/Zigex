"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, Mail, Smartphone } from "lucide-react";

export const AccountSettings = () => {
  return (
    <div className="space-y-6">
      <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-white">
        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-6">Security <span className="text-primary italic">Credentials</span></h3>
        
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <Input value="admin@company.com" disabled className="pl-12 bg-slate-50 border-none rounded-2xl h-12 text-slate-500 font-bold" />
              </div>
            </div>
            
            <div className="space-y-1.5 opacity-50">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Phone Number</label>
              <div className="relative">
                <Smartphone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <Input placeholder="+1 234 567 890" disabled className="pl-12 bg-slate-50 border-none rounded-2xl h-12 font-bold" />
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm">
                <KeyRound size={24} className="text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Password Management</h4>
                <p className="text-xs text-slate-400 mt-0.5">Change your security credentials at any time.</p>
              </div>
            </div>
            <Button variant="outline" className="rounded-xl border-slate-200 bg-white h-10 px-6 text-xs font-bold uppercase transition-all hover:bg-slate-900 hover:text-white">
              Update Password
            </Button>
          </div>
        </div>
      </Card>
      
      <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-red-50/50 border-red-100">
         <h4 className="text-sm font-black text-red-600 uppercase tracking-widest mb-2">Danger Zone</h4>
         <p className="text-xs text-red-400 mb-6 leading-relaxed">Once you delete your organization, there is no going back. Please be certain.</p>
         <Button variant="ghost" className="text-red-500 hover:bg-red-500 hover:text-white rounded-xl h-12 px-8 text-xs font-black uppercase tracking-widest transition-all">
            Delete Organization
         </Button>
      </Card>
    </div>
  );
};
