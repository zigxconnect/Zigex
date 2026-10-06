/**
 * Public Feed Detail Page — app/(public)/feed/[id]/page.tsx
 *
 * Publicly accessible opportunity detail page. Authenticated users see the
 * full apply/register flow. Unauthenticated visitors see the content but are
 * redirected to sign-in when they interact with any action button.
 */

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Server Actions
import {
  type FeedType,
  getFeedItemById,
  getCompanyRelatedItems,
  isOpportunityOpen,
  getApplicationStatus,
} from "@/lib/actions/feed/feed-detail.actions";

// Components
import { FeedDetailHeader } from "@/components/feed/details/FeedDetailHeader";
import { ApplyButton } from "@/components/feed/details/appyButton/ApplyButton";
import { LocationMap } from "@/components/feed/details/LocationMap";
import { RelatedItems } from "@/components/feed/details/RelatedItems";
import { CompanyCard } from "@/components/feed/details/DetailsSidebar";
import { DetailsSidebar, DetailItem } from "@/components/feed/details/CompanyCard";
import { BackButton } from "@/components/feed/details/BackButton";
import { RegisterGoDown } from "@/components/feed/details/RegisterDown";
import { RichContentRenderer } from "@/components/ui/RichContentRenderer";
import { getOptionalAuth } from "@/lib/utils/auth-context";
import Link from "next/link";
import { LogIn } from "lucide-react";

interface FeedDetailPageProps {
  params: Promise<{ id: string }>;
}

// Enable ISR with 5 minute revalidation
export const revalidate = 300;

// Generate metadata
export async function generateMetadata({ params }: FeedDetailPageProps) {
  const { id } = await params;
  const { data: item } = await getFeedItemById(id);

  if (!item) {
    return { title: "Not Found" };
  }

  return {
    title: `${item.title} | Zigex`,
    description:
      item.description?.substring(0, 160) || `Apply for ${item.title}`,
  };
}

export default async function FeedDetailPage({ params }: FeedDetailPageProps) {
  const { id } = await params;

  // Resolve auth + item data in parallel
  const [{ isAuthenticated }, { data: item, error }] = await Promise.all([
    getOptionalAuth(),
    getFeedItemById(id),
  ]);

  if (error || !item) {
    notFound();
  }

  // Extract company info
  const company =
    typeof item.company_profiles === "object" ? item.company_profiles : null;
  const companyId = company?.id || (item as any).company_id;
  const companyName = company?.company_name || "Company";

  // Check if opportunity is still open
  const opportunityStatus = await isOpportunityOpen(item, item._type);

  // Get user's application status — returns { hasApplied: false, status: null } for guests
  const applicationStatus = await getApplicationStatus(item.id, item._type);

  // Resolve image URL by feed type
  const getImageUrl = () => {
    switch (item._type) {
      case "internships":
        return (
          (item as any).cover_image_url ||
          (item as any).internship_picture_url ||
          "/intern.png"
        );
      case "programs":
        return (item as any).program_picture_url || "/intern.png";
      case "events":
        return (item as any).event_picture_url || "/placeholder.png";
      case "announcements":
        return (item as any).image_url || "/announcement.png";
    }
  };

  // Build sidebar details array
  const buildDetails = (): DetailItem[] => {
    const details: DetailItem[] = [];

    if (item.location) {
      details.push({ label: "Location", value: item.location, icon: "MapPin" });
    }

    if (item._type === "internships") {
      if ((item as any).duration)
        details.push({ label: "Duration", value: (item as any).duration, icon: "Calendar" });
      if ((item as any).department)
        details.push({ label: "Department", value: (item as any).department, icon: "Briefcase" });
      if ((item as any).type)
        details.push({ label: "Type", value: (item as any).type, icon: "Users" });
      if ((item as any).start_date)
        details.push({ label: "Start Date", value: formatDate((item as any).start_date), icon: "Calendar" });
      if ((item as any).end_date)
        details.push({ label: "End Date", value: formatDate((item as any).end_date), icon: "Calendar" });
    }

    if (item._type === "programs" || item._type === "events") {
      if ((item as any).start_date)
        details.push({ label: "Start Date", value: formatDate((item as any).start_date), icon: "Calendar" });
      if ((item as any).end_date)
        details.push({ label: "End Date", value: formatDate((item as any).end_date), icon: "Calendar" });
      if ((item as any).duration)
        details.push({ label: "Duration", value: (item as any).duration, icon: "Calendar" });
    }

    return details;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-80 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Back Button + RSVP/Register shortcut */}
        <div className="flex justify-between items-center mb-6">
          <BackButton />
          {opportunityStatus.isOpen && (
            <RegisterGoDown
              href="getStarted"
              label={
                item._type === "events"
                  ? "RSVP"
                  : item._type === "programs"
                  ? "Register"
                  : "Apply"
              }
            />
          )}
        </div>

        {/* Header */}
        <FeedDetailHeader
          title={item.title}
          type={item._type.slice(0, -1)}
          imageUrl={getImageUrl()}
          startDate={(item as any).start_date}
          endDate={(item as any).end_date}
          location={item.location}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Card */}
            {company && <CompanyCard company={company} />}

            {/* Description */}
            <Card className="p-6 sm:p-8 border border-border shadow-lg rounded-[2rem] bg-card hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-8 bg-primary rounded-full" />
                <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">
                  About this {item._type.slice(0, -1)}
                </h2>
              </div>
              <div className="prose prose-gray max-w-none">
                {(item as any).description ? (
                  <RichContentRenderer content={(item as any).description} />
                ) : (
                  <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap font-medium">
                    No description provided.
                  </p>
                )}
              </div>
            </Card>

            {/* Location Map */}
            {item.location && (
              <LocationMap location={item.location} title={item.title} />
            )}

            {/* Related Items */}
            {companyId && (
              <Suspense fallback={<RelatedItemsSkeleton />}>
                <RelatedItemsSection
                  companyId={companyId}
                  currentType={item._type}
                  currentId={item.id}
                  companyName={companyName}
                />
              </Suspense>
            )}

            {/* Apply / Register CTA */}
            {item._type !== "announcements" && (
              <section id="getStarted" className="mt-6 sm:mt-8">
                {isAuthenticated ? (
                  // Full apply flow for authenticated users
                  (opportunityStatus.isOpen || applicationStatus.hasApplied) && (
                    <ApplyButton
                      isOpen={opportunityStatus.isOpen}
                      reason={opportunityStatus.reason}
                      type={item._type.slice(0, -1) as any}
                      id={item.id}
                      title={item.title}
                      fullWidth={true}
                      isAuthenticated={true}
                      buttonText={
                        item._type === "events"
                          ? "RSVP"
                          : item._type === "programs"
                          ? "Register"
                          : "Apply"
                      }
                      opportunityData={{
                        title: item.title,
                        description: (item as any).description,
                        type: item._type.slice(0, -1),
                        company_profiles: company,
                        location: item.location,
                        duration: (item as any).duration,
                        department: (item as any).department,
                      }}
                      applicationStatus={applicationStatus}
                    />
                  )
                ) : (
                  // Sign-in gate for anonymous visitors
                  opportunityStatus.isOpen && (
                    <div className="fixed bottom-16 md:static left-0 right-0 z-40 bg-white md:bg-transparent border-t md:border-0 border-slate-200 shadow-2xl md:shadow-none md:mt-6">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3 md:space-y-4">
                        <Link
                          href={`/sign-in?next=${encodeURIComponent(`/feed/${id}`)}`}
                          className="block w-full"
                        >
                          <button className="w-full relative overflow-hidden flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 bg-[#155DFC] hover:bg-[#0D47A1] text-white shadow-lg shadow-blue-200/50 hover:shadow-xl transform hover:scale-[1.01] active:scale-[0.99] group">
                            <LogIn size={18} />
                            Sign in to{" "}
                            {item._type === "events"
                              ? "RSVP"
                              : item._type === "programs"
                              ? "Register"
                              : "Apply"}
                          </button>
                        </Link>
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                          <p className="text-[11px] font-semibold text-blue-700 text-center">
                            Create a free account to apply for this opportunity and track your progress.
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </section>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-6 space-y-6">
              <DetailsSidebar details={buildDetails()} />

              <Card className="p-6 border border-border shadow-lg rounded-[2rem] bg-card">
                <h3 className="font-black text-foreground mb-3 text-sm uppercase tracking-wider">
                  Need Help?
                </h3>
                <p className="text-sm text-foreground/70 leading-relaxed font-medium">
                  Have questions about this opportunity? Contact the company
                  directly or reach out to our support team.
                </p>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// Related Items Server Component
async function RelatedItemsSection({
  companyId,
  currentType,
  currentId,
  companyName,
}: {
  companyId: string;
  currentType: FeedType;
  currentId: string;
  companyName: string;
}) {
  const relatedItems = await getCompanyRelatedItems(companyId, currentType, currentId);

  return (
    <>
      {relatedItems.programs.length > 0 && currentType !== "programs" && (
        <RelatedItems items={relatedItems.programs} type="programs" companyName={companyName} />
      )}
      {relatedItems.internships.length > 0 && currentType !== "internships" && (
        <RelatedItems items={relatedItems.internships} type="internships" companyName={companyName} />
      )}
      {relatedItems.events.length > 0 && currentType !== "events" && (
        <RelatedItems items={relatedItems.events} type="events" companyName={companyName} />
      )}
    </>
  );
}

// Loading skeleton
function RelatedItemsSkeleton() {
  return (
    <div className="mt-12">
      <Skeleton className="h-8 w-64 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-5 space-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
