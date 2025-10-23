"use client";

import { useState, useEffect, useMemo } from "react";
import { InternshipCard } from "./InternshipCard";
import { EventCard } from "./EventCard";
import { ProgramCard } from "./ProgramCard";
import { Briefcase, GraduationCap, Calendar, Sparkles, Search } from "lucide-react";
import { Internship, Event, Program } from "@/lib/types/dashoard/index";
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

interface InternshipListingsProps {
  searchQuery: string;
  isSearchOpen: boolean;
  onSearchOpen: () => void;
  onSearch: (query: string) => void;
}

export const InternshipListings = ({
  searchQuery,
  isSearchOpen,
  onSearchOpen,
  onSearch,
}: InternshipListingsProps) => {
  const [data, setData] = useState<{
    internships: Internship[];
    events: Event[];
    programs: Program[];
  }>({ internships: [], events: [], programs: [] });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
          internships: normalizeData(internshipsData, "internships") as Internship[],
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
  
  return content.filter((item) => {
    // Safely get the title
    const title = item.title?.toLowerCase() || "";
    
    // Safely get the description
    const description = item.description?.toLowerCase() || "";
    
    // Safely get company/organizer name - handle both string and object
    let companyName = "";
    if ((item as AllContentItem)._type === "internships") {
      const internship = item as Internship;
      companyName = typeof internship.company === "string" 
        ? internship.company 
        : internship.company?.company_name || "";
    } else if ((item as AllContentItem)._type === "events") {
      const event = item as Event;
      companyName = typeof event.company === "string"
        ? event.company
        : event.company?.company_name || "";
    } else if ((item as AllContentItem)._type === "programs") {
      const program = item as Program;
      companyName = typeof program.organizer === "string"
        ? program.organizer
        : "";
    }
    
    const company = companyName.toLowerCase();
    
    // Check if query matches any field
    return (
      title.includes(query) ||
      description.includes(query) ||
      company.includes(query)
    );
  });
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
      return <LoadingSkeleton />;
    }

    if (error) {
      return (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to Load Opportunities
          </h3>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      );
    }

    if (filteredData.length === 0) {
      return (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Search size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No {searchQuery ? "Matching" : ""} Opportunities Found
          </h3>
          <p className="text-gray-600 text-sm">
            {searchQuery
              ? `Try adjusting your search or browse all opportunities`
              : `Check back later for new opportunities`}
          </p>
          {searchQuery && (
            <button
              onClick={() => onSearch("")}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((item, index) => {
          const CardComponent =
            (item as AllContentItem)._type === "internships"
              ? InternshipCard
              : (item as AllContentItem)._type === "events"
              ? EventCard
              : ProgramCard;

          const cardProps =
            (item as AllContentItem)._type === "internships"
              ? item
              : (item as AllContentItem)._type === "events"
              ? { event: item }
              : { program: item };

          return (
            <div
              key={item.id}
              className="animate-fadeIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* @ts-ignore */}
              <CardComponent {...cardProps} />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with Search Button and Tabs */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
          {/* Search Trigger Button */}
          <button
            onClick={onSearchOpen}
            className="w-full lg:w-96 flex items-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all duration-200 group"
          >
            <Search
              size={20}
              className="text-gray-400 group-hover:text-blue-600 transition-colors"
            />
            <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors flex-1 text-left">
              {searchQuery || "Search internships, programs, events..."}
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">
              <span>⌘</span>K
            </kbd>
          </button>

          {/* Tabs */}
          <div className="w-full lg:w-auto overflow-x-auto scrollbar-hide">
            <div className="inline-flex bg-gray-100 rounded-xl p-1.5 shadow-sm min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 whitespace-nowrap ${getTabColorClasses(
                    tab.color,
                    activeTab === tab.id
                  )} ${
                    activeTab === tab.id ? "scale-105 shadow-lg" : "hover:scale-102"
                  }`}
                >
                  <tab.icon size={16} />
                  <span>{tab.label}</span>
                  {!isLoading && tab.count > 0 && (
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
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

        {/* Active Search Indicator */}
        {searchQuery && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Search size={16} className="text-blue-600" />
            <p className="text-sm text-blue-900 flex-1">
              Showing results for{" "}
              <span className="font-semibold">"{searchQuery}"</span>
            </p>
            <button
              onClick={() => onSearch("")}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Clear
            </button>
          </div>
        )}

        {/* Results Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {tabs.find((t) => t.id === activeTab)?.label} Opportunities
          </h2>
          {!isLoading && filteredData.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {filteredData.length} {filteredData.length === 1 ? "result" : "results"}{" "}
              found
            </p>
          )}
        </div>

        {/* Content */}
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