// app/dashboard/chat/page.tsx
// import { PersonalizedInternshipChat } from '@/components/PersonalizedInternshipChat';

import { getProfileInfo, hasCompletedProfile } from "@/lib/actions/profile.actions";
import { PersonalizedInternshipChat } from "../_components/AiTest";
import { redirect } from "next/navigation";

export default async function ChatPage() {
  // const router=useRouter()
  const hasCompletedYourProfile=await hasCompletedProfile()
  const profileInfo=await getProfileInfo()
  console.log(`here is the data: ${profileInfo}`)
  console.log(`your completed profile is: ${hasCompletedYourProfile}`)
  if(!hasCompletedYourProfile) return redirect("/")
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Internship Assistant</h1>
        <p className="text-gray-600 mt-2">
          Get personalized internship recommendations tailored to your profile
        </p>
      </div>
      
      <PersonalizedInternshipChat />
    </div>
  );
}