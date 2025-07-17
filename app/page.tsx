import FeaturedInternships from "./_components/sections/landing/FeaturesSection";

import HeroSection from "./_components/sections/landing/HeroSection";
import { WhyChoose } from "./_components/sections/landing/Whychoose";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <FeaturedInternships />
      <WhyChoose />
    </div>
  );
}
