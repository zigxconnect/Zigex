import { Button } from "@/app/_components/ui/Button";
import { PostInternshipForm } from "@/app/_components/sections/admin/PostInternshipForm";

export default function NewPostingPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Post a New Internship
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Fill out the details below to find your next great hire.
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" className="bg-white">
            Save Draft
          </Button>
          <Button variant="orange">Publish Internship</Button>
        </div>
      </div>

      {/* The Form */}
      <PostInternshipForm />
    </div>
  );
}
