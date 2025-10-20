import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zigex.vercel.app"),
  title: {
    default: "ZIGEX",
    template:
      "%s  ZiGex| SEED | ZiGex | skills enhancement and empowerment throgh digitalization, seed bamenda ",
  },
  description: "Zone For Internship,Growth and Experience ",
  keywords: [
    "fonyuygita",
    "seed Inc",
    "cheko yohane",
    "Fien dora",
    "ShowRoad",
    "search internship",
    "hackertons",
    "innovatewithseed.com",
    "bamenda",
    "Cameroon",
    "fonyuy gita",
    "fonyuy jude fomonyuy",
    "find program",
    "tech event ",
    "tech program",
    "tech tutor seed",
  ],
  openGraph: {
    url: "https://zigex.vercel.app",
    type: "website",
    title:
      "ShowRoad |  Find any program - internship, hackertons in and around the country",
    description:
      "SEED (Skill Enhancement and Empowerment through Digitalisation) is a private tech startup based in Bamenda, Cameroon. Legally recognized under Cameroonian business regulations, SEED operates independently with a mission to foster technological innovation and provide hands-on training in various tech disciplines. Through its coding bootcamps, internships, and tech programs, SEED plays a pivotal role in equipping individuals with digital skills, empowering them to solve real-world problems..",
    images: [
      {
        url: "https://i.ibb.co/5WXQhq78/Whats-App-Image-2025-09-23-at-8-22-42-AM.jpg",
        width: 1200,
        height: 630,
        alt: "SEED",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Skills Enhancement and Empowerment Through Digitalization",
    description:
      "SEED (Skill Enhancement and Empowerment through Digitalisation) is a private tech startup based in Bamenda, Cameroon.",
    creator: "@fonyuygita",
    site: "@innovatewithseed",
    images: [
      {
        url: "https://i.ibb.co/5WXQhq78/Whats-App-Image-2025-09-23-at-8-22-42-AM.jpg",
        width: 1200,
        height: 630,
        alt: "SEED",
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
        <Toaster />
      </body>
    </html>
  );
}