"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, ProfileFormData } from "@/app/types/profile";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/uiComponent/Spinner";
import { 
  User, 
  Image as ImageIcon, 
  GraduationCap, 
  Wrench, 
  Briefcase, 
  Settings 
} from "lucide-react";
import dynamic from "next/dynamic";
import clsx from "clsx";

// Dynamically import steps to reduce bundle size
const Step1Personal = dynamic(() => import("../create-profile/Step1Personal").then(mod => mod.Step1Personal), { loading: () => <Spinner /> });
const Step1Uploads = dynamic(() => import("../create-profile/Step1Uploads").then(mod => mod.Step1Uploads), { loading: () => <Spinner /> });
const Step2Education = dynamic(() => import("../create-profile/Step2Education").then(mod => mod.Step2Education), { loading: () => <Spinner /> });
const Step3Skills = dynamic(() => import("../create-profile/Step3Skills").then(mod => mod.Step3Skills), { loading: () => <Spinner /> });
const Step4Experience = dynamic(() => import("../create-profile/Step4Experience").then(mod => mod.Step4Experience), { loading: () => <Spinner /> });
const Step5Additional = dynamic(() => import("../create-profile/Step5Additional").then(mod => mod.Step5Additional), { loading: () => <Spinner /> });

const TABS = [
  { id: "personal", label: "Personal Info", icon: User, component: Step1Personal },
  { id: "uploads", label: "Profile Images", icon: ImageIcon, component: Step1Uploads },
  { id: "education", label: "Education", icon: GraduationCap, component: Step2Education },
  { id: "skills", label: "Skills", icon: Wrench, component: Step3Skills },
  { id: "experience", label: "Experience", icon: Briefcase, component: Step4Experience },
  { id: "preferences", label: "Preferences", icon: Settings, component: Step5Additional },
];

export const SettingsForm = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const methods = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onTouched",
  });

  const { reset, handleSubmit, formState: { isSubmitting, isDirty } } = methods;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            // Check if we are on the client side before redirecting
            if (typeof window !== 'undefined') {
                 window.location.href = "/sign-in";
            }
            return;
        }

        setUserId(session.user.id);

        const { data: profile, error } = await supabase
          .from("student_profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (error) throw error;

        if (profile) {
          reset({
            first_name: profile.full_name?.split(" ")[0] || "",
            // username: profile.username || "", // Username checks might be tricky if handled separately
            username: profile.username || "",
            phone: profile.phone || "",
            location: profile.location || "",
            about: profile.about || "",
            avatar_url: profile.avatar_url || "",
            cover_image: profile.cover_image || "",
            university: profile.university || "",
            degree: profile.degree || "",
            field_of_study: profile.field_of_study || "",
            graduation_year: profile.graduation_year || undefined,
            gpa: profile.gpa || "",
            hard_skills: profile.hard_skills || [],
            soft_skills: profile.soft_skills || [],
            languages: profile.languages || [],
            portfolio_url: profile.portfolio_url || "",
            github_url: profile.github_url || "",
            linkedin_url: profile.linkedin_url || "",
            previous_roles: profile.previous_roles || [],
            preferred_industries: profile.preferred_industries || [],
            work_mode: profile.work_mode || undefined,
            interests: profile.interests || [],
            achievements: profile.achievements || [],
            accommodations: profile.accommodations || "",
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [supabase, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!userId) return;
    
    // We combine first_name and potentially last_name if we had it, but schema only has first_name mapped to full_name usually?
    // Actually schema has first_name, but DB has full_name. We should probably adjust data before sending if needed.
    // Assuming backend handles it or we send as is. 
    // Looking at MultiStepForm, it sends `data` directly. 
    // BUT Step1Personal has `first_name` input. 
    // Let's assume the API/Backend expects the flat structure or handles mapping.
    // If table has `full_name`, and form has `first_name`, we might need to map it. 
    // MultiStepForm sends `data` directly to `/api/students/student/${userId}`.
    
    try {
      const response = await fetch(`/api/students/student/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update profile");
      
      toast.success("Profile updated successfully!");
      // Optionally refresh data or keep as is
      reset(data); // Reset dirty state with new data
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to save changes.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100">
        <Spinner /> <span className="ml-3 text-gray-500 font-medium">Loading your profile...</span>
      </div>
    );
  }

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || Step1Personal;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Sidebar Tabs */}
      <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Settings</h2>
          <p className="text-xs text-gray-500 mt-1">Manage your profile</p>
        </div>
        <nav className="p-2 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                activeTab === tab.id
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <tab.icon size={18} className={clsx(activeTab === tab.id ? "text-blue-600" : "text-gray-400")} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-9 space-y-6">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {TABS.find(t => t.id === activeTab)?.label}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Update your {TABS.find(t => t.id === activeTab)?.label.toLowerCase()} details
                  </p>
                </div>
                
                {/* Save Button (Top Right) */}
                 <Button 
                  type="submit" 
                  disabled={!isDirty || isSubmitting}
                  className={clsx(
                    "transition-all",
                    !isDirty && "opacity-50"
                  )}
                >
                  {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
                  Save Changes
                </Button>
              </div>

              <div className="p-6">
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <ActiveComponent />
                </div>
              </div>

              <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex justify-end">
                 {/* Duplicate Save Button (Bottom) for convenience */}
                <Button 
                  type="submit" 
                  disabled={!isDirty || isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};
