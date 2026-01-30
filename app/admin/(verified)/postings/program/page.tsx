import { PostProgramForm } from "@/components/sections/admin/PostProgramForm";

export default function NewProgramPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Post a New Program</h1>
      <PostProgramForm />
    </div>
  );
}
