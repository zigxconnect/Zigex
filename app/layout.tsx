import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://innovatewithseed.com"),
  title: {
    default: "SeedTechCmr| SEED | innovatewithseed | skills enhancement and empowerment throgh digitalization, seed bamenda ",
    template: "%s  SeedTechCmr| SEED | innovatewithseed | skills enhancement and empowerment throgh digitalization, seed bamenda "
  },

  description: "SEED (Skill Enhancement and Empowerment through Digitalisation) is a private tech startup in Bamenda, Cameroon. Legally recognized, SEED focuses on fostering tech innovation and offering hands-on training in diverse tech fields.",
  manifest: '/manifest.json',
  // themeColor: '#FF6F00',
  keywords: [
    "fonyuygita",
    "seed Inc",
    "cheko yohane",
    "Fien dora",
    "ShowRoad",
    'search internship',
    "hackertons",
    "innovatewithseed.com",
    "bamenda",
    "center bolt nkwen",
    "fonyuy gita",
    "fonyuy jude fomonyuy",
    "nquami",
    "tech tutor ",
    "tech tutor",
    "tech tutor seed",
    "cameroon"
  ],
  openGraph: {
    url: "https://innovatewithseed.com/",
    type: "website",
    title: "ShowRoad |  Find any program - internship, hackertons in and around the country",
    description:
      "SEED (Skill Enhancement and Empowerment through Digitalisation) is a private tech startup based in Bamenda, Cameroon. Legally recognized under Cameroonian business regulations, SEED operates independently with a mission to foster technological innovation and provide hands-on training in various tech disciplines. Through its coding bootcamps, internships, and tech programs, SEED plays a pivotal role in equipping individuals with digital skills, empowering them to solve real-world problems..",
    images: [
      {
        url: "https://i.ibb.co/PDw0Wg2/cover2.jpg",
        width: 1200,
        height: 630,
        alt: "SEED"
      }
    ]
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
        url: "https://i.ibb.co/PDw0Wg2/cover2.jpg",
        width: 1200,
        height: 630,
        alt: "SEED"
      }
    ]
  },
  alternates: {
    canonical: "https://innovatewithseed.com/"
  }

};




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
