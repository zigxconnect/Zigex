import { redirect } from "next/navigation";
import {
  getProfileInfo,
  hasCompletedProfile,
} from "@/lib/actions/profile.actions";
import BamendaHeroSection from "@/components/sections/landing/HeroSection";
import FeaturedInternships from "@/components/sections/landing/FeaturesSection";
import { WhyChoose } from "@/components/sections/landing/Whychoose";

export default async function LandingPage() {
  const hasCompletedYourProfile = await hasCompletedProfile();
  const profileInfo = await getProfileInfo();
  console.log(`here is the data: ${profileInfo}`);
  console.log(`your completed profile is: ${hasCompletedYourProfile}`);
  if (hasCompletedYourProfile) return redirect("/dashboard");
  return (
    <div className="flex flex-col">
      <BamendaHeroSection />
      <FeaturedInternships />
      <WhyChoose />
    </div>
  );
}
