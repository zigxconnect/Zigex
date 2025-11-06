// app/(dashboard)/feed/[id]/page.tsx
"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Building2, ExternalLink, Clock, Calendar, X, CheckCircle2, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DynamicForm from "@/components/sections/dashboard/Application/application";
import { normalizeImageSrc } from "@/lib/utils";
import type { FeedItem, FeedType } from "@/lib/types/feed";

const DetailItem = ({ label, value, icon: Icon }: { label: string; value: string | null; icon?: any }) => {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-gray-100 last:border-b-0 group hover:bg-gray-50/50 px-2 -mx-2 rounded-lg transition-all duration-200">
      {Icon && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
          <Icon size={16} className="text-blue-600" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide block">{label}</span>
        <span className="text-sm font-semibold text-gray-900 mt-0.5 block">{value}</span>
      </div>
    </div>
  );
};

export default function FeedDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [item, setItem] = useState<FeedItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [otherItems, setOtherItems] = useState<any[]>([]);

  useEffect(() => {
    async function fetchItem() {
      try {
        const endpoints = [
          { type: "internships" as FeedType, url: "/api/students/internships" },
          { type: "programs" as FeedType, url: "/api/students/programs" },
          { type: "events" as FeedType, url: "/api/students/events" },
        ];

        let foundItem = null;

        for (const { type, url } of endpoints) {
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            console.log(`Fetching from ${type}:`, data);
            console.log(`Looking for ID:`, resolvedParams.id);
            
            // Use strict equality and ensure both are strings
            const found = data.find((i: any) => {
              console.log(`Comparing: "${i?.id}" === "${resolvedParams.id}"`, i?.id === resolvedParams.id);
              return i?.id && String(i.id) === String(resolvedParams.id);
            });
            
            console.log(`Found item in ${type}:`, found);
            
            if (found) {
              foundItem = { ...found, _type: type };
              setItem(foundItem);
              
              // Fetch other items from same company
              if (found.company_id || found.company?.id) {
                const companyId = found.company_id || found.company.id;
                try {
                  const companyRes = await fetch(`/api/public/companies/${companyId}/programs`);
                  if (companyRes.ok) {
                    const companyData = await companyRes.json();
                    setOtherItems((companyData.programs || []).filter((p: any) => String(p.id) !== String(found.id)));
                  }
                } catch (e) {
                  console.error("Error fetching related items:", e);
                }
              }
              break;
            }
          }
        }

        if (!foundItem) {
          throw new Error("Item not found");
        }
      } catch (err) {
        console.error("Error in fetchItem:", err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchItem();
  }, [resolvedParams.id]);

  if (isLoading) return <div className="text-center py-20">Loading...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!item) return <div className="text-center py-20 text-gray-500">Item not found</div>;

  const company = item.company;
  const companyName = typeof company === "string" ? company : company?.company_name || "Company";
  
  const getImageUrl = () => {
    switch (item._type) {
      case "internships": return normalizeImageSrc((item as any).cover_image_url || (item as any).internship_picture_url);
      case "programs": return normalizeImageSrc((item as any).program_picture_url);
      case "events": return normalizeImageSrc((item as any).event_picture_url);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-blue-100 to-indigo-100">
                  <Image src={getImageUrl()} alt={item.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full mb-3">
                      {item._type.slice(0, -1)}
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                      {item.title}
                    </h1>
                  </div>
                </div>
              </Card>

              {/* Company Info */}
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="p-6 sm:p-8">
                  <Link href={`/company/${company?.id || (item as any).company_id}`} className="flex items-center gap-4 group">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg relative">
                      <Image
                        src={normalizeImageSrc(company?.logo_url || "/seedLogo.png")}
                        alt={companyName}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {companyName}
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={16} className="text-blue-600 flex-shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              </Card>

              {/* Description */}
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="p-6 sm:p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full" />
                    About this {item._type.slice(0, -1)}
                  </h3>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {item.description || "No description provided."}
                    </p>
                  </div>
                </div>

                {/* Map */}
                {item.location && (
                  <div className="mt-6 p-6 pt-0">
                    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                      <div className="w-full h-52 md:h-72 bg-gray-100">
                        <iframe
                          title="location"
                          src={`https://www.google.com/maps?q=${encodeURIComponent(item.location)}&output=embed`}
                          className="w-full h-full border-0"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-6 space-y-4">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                    <h3 className="font-bold text-lg text-white">Details</h3>
                  </div>
                  <div className="p-5">
                    <DetailItem label="Location" value={item.location} icon={MapPin} />
                    {item._type === "internships" && (
                      <>
                        <DetailItem label="Duration" value={(item as any).duration} icon={Clock} />
                        <DetailItem label="Department" value={(item as any).department} icon={Users} />
                      </>
                    )}
                    {item._type === "programs" && (
                      <>
                        <DetailItem label="Duration" value={(item as any).duration} icon={Clock} />
                        <DetailItem label="Start Date" value={formatDate((item as any).start_date)} icon={Calendar} />
                        <DetailItem label="End Date" value={formatDate((item as any).end_date)} icon={Calendar} />
                      </>
                    )}
                    {item._type === "events" && (
                      <>
                        <DetailItem label="Start Date" value={formatDate((item as any).start_date)} icon={Calendar} />
                        <DetailItem label="End Date" value={formatDate((item as any).end_date)} icon={Calendar} />
                        <DetailItem label="Time" value={(item as any).start_time} icon={Clock} />
                      </>
                    )}
                  </div>
                </Card>

                <Button
                  className="w-full text-base py-6 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0"
                  onClick={() => setShowModal(true)}
                >
                  Apply Now
                  <ExternalLink size={18} className="ml-2" />
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="absolute -top-4 -right-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg hover:bg-gray-100 flex items-center justify-center"
              >
                <X size={20} />
              </button>
              <div className="bg-white rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
                <DynamicForm type={item._type.slice(0, -1) as any} id={item.id} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}