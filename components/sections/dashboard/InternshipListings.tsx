"use client";

import { useState, useEffect } from "react";

import { InternshipCard } from "./InternshipCard";
import { Spinner } from "@/components/uiComponenet/Spinner";
import { DashboardSearch } from "./InternshipSearch";
import { Sparkles } from "lucide-react";

export const InternshipListings = () => {
  const [internships, setInternships] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (searchQuery: string = "") => {
    try {
      setIsLoading(true);
      setError(null);

      const apiUrl = `/api/students/internships${
        searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""
      }`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error("Failed to fetch internships.");
      }

      const data = await response.json();

      // Flatten the data to match the InternshipCard's props
      const flattenedData = data.map((internship: any) => ({
        ...internship,
        company: internship.company_profiles?.company_name || "Confidential",
        logoColor: internship.company_profiles?.logoColor || "#1E3A8A",
        headQuarterImage:
          internship.company_profiles?.headQuarterImage ||
          "/placeholder-cover.jpg",
      }));

      setInternships(flattenedData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="space-y-8">
      <DashboardSearch onSearch={handleSearch} />

      <div>
        <div className="flex items-center gap-2 mb-4 px-6 md:px-0">
          <Sparkles className="text-blue-800" size={20} />
          <h2 className="text-xl font-bold text-blue-900">
            Internship Opportunities
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 md:px-0">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center py-10">
              <Spinner />
              <span className="ml-4 text-gray-500">Loading internships...</span>
            </div>
          ) : error ? (
            <p className="col-span-full text-center text-red-500">{error}</p>
          ) : internships.length > 0 ? (
            internships.map((internship) => (
              <InternshipCard
                key={internship.id}
                id={internship.id}
                title={internship.title}
                company={internship.company}
                location={internship.location}
                type={internship.type}
                category={internship.category}
                logoColor={internship.logoColor}
                headQuarterImage={internship.headQuarterImage}
              />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500 py-10">
              No internships found matching your search.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
