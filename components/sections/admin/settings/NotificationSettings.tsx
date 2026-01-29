"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export const NotificationSettings = () => {
  const settings = [
    { title: "New Applications", description: "Get notified when a candidate applies to your posting.", default: true },
    { title: "Interview Reminders", description: "Daily digest of upcoming scheduled interviews.", default: true },
    { title: "Marketing Updates", description: "News about new features and recruitment tips.", default: false },
    { title: "System Alerts", description: "Important updates regarding your account status.", default: true },
  ];

  return (
    <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-white">
      <h3 className="text-xl font-black text-slate-900 tracking-tight mb-6">Email <span className="text-secondary italic">Preferences</span></h3>
      <div className="space-y-4">
        {settings.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-6 rounded-3xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">{item.description}</p>
            </div>
            <Switch defaultChecked={item.default} />
          </div>
        ))}
      </div>
      
      <div className="mt-8 pt-8 border-t border-slate-50 flex justify-end">
         <button className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg hover:shadow-primary/20">
            Save Preferences
         </button>
      </div>
    </Card>
  );
};
