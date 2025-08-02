import { redirect } from "next/navigation";
import FeaturedInternships from "../_components/sections/landing/FeaturesSection";
import BamendaHeroSection from "../_components/sections/landing/HeroSection";
import { WhyChoose } from "../_components/sections/landing/Whychoose";
import { checkAuthStatus } from "@/lib/actions/auth.action";
import { getProfileInfo, hasCompletedProfile } from "@/lib/actions/profile.actions";

export default async function LandingPage() {
     const hasCompletedYourProfile=await hasCompletedProfile()
     const profileInfo=await getProfileInfo()
     console.log(`here is the data: ${profileInfo}`)
     console.log(`your completed profile is: ${hasCompletedYourProfile}`)
     if(hasCompletedYourProfile) return redirect("/dashboard")
  return (
    <div className="flex flex-col">
      <BamendaHeroSection />
      <FeaturedInternships />
      <WhyChoose />
    </div>
  );
}
