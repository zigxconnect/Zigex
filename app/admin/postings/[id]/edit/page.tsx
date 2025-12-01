// FILE: app/admin/postings/[id]/edit/page.tsx

import { notFound } from "next/navigation";
import { getPostingById } from "@/lib/data/postings";
import { PostInternshipForm } from "@/components/sections/admin/PostInternshipForm";
import { PostEventForm } from "@/components/sections/admin/PostEventForm";
import { PostProgramForm } from "@/components/sections/admin/PostProgramForm";

export default async function EditPostingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const posting = await getPostingById(id);

  if (!posting) {
    notFound();
  }

  const renderForm = () => {
    // THE FIX: Switch on the new `postingType` property
    switch (posting.postingType) {
      case "Internship":
        return <PostInternshipForm initialData={posting} />;
      case "Program":
        return <PostProgramForm initialData={posting} />;
      case "Event":
        return <PostEventForm initialData={posting} />;
      default:
        // This helps ensure you've handled all cases
        return <p>No edit form available for this posting type.</p>;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        {/* THE FIX: Use `postingType` for the UI title */}
        Edit <span className="text-blue-600">{posting.postingType}</span>{" "}
        Posting
      </h1>

      {renderForm()}
    </div>
  );
}
