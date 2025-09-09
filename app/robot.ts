import { MetadataRoute } from "next";

export default function robot(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/npm/@clerk/clerk-js",
        "/sign-in",
        "/sign-up",
        "/privacy-policy",
        "/student",
      ],
    },
    sitemap: "https://www.innovatewithseed.com/sitemap.xml",
  };
}
