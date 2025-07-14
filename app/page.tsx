/**
 * This is the main landing page.
 * For now, it contains simple placeholder content.
 *
 * Once the section components are built, you will replace the content
 * of this file with the commented-out code at the bottom.
 */

export default function LandingPage() {
  return (
    <main className="container mx-auto px-6 py-24 text-center">
      <h1 className="text-4xl font-bold text-gray-900">
        Welcome to futureProspect
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        The main content for the landing page will be built here.
      </p>
    </main>
  );
}

/*
  // --- GOAL STATE ---
  // After the team builds the sections, this file should look like this:

  import { HeroSection } from './_components/sections/landing/HeroSection';
  import { FeaturesSection } from './_components/sections/landing/FeaturesSection';
  import { TestimonialsSection } from './_components/sections/landing/TestimonialsSection';

  export default function LandingPage() {
    return (
      <div className="flex flex-col">
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
      </div>
    );
  }
*/
