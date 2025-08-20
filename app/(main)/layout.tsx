import { Footer } from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
// import Navbar from "../_components/layout/Navbar";
// import { Footer } from "../_components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "futureProspect",
  description: "Helping you build the future, one prospect at a time.",
};

/**
 * RootLayout
 * This is the primary layout for the application.
 * It includes the main Navbar and Footer.
 * The flexbox classes ensure the footer sticks to the bottom of the viewport
 * on pages with short content.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
