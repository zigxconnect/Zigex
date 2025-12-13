import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import { Toaster } from "@/components/ui/sonner";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
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
    default: "ZIGEX",
    template:
      "%s  ZiGex| SEED | ZiGex | skills enhancement and empowerment throgh digitalization, seed bamenda ",
  },
  description:
    "ZIGEX (Zone for Internship, Growth and Experience) is your gateway to career advancement. Connect with top tech internships, skill-building programs, and community events designed to empower the next generation of digital leaders.",
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
        url: "https://i.ibb.co/5WXQhq78/Whats-App-Image-2025-09-23-at-8-22-42-AM.jpg",
        width: 1200,
        height: 630,
        alt: "ZIGEX Community",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZIGEX | Zone for Internship, Growth and Experience",
    description:
      "ZIGEX (Zone for Internship, Growth and Experience) - Connecting aspiring talent with opportunities. Discover internships, programs, and events.",
    creator: "@fonyuygita",
    site: "@innovatewithseed",
    images: [
      {
        url: "https://i.ibb.co/5WXQhq78/Whats-App-Image-2025-09-23-at-8-22-42-AM.jpg",
        width: 1200,
        height: 630,
        alt: "ZIGEX Community",
      },
    ],
  },
  alternates: {
    canonical: "https://zigex.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" reverseOrder={false} />
        {/* <Toaster /> */}
      </body>
    </html>
  );
}
