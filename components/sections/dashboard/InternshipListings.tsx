"use client";

import { useState, useEffect, useMemo } from "react";
import { InternshipCard } from "./InternshipCard";
import { EventCard } from "./EventCard";
import { ProgramCard } from "./ProgramCard";
// import { LoadingSkeleton } from "./LoadingSkeleton";

import { Briefcase, GraduationCap, Calendar, Sparkles } from "lucide-react";
import { Internship, Event, Program } from "@/lib/types/dashoard/index";
import { DashboardSearch } from "./InternshipSearch";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
type TabType = "internships" | "programs" | "events";
type TabId = "all" | TabType;

type AllContentItem = (Internship | Event | Program) & { _type: TabType };

const normalizeData = (data: any[], tab: TabType): any[] => {
  if (tab === "internships") {
    return data.map((item: any) => ({
      ...item,
      _type: "internships",
      company: item.company_profiles?.company_name || "Confidential",
    }));
  }
  if (tab === "events") {
    return data.map((item: any) => ({ ...item, _type: "events" }));
  }
  if (tab === "programs") {
    return data.map((item: any) => ({ ...item, _type: "programs" }));
  }
  return data;
};

export const InternshipListings = () => {
  // Main state for holding all fetched data
  const [data, setData] = useState<{
    internships: Internship[];
    events: Event[];
    programs: Program[];
  }>({ internships: [], events: [], programs: [] });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("all");

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [internshipsRes, eventsRes, programsRes] = await Promise.all([
          fetch("/api/students/internships"),
          fetch("/api/students/events"),
          fetch("/api/students/programs"),
        ]);

        if (!internshipsRes.ok || !eventsRes.ok || !programsRes.ok) {
          throw new Error("Failed to fetch one or more data sources.");
        }

        const [internshipsData, eventsData, programsData] = await Promise.all([
          internshipsRes.json(),
          eventsRes.json(),
          programsRes.json(),
        ]);

        setData({
          internships: normalizeData(
            internshipsData,
            "internships"
          ) as Internship[],
          events: normalizeData(eventsData, "events") as Event[],
          programs: normalizeData(programsData, "programs") as Program[],
        });
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const allContentSorted = useMemo(() => {
    const combined = [...data.internships, ...data.events, ...data.programs];

    return combined.sort((a, b) => {
      const dateA = new Date((a as Event).start_date || (a as any).created_at);
      const dateB = new Date((b as Event).start_date || (b as any).created_at);
      return dateB.getTime() - dateA.getTime();
    });
  }, [data]);

  const filteredData = useMemo(() => {
    let content: AllContentItem[] = [];

    if (activeTab === "all") {
      content = allContentSorted as AllContentItem[];
    } else {
      content = data[activeTab] as AllContentItem[];
    }

    if (!searchQuery.trim()) {
      return content;
    }

    const query = searchQuery.toLowerCase().trim();
    return content.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        (
          (item as Internship).company ||
          (item as Event).company?.company_name ||
          ""
        )
          .toLowerCase()
          .includes(query)
    );
  }, [activeTab, searchQuery, data, allContentSorted]);

  const tabs = [
    {
      id: "all" as TabId,
      label: "All",
      icon: Sparkles,
      count: allContentSorted.length,
      color: "gray",
    },
    {
      id: "internships" as TabId,
      label: "Internships",
      icon: Briefcase,
      count: data.internships.length,
      color: "blue",
    },
    {
      id: "programs" as TabId,
      label: "Programs",
      icon: GraduationCap,
      count: data.programs.length,
      color: "purple",
    },
    {
      id: "events" as TabId,
      label: "Events",
      icon: Calendar,
      count: data.events.length,
      color: "green",
    },
  ];

  const getTabColorClasses = (color: string, isActive: boolean) => {
    const colorMap: Record<string, any> = {
      gray: {
        active: "bg-gray-800 text-white shadow-gray-400",
        inactive: "text-gray-600 hover:bg-gray-100",
      },
      blue: {
        active: "bg-blue-600 text-white shadow-blue-200",
        inactive: "text-blue-600 hover:bg-blue-50",
      },
      purple: {
        active: "bg-purple-600 text-white shadow-purple-200",
        inactive: "text-purple-600 hover:bg-purple-50",
      },
      green: {
        active: "bg-green-600 text-white shadow-green-200",
        inactive: "text-green-600 hover:bg-green-50",
      },
    };
    return isActive ? colorMap[color].active : colorMap[color].inactive;
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSkeleton/>;
    }
    
    if (error) {
      return (
        <div className="text-center py-20 text-red-500">Error: {error}</div>
      );
    }
    
    if (filteredData.length === 0) {
      return (
        <div className="text-center py-20">
          <h3>No {searchQuery ? "matching" : ""} opportunities found.</h3>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredData.map((item, index) => {
          switch ((item as AllContentItem)._type) {
            case "internships":
              return (
                <div
                  key={item.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <InternshipCard {...(item as Internship)} />
                </div>
              );
            case "events":
              return (
                <div
                  key={item.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <EventCard event={item as Event} />
                </div>
              );
            case "programs":
              return (
                <div
                  key={item.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProgramCard program={item as Program} />
                </div>
              );
            default:
              return null;
          }
        })}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex lg:flex-row flex-col flex-col-reverse items-center justify-between w-full">
          <DashboardSearch onSearch={setSearchQuery} />
          <div className="mb-10">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="inline-flex bg-gray-100 rounded-2xl p-2 shadow-sm min-w-max">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-3 px-3 py-1 rounded-lg font-medium text-sm transition-all duration-300 whitespace-nowrap ${getTabColorClasses(
                      tab.color,
                      activeTab === tab.id
                    )} ${activeTab === tab.id ? "scale-105" : "hover:scale-102"}`}
                  >
                    <tab.icon size={18} />
                    <span>{tab.label}</span>
                    {!isLoading && tab.count > 0 && (
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-semibold ${
                          activeTab === tab.id
                            ? "bg-white/20 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {tabs.find((t) => t.id === activeTab)?.label} Opportunities
        </h1>
        {renderContent()}
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};