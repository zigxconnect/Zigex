import { Button } from "@/app/_components/ui/Button";
import { ProfileForm } from "@/app/_components/sections/admin/ProfileForm";

export default function EditProfilePage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Company Profile
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Update your company information and branding
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" className="bg-white">
            Cancel
          </Button>
          <Button variant="orange">Save Changes</Button>
        </div>
      </div>

      {/* The Form */}
      <ProfileForm />
    </div>
  );
}
