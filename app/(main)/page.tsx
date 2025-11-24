import BamendaHeroSection from "@/components/sections/landing/HeroSection";
import FeaturedInternships from "@/components/sections/landing/FeaturesSection";
import { WhyChoose } from "@/components/sections/landing/Whychoose";
import { VisionMissionSection } from "@/components/sections/landing/VisionMissionSection";
import SectionDivider from "@/components/sections/landing/SectionDivider";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <BamendaHeroSection />

      {/* Divider */}
      <SectionDivider variant="wave" />

      {/* Vision & Mission Section */}
      <VisionMissionSection />

      {/* Divider */}
      <SectionDivider variant="default" />

      {/* Featured Internships Section */}
      <FeaturedInternships />

      {/* Divider */}
      <SectionDivider variant="gradient" />

      {/* Why Choose Section */}
      <WhyChoose />
    </div>
  );
}
