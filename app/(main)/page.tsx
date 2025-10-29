import BamendaHeroSection from "@/components/sections/landing/HeroSection";
import FeaturedInternships from "@/components/sections/landing/FeaturesSection";
import { WhyChoose } from "@/components/sections/landing/Whychoose";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <BamendaHeroSection />
      {/* <FeaturedInternships /> */}
      {/* <WhyChoose /> */}
    </div>
  );
}
