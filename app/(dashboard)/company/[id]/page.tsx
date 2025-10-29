import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getCompanyById } from "@/lib/actions/programs/companies.action";
import { getAllCompanyPostings, getHeaderStats } from "@/lib/data/postings";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/uiComponent/Badge";
import { ExternalLink, MapPin, Globe, Mail, Users } from "lucide-react";

type Props = {
  params: { id: string };
};

export default async function CompanyProfilePage({ params }: Props) {
  const id = params.id;

  // Fetch company and company-specific data in parallel
  const [companyResult, postingsResult, headerStats] = await Promise.all([
    getCompanyById(id),
    getAllCompanyPostings(id),
    getHeaderStats(id),
  ]);

  const company = companyResult.success && companyResult.data ? companyResult.data[0] : null;
  const postings = postingsResult.hasData ? postingsResult.postings : [];
  const stats = headerStats || { total: 0, active: 0, applications: 0 };

  if (!company) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-2xl font-bold">Company not found</h2>
        <p className="text-gray-500 mt-2">We couldn't locate that company profile.</p>
        <div className="mt-6">
          <Link href="/" className="text-green-600 underline">Go back home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Cover */}
      <div className="relative h-44 md:h-60 w-full bg-gray-100">
        <Image
          src={company.cover_image_url || "/n7.png"}
          alt={`${company.company_name} cover`}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/80" />
      </div>

      <div className="max-w-6xl mx-auto -mt-12 px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-start gap-5">
                <div className="relative w-28 h-28 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                  <Image
                    src={company.logo_url || "/seedLogo.png"}
                    alt={`${company.company_name} logo`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 56px, 112px"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{company.company_name}</h1>
                    {company.verified && (
                      <Badge className="bg-emerald-600 text-white">Verified</Badge>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mt-2">{company.tagline || company.industry || "Trusted company in the community"}</p>

                  <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} /> <span>{company.location || "Remote / Global"}</span>
                    </div>
                    {company.website && (
                      <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-green-600 hover:underline">
                        <Globe size={14} /> <span className="truncate max-w-xs">{company.website.replace(/^https?:\/\//, "")}</span>
                      </a>
                    )}
                    {company.contact_email && (
                      <a href={`mailto:${company.contact_email}`} className="flex items-center gap-2 text-gray-700">
                        <Mail size={14} /> <span>{company.contact_email}</span>
                      </a>
                    )}
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    <Button className="px-4 py-2" variant="primary">
                      Follow
                    </Button>
                    <Link href={company.website || "#"} target="_blank" className="inline-flex items-center gap-2 text-sm text-gray-700 hover:underline">
                      Visit Website <ExternalLink size={14} />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-6 prose max-w-none">
                <h3 className="text-lg font-semibold">About</h3>
                <p className="text-gray-700">{company.description || "No description provided."}</p>
              </div>
            </Card>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h4 className="text-sm text-gray-500">Open Opportunities</h4>
                <div className="mt-3 space-y-3">
                  {postings.length === 0 ? (
                    <div className="text-sm text-gray-500">No active postings yet.</div>
                  ) : (
                    postings.slice(0, 6).map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{p.title}</div>
                          <div className="text-xs text-gray-500">{p.type} • {p.createdAt}</div>
                        </div>
                        <div className="text-xs text-gray-500">{p.status}</div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="text-sm text-gray-500">Stats</h4>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                    <div className="text-xs text-gray-500">Total postings</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
                    <div className="text-xs text-gray-500">Active now</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.applications}</div>
                    <div className="text-xs text-gray-500">Applications</div>
                  </div>
                </div>
              </Card>
            </div>

          </div>

          <aside className="space-y-6">
            <Card className="p-4">
              <h4 className="text-sm text-gray-500">Contact</h4>
              <div className="mt-3">
                <div className="text-sm font-semibold">{company.company_name}</div>
                {company.location && <div className="text-xs text-gray-500">{company.location}</div>}
                {company.contact_email && (
                  <a href={`mailto:${company.contact_email}`} className="text-sm text-green-600 hover:underline flex items-center gap-2 mt-2"><Mail size={14}/> Contact</a>
                )}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noreferrer" className="text-sm text-gray-700 mt-2 block">{company.website}</a>
                )}
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="text-sm text-gray-500">Company Size</h4>
              <div className="mt-3 text-sm text-gray-700">{company.size || "Not specified"}</div>
            </Card>

            <Card className="p-4">
              <h4 className="text-sm text-gray-500">Industry</h4>
              <div className="mt-3 text-sm text-gray-700">{company.industry || "General"}</div>
            </Card>

          </aside>
        </div>

      </div>
    </div>
  );
}
