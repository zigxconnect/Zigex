import { notFound } from "next/navigation";
import { getPostingById } from "@/lib/data/postings";
import { PostInternshipForm } from "@/components/sections/admin/PostInternshipForm";
import { PostProgramForm } from "@/components/sections/admin/PostProgramForm";

// A placeholder for a future Event form
const PostEventForm = ({ initialData }: { initialData?: any }) => (
  <div className="bg-white p-8 rounded-lg border">
    <h3 className="font-semibold text-lg">Event Editing Form</h3>
    <p className="text-gray-600 mt-2">This form is not yet implemented.</p>
    <pre className="mt-4 text-xs bg-gray-50 p-4 rounded-md overflow-x-auto">
      {JSON.stringify(initialData, null, 2)}
    </pre>
  </div>
);

export default async function EditPostingPage({
  params,
}: {
  params: { id: string };
}) {
  // A single call to get the data, regardless of its type
  const posting = await getPostingById(params.id);

  if (!posting) {
    notFound();
  }

  // This helper function determines which form component to render
  const renderForm = () => {
    switch (posting.type) {
      case "Internship":
        // Pass the fetched data to the form to pre-fill the fields
        return <PostInternshipForm initialData={posting} />;

      case "Program":
        // Pass the fetched data to the form to pre-fill the fields
        return <PostProgramForm initialData={posting} />;

      case "Event":
        return <PostEventForm initialData={posting} />;

      default:
        return <p>No edit form available for this posting type.</p>;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Edit <span className="text-blue-600">{posting.type}</span> Posting
      </h1>

      {/* Render the correct form based on the logic above */}
      {renderForm()}
    </div>
  );
}
