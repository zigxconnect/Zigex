import { MultiStepForm } from "@/app/_components/sections/create-profile/MultiStepForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Your Profile",
};

/**
 * This is the correct code for the Create Profile page.
 * Its ONLY responsibility is to render the main MultiStepForm component.
 */
export default function CreateProfilePage() {
  return (
    <div>
      <MultiStepForm />
    </div>
  );
}
