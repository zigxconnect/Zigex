import FeaturedInternships from "../_components/sections/landing/FeaturesSection";
import BamendaHeroSection from "../_components/sections/landing/HeroSection";
import { WhyChoose } from "../_components/sections/landing/Whychoose";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <BamendaHeroSection />
      <FeaturedInternships />
      <WhyChoose />
    </div>
  );
}
