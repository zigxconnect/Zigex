import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Zigex | Internships, programs and events for students in Cameroon" },
  description:
    "Apply to internships, join training programs and attend events from verified companies in Bamenda and across Cameroon.",
};

/**
 * Layout for the landing and privacy pages: page content plus the footer
 * (each page renders its own header).
 * The flexbox classes ensure the footer sticks to the bottom of the viewport
 * on pages with short content.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Uses the root layout's Inter via font-sans. A second Inter instance here
    // failed to load and fell back to a serif font on some machines.
    <div className="font-sans flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
