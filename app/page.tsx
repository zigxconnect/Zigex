import FeaturedInternships from "./_components/sections/landing/FeaturesSection";
import WhyChoose from "./_components/sections/landing/WhyChoose";
import HeroSection from "./_components/sections/landing/HeroSection";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <FeaturedInternships />
      <WhyChoose />
    </div>
  );
}
