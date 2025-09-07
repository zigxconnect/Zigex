import { PostInternshipForm } from "@/components/sections/admin/PostInternshipForm";

export default function NewInternshipPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Post a New Internship
      </h1>
      <PostInternshipForm />
    </div>
  );
}
