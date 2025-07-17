// export default function LandingPage() {
//   return (
//     <main className="container mx-auto px-6 py-24 text-center">
//       <h1 className="text-4xl font-bold text-gray-900">
//         Welcome to futureProspect
//       </h1>
//       <p className="mt-4 text-lg text-gray-600">
//         The main content for the landing page will be built here.
//       </p>
//     </main>
//   );
// }

// --- GOAL STATE ---
// After the team builds the sections, this file should look like this:
import FeaturedInternships from "./_components/sections/landing/FeaturesSection";
import HeroSection from "./_components/sections/landing/HeroSection";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <FeaturedInternships />
      {/* <TestimonialsSection /> */}
    </div>
  );
}
