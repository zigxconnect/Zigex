"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { User, Clock, MapPin, ExternalLink } from "lucide-react";

export const UpcomingEvents = () => {
  const upcoming = [
    {
      id: 1,
      title: "Product Designer Interview",
      candidate: "Sarah Doe",
      time: "10:00 AM - 11:00 AM",
      date: "Jan 6, 2026",
      type: "Virtual",
      color: "border-blue-500"
    },
    {
      id: 2,
      title: "UX Intern Review",
      candidate: "James Smith",
      time: "2:30 PM - 3:15 PM",
      date: "Jan 12, 2026",
      type: "Office",
      color: "border-purple-500"
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-white">
        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-6">Agenda <span className="text-secondary">Summary</span></h3>
        
        <div className="space-y-6">
          {upcoming.map((event) => (
            <div key={event.id} className={`pl-4 border-l-4 ${event.color} space-y-3 py-1 group cursor-pointer`}>
              <div>
                <h4 className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">{event.title}</h4>
                <div className="flex items-center gap-2 text-slate-400 mt-1">
                  <User size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-tight">{event.candidate}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Clock size={12} className="text-slate-300" />
                  <span className="text-[10px] font-bold">{event.time}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <MapPin size={12} className="text-slate-300" />
                  <span className="text-[10px] font-bold">{event.type}</span>
                </div>
              </div>
              
              <button className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest hover:gap-2 transition-all opacity-0 group-hover:opacity-100">
                View Details <ExternalLink size={10} />
              </button>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-8 py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-primary hover:text-primary transition-all">
          View Full Agenda
        </button>
      </Card>
      
      <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-slate-900 text-white relative overflow-hidden group">
         <div className="relative z-10">
            <h4 className="text-lg font-black mb-2">Power up your <br/><span className="text-indigo-400 italic">Scheduling</span></h4>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">Connect your Google or Outlook calendar to automate sync.</p>
            <button className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">
               Sync Calendars
            </button>
         </div>
         <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
      </Card>
    </div>
  );
};
