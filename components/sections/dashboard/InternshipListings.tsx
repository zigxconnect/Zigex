"use client";

import { useState, useEffect, useMemo } from "react";
import { InternshipCard } from "./InternshipCard";
import { EventCard } from "./EventCard";
import { ProgramCard } from "./ProgramCard";
import { Briefcase, GraduationCap, Calendar, Sparkles, Search } from "lucide-react";
import { Internship, Event, Program } from "@/lib/types/dashoard/index";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { useVideoModal } from "@/hooks/UseVideoModal";
import { LiveVideoModal } from "./Video/LiveVideoModal";
import { HappeningNowGrid } from "@/components/layout/dashboard/HappeningNow";
// import { LiveVideoModal } from "@/components/LiveVideoModal";
// import { useVideoModal } from "@/hooks/useVideoModal";

type TabType = "internships" | "programs" | "events";
type TabId = "all" | TabType | "live";
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
  const [liveIds, setLiveIds] = useState<Set<string>>(new Set());
  const [liveMeta, setLiveMeta] = useState<Record<string, { youtube?: string; description?: string }>>({});

  // Video Modal Hook
  const { isOpen, modalData, openModal, closeModal } = useVideoModal();

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

        const hasAny = (internshipsData?.length || 0) + (eventsData?.length || 0) + (programsData?.length || 0) > 0;

        const demoInternships = [
          {
            id: "i1",
            title: "Software Intern — Live Q&A",
            company: "NervTech",
            location: "Remote",
            type: "Full-time",
            category: "engineering",
            logo_url: "/nervtech.png",
            cover_image_url: "/intern.png",
            description: "<p>Join the live Q&A with the hiring team and learn about the role.</p>",
          },
        ];

        const demoEvents = [
          {
            id: "e1",
            title: "Live Networking Hour",
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
            company: { company_name: "Community" },
            event_picture_url: "/sky8.png",
            description: "<p>Networking hour with industry leaders. Watch live talks and ask questions during the stream.</p>",
          },
        ];

        const demoPrograms = [
          {
            id: "p1",
            title: "Live Design Sprint — October",
            program_category: "bootcamp",
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
            company: { company_name: "Seed Labs" },
            program_picture_url: "/skye8-internship.jpg",
            description: "<p>Join our intensive design sprint where you'll build a prototype in one week. Expect live demos, critiques, and Q&amp;A.</p>",
          },
        ];

        setData({
          internships: normalizeData(hasAny ? internshipsData : demoInternships, "internships") as Internship[],
          events: normalizeData(hasAny ? eventsData : demoEvents, "events") as Event[],
          programs: normalizeData(hasAny ? programsData : demoPrograms, "programs") as Program[],
        });

        const ids = new Set<string>();
        const meta: Record<string, { youtube?: string; description?: string }> = {};

        // Mark demo items as live
        if (!hasAny) {
          ids.add("i1");
          ids.add("e1");
          ids.add("p1");
          meta["i1"] = {
            youtube: "https://youtu.be/CEITpcIttl4?si=KNqazGJ1YRdl4rmq",
            description: "<p>Join the live Q&A with the hiring team and learn about the role.</p>",
          };
          meta["e1"] = {
            youtube: "https://youtu.be/CEITpcIttl4?si=KNqazGJ1YRdl4rmq",
            description: "<p>Networking hour with industry leaders. Watch live talks and ask questions during the stream.</p>",
          };
          meta["p1"] = {
            youtube: "https://youtu.be/CEITpcIttl4?si=KNqazGJ1YRdl4rmq",
            description: "<p>Join our intensive design sprint where you'll build a prototype in one week. Expect live demos, critiques, and Q&amp;A.</p>",
          };
        } else {
          if ((internshipsData || []).length > 0) {
            const first = internshipsData[0];
            ids.add(first.id);
            meta[first.id] = {
              youtube: "https://youtu.be/CEITpcIttl4?si=KNqazGJ1YRdl4rmq",
              description: first.description || `<p>${first.title || 'Internship'} — Live Q&A and walkthrough.</p>`,
            };
          }
          if ((eventsData || []).length > 0) {
            const first = eventsData[0];
            ids.add(first.id);
            meta[first.id] = {
              youtube: "https://youtu.be/CEITpcIttl4?si=KNqazGJ1YRdl4rmq",
              description: first.description || `<p>${first.title || 'Event'} — Live stream and networking.</p>`,
            };
          }
          if ((programsData || []).length > 0) {
            const first = programsData[0];
            ids.add(first.id);
            meta[first.id] = {
              youtube: "https://youtu.be/CEITpcIttl4?si=KNqazGJ1YRdl4rmq",
              description: first.description || `<p>${first.title || 'Program'} — Live session and demos.</p>`,
            };
          }
        }

        setLiveIds(ids);
        setLiveMeta(meta);
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
      if (activeTab === "live") {
        const all = [...data.internships, ...data.events, ...data.programs] as AllContentItem[];
        content = all.filter((it) => liveIds.has(it.id));
      } else {
        content = data[activeTab] as AllContentItem[];
      }
    }

    if (!searchQuery.trim()) {
      return content;
    }

    const query = searchQuery.toLowerCase().trim();

    return content.filter((item) => {
      const title = item.title?.toLowerCase() || "";
      const description = item.description?.toLowerCase() || "";

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

      return (
        title.includes(query) ||
        description.includes(query) ||
        company.includes(query)
      );
    });
  }, [activeTab, searchQuery, data, allContentSorted, liveIds]);

  const tabs = [
    {
      id: "live" as TabId,
      label: "Live",
      icon: Sparkles,
      count: liveIds.size,
      color: "red",
    },
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
        red: {
        active: "bg-red-600 text-white shadow-gray-400",
        inactive: "text-red-600 hover:bg-blue-60",
      },
      gray: {
        active: "bg-blue-600 text-white shadow-gray-400",
        inactive: "text-blue-600 hover:bg-blue-60",
      },
      blue: {
        active: "bg-blue-600 text-white shadow-blue-200",
        inactive: "text-blue-600 hover:bg-blue-50",
      },
      purple: {
        active: "bg-blue-600 text-white shadow-purple-200",
        inactive: "text-blue-600 hover:bg-blue-50",
      },
      green: {
        active: "bg-blue-600 text-white shadow-green-200",
        inactive: "text-blue-600 hover:bg-blue-50",
      },
    };
    return isActive ? colorMap[color].active : colorMap[color].inactive;
  };

  // Handle Live Button Click
  const handleLiveClick = (item: AllContentItem) => {
    const itemMeta = liveMeta[item.id] || {};
    let companyName = "";
    let thumbnail = "";

    if ((item as AllContentItem)._type === "internships") {
      const internship = item as Internship;
      companyName = typeof internship.company === "string"
        ? internship.company
        // @ts-ignore
        : internship.company?.company_name || "Company";
      thumbnail = (internship as any).cover_image_url || "/intern.png";
    } else if ((item as AllContentItem)._type === "events") {
      const event = item as Event;
      companyName = typeof event.company === "string"
        ? event.company
        : event.company?.company_name || "Event Organizer";
      thumbnail = (event as any).event_picture_url || "/sky8.png";
    } else if ((item as AllContentItem)._type === "programs") {
      const program = item as Program;
      companyName = (program as any).company?.company_name || "Program Organizer";
      thumbnail = (program as any).program_picture_url || "/skye8-internship.jpg";
    }

    openModal({
      videoUrl: itemMeta.youtube || "https://www.youtube.com/watch?v=ysz5S6PUM-U",
      title: item.title,
      company: companyName,
      description: itemMeta.description || item.description,
      thumbnail: thumbnail,
      viewerCount: Math.floor(Math.random() * 2000) + 500, // Random viewer count for demo
    });
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

          const isItemLive = liveIds.has(item.id);
          const itemMeta = liveMeta[item.id] || {};
          
          const baseProps = (item as AllContentItem)._type === "internships"
            ? { 
                ...item, 
                is_live: isItemLive, 
                live_stream_url: itemMeta.youtube, 
                description: itemMeta.description || item.description,
                onLiveClick: isItemLive ? () => handleLiveClick(item) : undefined,
              }
            : (item as AllContentItem)._type === "events"
            ? { 
                event: { 
                  ...item, 
                  is_live: isItemLive, 
                  live_stream_url: itemMeta.youtube, 
                  description: itemMeta.description || item.description 
                },
                onLiveClick: isItemLive ? () => handleLiveClick(item) : undefined,
              }
            : { 
                program: { 
                  ...item, 
                  is_live: isItemLive, 
                  live_stream_url: itemMeta.youtube, 
                  description: itemMeta.description || item.description 
                },
                onLiveClick: isItemLive ? () => handleLiveClick(item) : undefined,
              };

          return (
            <div
              key={item.id}
              className="animate-fadeIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* @ts-ignore */}
              <CardComponent {...baseProps} />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div className="w-full">
        <HappeningNowGrid/>

        <div className="max-w-7xl mx-auto px-4">
          {/* Header with Search Button and Tabs */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
            {/* Search Trigger Button */}
            <button
              onClick={onSearchOpen}
              className="w-full lg:w-96 flex items-center gap-3 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all duration-200 group"
            >
              <Search
                size={20}
                className="text-gray-400 group-hover:text-blue-600 transition-colors"
              />
              <span className="md:text-sm text-[12px] text-gray-500 group-hover:text-gray-700 transition-colors flex-1 text-left">
                {searchQuery || "Search internships zigx..."}
              </span>
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">
                <span>⌘</span>K
              </kbd>
            </button>

            {/* Tabs */}
            <div className="w-full lg:w-auto overflow-x-auto scrollbar-hide">
              <div className="inline-flex bg-gray-100 rounded-xl p-1.5 shadow-sm min-w-max g">
              {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center cursor-pointer gap-3 px-2 py-1 rounded-sm font-medium text-[12px] md:text-sm transition-all duration-300 whitespace-nowrap ${getTabColorClasses(
                      tab.color,
                      activeTab === tab.id
                    )} ${
                      activeTab === tab.id ? "scale-105 shadow-lg" : "hover:scale-102"
                    }`}
                  >
                    {/* <tab.icon size={16} /> */}
                    <span>{tab.label}</span>
                    {!isLoading && tab.count > 0 && (
                      <span
                        className={`px-2 py-0.5 md:text-sm text-[12px] rounded-full font-semibold ${
                          activeTab === tab.id
                            ? "bg-white/20 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}*/
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

      {/* Live Video Modal */}
      {modalData && (
        <LiveVideoModal
          isOpen={isOpen}
          onClose={closeModal}
          videoUrl={modalData.videoUrl}
          title={modalData.title}
          company={modalData.company}
          description={modalData.description}
          thumbnail={modalData.thumbnail}
          viewerCount={modalData.viewerCount}
        />
      )}
    </>
  );
};