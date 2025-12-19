
"use client";

import Image from "next/image";
import Link from "next/link";
import { normalizeImageSrc } from "@/lib/utils";
import { MapPin, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CompanyCardProps {
  company: {
    id: string;
    company_name: string;
    logo_url?: string;
    location?: string;
    website_url?: string;
  };
}

export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm">
      <Link
        href={`/company/${company.id}`}
        className="flex items-center gap-4 group"
      >
        {/* Logo */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex-shrink-0 ring-2 ring-border group-hover:ring-primary transition-all">
          <Image
            src={normalizeImageSrc(company.logo_url || "/seedLogo.png")}
            alt={company.company_name}
            fill
            className="object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors flex items-center gap-2">
            {company.company_name}
            <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </h2>
          {company.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin size={14} className="text-primary" />
              <span className="truncate">{company.location}</span>
            </div>
          )}
        </div>
      </Link>
    </Card>
  );
}


