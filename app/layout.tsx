import type { Metadata } from "next";
import { Inter, Host_Grotesk } from "next/font/google";
import "./globals.css";
// import { Toaster } from "@/components/ui/sonner";
import { Toaster } from "react-hot-toast";
import { InstallPwaPopup } from "@/components/pwa/InstallPwaPopup";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

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
    <html lang="en">
      <body className={`${inter.variable} ${hostGrotesk.variable} antialiased`}>
        {children}
        <InstallPwaPopup />
        <Toaster position="top-center" reverseOrder={false} />
        <Analytics />
        <SpeedInsights />
        {/* <Toaster /> */}
      </body>

    </html>
  );
}
