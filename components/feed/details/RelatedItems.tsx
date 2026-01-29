// components/feed/detail/RelatedItems.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { normalizeImageSrc, slugify } from "@/lib/utils";
import { Calendar, Clock, ArrowRight, LayoutGrid } from "lucide-react";
import { Badge } from "@/components/uiComponent/Badge";
// import { Badge } from "@/components/ui/badge";

interface RelatedItem {
  id: string;
  title: string;
  created_at?: string;
  start_date?: string;
  end_date?: string;
  duration?: string;
  cover_image_url?: string;
  program_picture_url?: string;
  event_picture_url?: string;
  type?: string;
}

interface RelatedItemsProps {
  items: RelatedItem[];
  type: "programs" | "internships" | "events";
  companyName: string;
}

export function RelatedItems({ items, type, companyName }: RelatedItemsProps) {
  if (items.length === 0) return null;

  const getTypeLabel = () => {
    switch (type) {
      case "programs":
        return "Programs";
      case "internships":
        return "Internships";
      case "events":
        return "Events";
    }
  };

  const getImageUrl = (item: RelatedItem) => {
    return (
      item.program_picture_url ||
      item.cover_image_url ||
      item.event_picture_url ||
      "/placeholder.png"
    );
  };

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <LayoutGrid size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              More {getTypeLabel()} from {companyName}
            </h2>
            <p className="text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? "opportunity" : "opportunities"} available
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <RelatedItemCard key={item.id} item={item} type={type} imageUrl={getImageUrl(item)} />
        ))}
      </div>
    </section>
  );
}

function RelatedItemCard({
  item,
  type,
  imageUrl,
}: {
  item: RelatedItem;
  type: string;
  imageUrl: string;
}) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Link href={`/feed/${slugify(item.title)}`}>
      <Card className="group overflow-hidden border border-border shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full bg-card">
        {/* Image */}
        <div className="relative h-48 bg-muted overflow-hidden">
          <Image
            src={normalizeImageSrc(imageUrl)}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Type Badge */}
          <Badge className="absolute top-3 left-3 bg-white/95 text-primary backdrop-blur-sm border-0 font-bold shadow-sm">
            {type === "internships" ? "Internship" : type === "programs" ? "Program" : "Event"}
          </Badge>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-bold text-lg text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            {item.title}
          </h3>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {item.start_date && (
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-primary" />
                <span>{formatDate(item.start_date)}</span>
              </div>
            )}
            {item.duration && (
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-primary" />
                <span>{item.duration}</span>
              </div>
            )}
          </div>

          {/* View Button */}
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-sm font-medium text-primary group-hover:text-secondary group-hover:underline decoration-2 underline-offset-4 transition-all">
              View Details
            </span>
            <ArrowRight
              size={18}
              className="text-primary group-hover:translate-x-1 transition-transform"
            />
          </div>
        </div>
      </Card>
    </Link>
  );
}