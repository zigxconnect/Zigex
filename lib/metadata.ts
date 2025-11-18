/**
 * Generates Open Graph metadata for sharing
 */
export function generateMetadata(
  title: string,
  description: string,
  imageUrl?: string,
  url?: string,
  type: "event" | "program" | "internship" = "event"
) {
  return {
    title: `${title} - ${type.charAt(0).toUpperCase() + type.slice(1)}`,
    description: description || "Check out this opportunity on ZigX",
    openGraph: {
      title: `${title} - ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      description: description || "Check out this opportunity on ZigX",
      type: "website",
      url: url || "",
      images: [
        {
          url: imageUrl || "https://zigex.vercel.app/og-image.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description || "Check out this opportunity on ZigX",
      images: [imageUrl || "https://zigex.vercel.app/og-image.png"],
    },
  };
}

/**
 * Injects metadata tags into the document head for sharing
 */
export function injectMetadataTags(
  title: string,
  description: string,
  imageUrl?: string,
  url?: string
) {
  if (typeof window === "undefined") return;

  // Update document title
  document.title = title;

  // Update or create meta tags
  const updateOrCreateMetaTag = (property: string, content: string) => {
    let tag = document.querySelector(`meta[property="${property}"]`) ||
              document.querySelector(`meta[name="${property}"]`);
    
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute(property.startsWith("og:") ? "property" : "name", property);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  };

  // OG Tags
  updateOrCreateMetaTag("og:title", title);
  updateOrCreateMetaTag("og:description", description);
  if (imageUrl) updateOrCreateMetaTag("og:image", imageUrl);
  if (url) updateOrCreateMetaTag("og:url", url);

  // Twitter Tags
  updateOrCreateMetaTag("twitter:title", title);
  updateOrCreateMetaTag("twitter:description", description);
  if (imageUrl) updateOrCreateMetaTag("twitter:image", imageUrl);
  updateOrCreateMetaTag("twitter:card", "summary_large_image");

  // Standard meta
  updateOrCreateMetaTag("description", description);
}
