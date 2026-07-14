import type { Metadata } from "next";
import { Inter, Host_Grotesk } from "next/font/google";
import PushNotificationManager from "@/components/providers/PushNotificationManager";
import ThemeProvider from "@/components/providers/ThemeProvider";
import "./globals.css";
import "@/styles/rich-content.css";
// import { Toaster } from "@/components/ui/sonner";
import { Toaster } from "react-hot-toast";
import Script from "next/script";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import SessionGuard from "@/components/providers/SessionGuard";
import LoaderProvider from "@/components/providers/LoaderProvider";

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




export const viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://zigexconnect.com"),
  title: {
    default: "Zigex | Internship, Growth & Professional Experience",
    template: "%s | Zigex",
  },
  description:
    "Zigex (Zone for Internship, Growth and Experience) is Africa's premier gateway to career advancement. Discover tech internships, masterclasses, and community events designed to empower the next generation of digital leaders through digitalization and SEED Bamenda.",
  keywords: [
    "ZIGEX",
    "Zone for Internship Growth and Experience",
    "fonyuygita",
    "fonyuy gita",
    "mazhewo John brindi",
    "abdul fadiga",
    "fien dora",
    "tayuh favour",
    "Ngwa Frank",
    "cheko yohane",
    "Internships",
    "Tech Programs",
    "Events",
    "Career Growth",
    "Digital Skills",
    "SEED Bamenda",
    "Cameroon Tech",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ZIGEX",
  },
  icons: {

    icon: [
      { url: "/icons/icon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/icons/icon-192x192.png",
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },

  formatDetection: {

    telephone: false,
  },
  openGraph: {

    url: "https://zigexconnect.com",
    type: "website",
    title: "ZIGEX | Zone for Internship, Growth and Experience",
    description:
      "ZIGEX (Zone for Internship, Growth and Experience) is the ultimate platform for discovering career-defining internships, specialized training programs, and impactful tech events. Empowering talent through digitalization.",
    images: [
      {
        url: "https://i.ibb.co/k2Rpz2jQ/og-image-2x-100.jpg",
        width: 1200,
        height: 630,
        alt: "Zigex - Zone for Internship, Growth and Experience",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zigex | Connect with Elite Opportunities",
    description:
      "Africa's gateway to career-defining internships and professional growth. Discover your potential with Zigex.",
    creator: "@zigex_platform",
    images: ["https://i.ibb.co/k2Rpz2jQ/og-image-2x-100.jpg"],
  },
  alternates: {
    canonical: "https://zigexconnect.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
        {/* 
          CRITICAL: This script must run SYNCHRONOUSLY before any other JS.
          It purges corrupted Supabase auth tokens from localStorage to prevent
          "TypeError: Cannot create property 'user' on string".
          
          It also handles double-stringified values (the root cause):
          If JSON.parse returns a string instead of an object, it tries
          parsing one more time. If that succeeds, it fixes the stored value.
          If not, it removes the key entirely.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // --- 1. LOCAL STORAGE GUARD ---
                  var keys = [];
                  for (var i = 0; i < localStorage.length; i++) {
                    keys.push(localStorage.key(i));
                  }
                  for (var j = 0; j < keys.length; j++) {
                    var key = keys[j];
                    if (!key) continue;
                    if (key.indexOf('sb-') !== 0 && key !== 'supabase.auth.token') continue;
                    if (key.indexOf('-code-verifier') !== -1) continue;
                    var val = localStorage.getItem(key);
                    if (!val) continue;
                    try {
                      var parsed = JSON.parse(val);
                      if (typeof parsed === 'string' || parsed === null || typeof parsed !== 'object') {
                        console.warn('[ZApp] Invalid localStorage session detected for ' + key + '. Removing.');
                        localStorage.removeItem(key);
                      }
                    } catch (e) {
                      localStorage.removeItem(key);
                    }
                  }

                } catch (e) {}
              })();
            `,
          }}
        />

      </head>
      <body className={`${inter.variable} ${hostGrotesk.variable} antialiased`}>
        <LoaderProvider />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <SessionGuard>
            <PushNotificationManager />
            {children}
          </SessionGuard>
        </ThemeProvider>

        <Toaster position="top-center" reverseOrder={false} />
        <Analytics />
        <SpeedInsights />
        {/* <Toaster /> */}
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </body>

    </html>
  );
}
