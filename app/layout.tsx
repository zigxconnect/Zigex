


import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "futureProspect",
  description: "Helping you build the future, one prospect at a time.",
};

/**
 * This is the new ROOT layout.
 * It is the top-level layout shared by every page and route group in the app.
 * It contains only the essential <html> and <body> tags, loads global CSS, and sets the font.
 * IT DOES NOT CONTAIN THE NAVBAR OR FOOTER. Each route group is now responsible
 * for its own specific layout (e.g., the (main) group's layout has the Navbar).
 */
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
