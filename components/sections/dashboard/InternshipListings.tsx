"use client";

// TypeScript interfaces for internship data
export interface EmployerProfile {
  company_name?: string;
  logoColor?: string;
  headQuarterImage?: string;
}

export interface Internship {
  id: string;
  title: string;
  company_profiles?: EmployerProfile;
  company: string;
  logoColor: string;
  headQuarterImage: string;
  location: string;
  type: string;
  category: string;
  cover_image_url?: string;
}

type TabType = "internships" | "programs" | "events";

import { useState, useEffect, useMemo } from "react";
import { InternshipCard } from "./InternshipCard";
import { Spinner } from "@/components/uiComponent/Spinner";
import { DashboardSearch } from "./InternshipSearch";
import { Briefcase, TrendingUp, GraduationCap, Calendar } from "lucide-react";

export const InternshipListings = () => {
  const [allInternships, setAllInternships] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("internships");

  // Tab configuration
  const tabs = [
    {
      id: "internships" as TabType,
      label: "Internships",
      icon: Briefcase,
      count: allInternships.length,
      color: "blue",
    },
    {
      id: "programs" as TabType,
      label: "Programs",
      icon: GraduationCap,
      count: 0, // You can update this when you have programs data
      color: "purple",
    },
    {
      id: "events" as TabType,
      label: "Events",
      icon: Calendar,
      count: 0, // You can update this when you have events data
      color: "green",
    },
  ];

  // Fetch data only once on component mount
  useEffect(() => {
    const fetchInternships = async () => {
      const TIMEOUT_MS = 8000; // 8 seconds timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        setIsLoading(true);
        setError(null);

        let response;
        try {
          response = await fetch("/api/students/internships", {
            signal: controller.signal,
          });
        } catch (fetchErr: any) {
          if (fetchErr.name === "AbortError") {
            throw new Error(
              "Request timed out after " + TIMEOUT_MS / 1000 + " seconds."
            );
          }
          throw new Error("Network error: " + fetchErr.message);
        } finally {
          clearTimeout(timeoutId);
        }

        if (!response.ok) {
          let details = "";
          try {
            details = await response.text();
          } catch {}
          throw new Error(
            `Failed to fetch internships. Status: ${response.status}. ${details}`
          );
        }

        let data: Partial<Internship>[];
        try {
          data = await response.json();
        } catch (jsonErr: unknown) {
          throw new Error(
            "Failed to parse internships response as JSON: " +
              (jsonErr instanceof Error ? jsonErr.message : "Unknown error")
          );
        }

        // Type guard for array
        if (!Array.isArray(data)) {
          throw new Error("Internships response is not an array.");
        }

        const flattenedData: Internship[] = data.map((internship) => ({
          id: internship.id ?? "",
          title: internship.title ?? "",
          company_profiles: internship.company_profiles,
          company: internship.company_profiles?.company_name || "Confidential",
          logoColor: internship.company_profiles?.logoColor || "#3B82F6",
          headQuarterImage:
            internship.company_profiles?.headQuarterImage ||
            "/placeholder-cover.jpg",
          location: internship.location ?? "",
          type: internship.type ?? "",
          category: internship.category ?? "",
          cover_image_url: internship.cover_image_url,
        }));

        setAllInternships(flattenedData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInternships();
  }, []);

  // Real-time client-side filtering
  const filteredInternships = useMemo(() => {
    if (!searchQuery.trim()) return allInternships;

    const query = searchQuery.toLowerCase().trim();

    return allInternships.filter(
      (internship: Internship) =>
        internship.title.toLowerCase().includes(query) ||
        internship.company.toLowerCase().includes(query) ||
        internship.location.toLowerCase().includes(query) ||
        internship.category.toLowerCase().includes(query)
    );
  }, [allInternships, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const getTabColorClasses = (color: string, isActive: boolean) => {
    const colorMap = {
      blue: {
        active: "bg-blue-600 text-white shadow-blue-200",
        inactive: "text-blue-600 hover:bg-blue-50 hover:text-blue-700",
      },
      purple: {
        active: "bg-purple-600 text-white shadow-purple-200",
        inactive: "text-purple-600 hover:bg-purple-50 hover:text-purple-700",
      },
      green: {
        active: "bg-green-600 text-white shadow-green-200",
        inactive: "text-green-600 hover:bg-green-50 hover:text-green-700",
      },
    };

    return isActive
      ? colorMap[color as keyof typeof colorMap].active
      : colorMap[color as keyof typeof colorMap].inactive;
  };

  const renderTabContent = () => {
    if (activeTab === "programs") {
      return (
        <div className="text-center py-20">
          <div className="text-6xl mb-6">🎓</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Programs Coming Soon
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
            We&apos;re working on bringing you amazing educational programs.
            Stay tuned!
          </p>
        </div>
      );
    }

    if (activeTab === "events") {
      return (
        <div className="text-center py-20">
          <div className="text-6xl mb-6">📅</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Events Coming Soon
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
            Exciting events and workshops are being planned. Check back soon!
          </p>
        </div>
      );
    }

    // Internships content (default)
    return (
      <>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                <Spinner />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <TrendingUp size={14} className="text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Loading amazing opportunities
            </h3>
            <p className="text-gray-500">
              Just a moment while we fetch the latest internships...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">😕</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Oops! Something went wrong
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              We&apos;re having trouble loading the internships right now.
              Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Try Again
            </button>
          </div>
        ) : filteredInternships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredInternships.map((internship, index) => (
              <div
                key={internship.id}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <InternshipCard
                  id={internship.id}
                  title={internship.title}
                  company={internship.company}
                  location={internship.location}
                  type={internship.type}
                  category={internship.category}
                  logoColor={internship.logoColor}
                  cover_image_url={internship.cover_image_url}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchQuery ? "No matches found" : "No internships available"}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              {searchQuery ? (
                <>
                  We couldn&apos;t find any internships matching{" "}
                  <strong>&quot;{searchQuery}&quot;</strong>. Try different
                  keywords or browse all opportunities.
                </>
              ) : (
                "There are no internships available at the moment. Check back soon for new opportunities!"
              )}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                View All Internships
              </button>
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto px-4">
        {/* Search */}
        <div className="flex lg:flex-row flex-col flex-col-reverse flex-start items-center justify-between w-full ">
          <DashboardSearch onSearch={handleSearch} />

          {/* Beautiful Tabs */}
          <div className="mb-10">
            <div className=" flex-start ">
              <div className="inline-flex  bg-gray-100 rounded-2xl p-2 shadow-sm">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                      relative flex items-center gap-3 px-3 py-1 rounded-lg font-medium text-[12px] transition-all duration-300 shadow-sm
                      ${getTabColorClasses(tab.color, isActive)}
                      ${isActive ? "transform scale-105" : "hover:scale-102"}
                    `}
                    >
                      <Icon size={18} />
                      <span>{tab.label}</span>
                      {tab.count > 0 && (
                        <span
                          className={`
                        px-2 py-1 text-xs rounded-full font-semibold
                        ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-gray-200 text-gray-600"
                        }
                      `}
                        >
                          {tab.count}
                        </span>
                      )}

                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-current rounded-full opacity-40" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Header based on active tab */}
        <div className="text-start mb-3">
          <div
            className={`
            flex items-center justify-center hidden rounded-2xl  shadow-lg
            ${
              activeTab === "internships"
                ? "bg-gradient-to-br from-blue-600 to-blue-700"
                : activeTab === "programs"
                ? "bg-gradient-to-br from-purple-600 to-purple-700"
                : "bg-gradient-to-br from-green-600 to-green-700"
            }
          `}
          >
            {activeTab === "internships" && (
              <Briefcase size={18} className="text-white" />
            )}
            {activeTab === "programs" && (
              <GraduationCap size={18} className="text-white" />
            )}
            {activeTab === "events" && (
              <Calendar size={18} className="text-white" />
            )}
          </div>

          <h1 className="text-lg font-bold text-gray-900 mb-2">
            {activeTab === "internships" && "Internship Opportunities"}
            {activeTab === "programs" && "Educational Programs"}
            {activeTab === "events" && "Upcoming Events"}
          </h1>

          {!isLoading && activeTab === "internships" && (
            <p className="text-gray-600 text-lg">
              {searchQuery ? (
                <>
                  <span className="font-semibold text-blue-600 text-sm">
                    {filteredInternships.length}
                  </span>{" "}
                  results
                  {searchQuery && (
                    <span className="text-gray-400">
                      {" "}
                      for &quot;{searchQuery}&quot;
                    </span>
                  )}
                </>
              ) : (
                <p className="text-[15px]">
                  <span className="font-semibold text-[15px] text-blue-600">
                    {allInternships.length}
                  </span>{" "}
                  amazing opportunities waiting for you
                </p>
              )}
            </p>
          )}
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>

      {/* Add animation styles */}
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
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};
