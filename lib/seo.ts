import type { Metadata } from "next";
import type { BoardItem } from "@/components/feed/board/board-types";

/** The public address of this deployment (production or development). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://zigexconnect.com").replace(/\/$/, "");
export const SITE_NAME = "Zigex";
export const SITE_DESCRIPTION =
  "Find internships, training programs and events from companies in Bamenda and across Cameroon. Apply with one profile and follow every application.";

/**
 * Title, description, canonical address, Open Graph and X tags in one go, so
 * a page never shows another page's share text (child pages otherwise inherit
 * the root layout's og:title). The share image comes from the nearest
 * opengraph-image file.
 */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article" | "profile";
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: SITE_NAME, type, locale: "en_US" },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** Plain text from an HTML description, for meta descriptions and structured data. */
export function plainText(html: unknown, max = 160): string {
  if (typeof html !== "string") return "";
  const text = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

// ---------------------------------------------------------------------------
// Structured data (schema.org JSON-LD): lets Google show internships in job
// search, events with dates, and the site name and search box in results.

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icons/icon-512.png`,
    description: SITE_DESCRIPTION,
    areaServed: { "@type": "Country", name: "Cameroon" },
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/feed?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

const place = (item: BoardItem) => ({
  "@type": "Place",
  name: item.location || "Cameroon",
  address: {
    "@type": "PostalAddress",
    addressLocality: item.location?.split(",").map((s) => s.trim()).filter(Boolean).pop() || "Bamenda",
    addressCountry: "CM",
  },
});

/**
 * Internship → JobPosting (eligible for Google's job search), event → Event,
 * program → Course. Null when required facts are missing, so Google never
 * sees half-filled data.
 */
export function opportunityLd(item: BoardItem, description: string, path: string): Record<string, unknown> | null {
  const url = `${SITE_URL}${path}`;
  const organization = { "@type": "Organization", name: item.companyName || SITE_NAME, ...(item.companyLogo && { logo: item.companyLogo }) };
  const text = plainText(description, 5000) || item.title;

  if (item.kind === "internships") {
    if (!item.postedAt) return null;
    return {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: item.title,
      description: text,
      datePosted: item.postedAt,
      ...(item.closesAt && { validThrough: item.closesAt }),
      employmentType: "INTERN",
      hiringOrganization: organization,
      ...(item.workMode === "remote"
        ? { jobLocationType: "TELECOMMUTE", applicantLocationRequirements: { "@type": "Country", name: "Cameroon" } }
        : { jobLocation: place(item) }),
      directApply: true,
      url,
      ...(item.image && { image: item.image }),
    };
  }

  if (item.kind === "events") {
    if (!item.startsAt) return null;
    return {
      "@context": "https://schema.org",
      "@type": "Event",
      name: item.title,
      description: text,
      startDate: item.startsAt,
      ...(item.endsAt && { endDate: item.endsAt }),
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode:
        item.workMode === "remote"
          ? "https://schema.org/OnlineEventAttendanceMode"
          : item.workMode === "hybrid"
            ? "https://schema.org/MixedEventAttendanceMode"
            : "https://schema.org/OfflineEventAttendanceMode",
      location: item.workMode === "remote" ? { "@type": "VirtualLocation", url } : place(item),
      organizer: organization,
      url,
      ...(item.image && { image: [item.image] }),
      offers: {
        "@type": "Offer",
        url,
        price: item.priceXaf ?? 0,
        priceCurrency: "XAF",
        availability: "https://schema.org/InStock",
      },
    };
  }

  // Programs
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: item.title,
    description: text,
    provider: organization,
    url,
    ...(item.image && { image: item.image }),
    ...(item.startsAt && {
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: item.workMode === "remote" ? "online" : item.workMode === "hybrid" ? "blended" : "onsite",
        startDate: item.startsAt,
        ...(item.endsAt && { endDate: item.endsAt }),
        location: item.workMode === "remote" ? undefined : place(item),
      },
    }),
    offers: { "@type": "Offer", category: item.hasFee ? "Paid" : "Free", price: item.priceXaf ?? 0, priceCurrency: "XAF" },
  };
}

/** Renders JSON-LD safely (a "</script>" inside a description can't break out). */
export function jsonLdScript(data: Record<string, unknown>) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
