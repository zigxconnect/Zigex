"use client";

import React, { useState } from "react";
import { User, Shield, Bell, Users, CreditCard, Layout } from "lucide-react";

interface SettingsTabsProps {
  children: (activeTab: string) => React.ReactNode;
}

export const SettingsTabs = ({ children }: SettingsTabsProps) => {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Company Profile", icon: User },
    { id: "account", label: "Account Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "team", label: "Team Management", icon: Users },
    { id: "billing", label: "Billing & Plans", icon: CreditCard },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="lg:w-72 space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-[1.5rem] text-sm font-bold transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-white text-primary shadow-xl shadow-slate-200/50 translate-x-1"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <tab.icon size={18} className={activeTab === tab.id ? "text-primary" : "text-slate-400"} />
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </aside>

      <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
        {children(activeTab)}
      </div>
    </div>
  );
};
