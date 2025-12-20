import type { Metadata } from "next";
import { Inter, Host_Grotesk } from "next/font/google";
import "./globals.css";
// import { Toaster } from "@/components/ui/sonner";
import { Toaster } from "react-hot-toast";

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
  metadataBase: new URL("https://zigex.vercel.app"),
  title: {
    default: "Zigex | Internship, Growth & Professional Experience",
    template: "%s | Zigex",
  },
  description:
    "Zigex (Zone for Internship, Growth and Experience) is Africa's premier gateway to career advancement. Discover tech internships, masterclasses, and community events designed to empower the next generation of digital leaders through digitalization and SEED Bamenda.",
  keywords: [
    "ZIGEX",
    "Zone for Internship Growth and Experience",
    "Internships",
    "Tech Programs",
    "Events",
    "Career Growth",
    "Digital Skills",
    "SEED Bamenda",
    "Cameroon Tech",
  ],
  openGraph: {
    url: "https://zigex.vercel.app",
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
    canonical: "https://zigex.vercel.app",
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
        <Toaster position="top-center" reverseOrder={false} />
        {/* <Toaster /> */}
      </body>
    </html>
  );
}
