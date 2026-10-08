import type { Metadata } from "next";
import { Inter, Host_Grotesk } from "next/font/google";
import ThemeProvider from "@/components/providers/ThemeProvider";
import "./globals.css";
import "@/styles/rich-content.css";
// import { Toaster } from "@/components/ui/sonner";
import { Toaster } from "react-hot-toast";
import Script from "next/script";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { IS_PRODUCTION } from "@/lib/app-env";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, jsonLdScript, organizationLd, websiteLd } from "@/lib/seo";
import { InstallPromptCatcher } from "@/components/providers/InstallPromptCatcher";

const inter = Inter({

  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const hostGrotesk = Host_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-host-grotesk",
});




// Status bar matches the app's white header; pinch-zoom stays allowed (accessibility).
export const viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: "Zigex: internships, programs and events in Cameroon",
    template: "%s | Zigex",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "internships in Cameroon",
    "internships Bamenda",
    "student internships",
    "tech training programs",
    "student events Cameroon",
    "SEED Bamenda",
    "Zigex",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
  icons: {
    icon: [
      { url: "/icons/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  formatDetection: { telephone: false },
  // Pages set their own title/description/url via pageMetadata(); only shared fields here.
  // The share image is app/opengraph-image.tsx (and per-opportunity ones).
  openGraph: { siteName: SITE_NAME, type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image" },
  // Indexed in production only; the development site stays out of search engines.
  robots: !IS_PRODUCTION ? { index: false, follow: false } : {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(organizationLd())} />
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(websiteLd())} />
      </head>
      <body className={`${inter.variable} ${hostGrotesk.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>

        <InstallPromptCatcher />
        <Toaster position="top-center" reverseOrder={false} />
        <Analytics />
        <SpeedInsights />
        {/* <Toaster /> */}
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </body>

    </html>
  );
}
