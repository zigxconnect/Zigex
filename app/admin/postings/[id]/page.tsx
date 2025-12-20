import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getPostingById, Posting } from "@/lib/data/postings";
import {
  Edit,
  Briefcase,
  Clock,
  MapPin,
  Calendar,
  CheckCircle,
  LucideIcon,
  Zap,
} from "lucide-react";

// Helper component for displaying a single detail item with an icon
const DetailItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start gap-3">
    <div className="mt-1">
      <Icon className="h-5 w-5 text-gray-500" />
    </div>
    <div>
      <p className="font-semibold text-gray-800">{label}</p>
      <div className="text-gray-600">{value}</div>
    </div>
  </div>
);

// Helper component to render a list of skills
const SkillsList = ({ skills }: { skills: string[] }) => (
  <div className="flex flex-wrap gap-2 mt-1">
    {skills.map((skill) => (
      <span
        key={skill}
        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
      >
        {skill}
      </span>
    ))}
  </div>
);

// This component conditionally renders the correct set of details based on the posting's type
const DetailsSidebar = ({ posting }: { posting: Posting }) => {
  let status: "Active" | "Expired";

  switch (posting.type) {
    case "Internship":
      status = new Date(posting.deadline) > new Date() ? "Active" : "Expired";
      return (
        <>
          <DetailItem
            icon={CheckCircle}
            label="Status"
            value={
              <span
                className={`font-bold ${
                  status === "Active" ? "text-green-600" : "text-red-600"
                }`}
              >
                {status}
              </span>
            }
          />
          <DetailItem icon={MapPin} label="Location" value={posting.location} />
          <DetailItem
            icon={Briefcase}
            label="Internship Type"
            value={posting.type}
          />
          <DetailItem
            icon={Calendar}
            label="Start Date"
            value={new Date(posting.start_date).toLocaleDateString()}
          />
          <DetailItem
            icon={Clock}
            label="Application Deadline"
            value={new Date(posting.deadline).toLocaleDateString()}
          />
          {posting.required_skills && posting.required_skills.length > 0 && (
            <DetailItem
              icon={CheckCircle}
              label="Skills"
              value={<SkillsList skills={posting.required_skills} />}
            />
          )}
        </>
      );

    case "Program":
      status = new Date(posting.end_date) > new Date() ? "Active" : "Expired";
      return (
        <>
          <DetailItem
            icon={CheckCircle}
            label="Status"
            value={
              <span
                className={`font-bold ${
                  status === "Active" ? "text-green-600" : "text-red-600"
                }`}
              >
                {status}
              </span>
            }
          />
          <DetailItem
            icon={Zap}
            label="Category"
            value={posting.program_category}
          />
          <DetailItem
            icon={MapPin}
            label="Format"
            value={posting.program_format}
          />
          <DetailItem
            icon={Calendar}
            label="Start Date"
            value={new Date(posting.start_date).toLocaleDateString()}
          />
          <DetailItem
            icon={Calendar}
            label="End Date"
            value={new Date(posting.end_date).toLocaleDateString()}
          />
          {posting.required_skills && posting.required_skills.length > 0 && (
            <DetailItem
              icon={CheckCircle}
              label="Skills"
              value={<SkillsList skills={posting.required_skills} />}
            />
          )}
        </>
      );

    // Add a 'case' for 'Event' here when you implement it

    default:
      return <p>This posting type has no details defined.</p>;
  }
};

export default async function PostingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // A single, simple call to our new service function
  const posting = await getPostingById(id);

  if (!posting) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
            {posting.type}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            {posting.title}
          </h1>
        </div>
        <Button asChild>
          <Link href={`/admin/postings/${posting.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" /> Edit Posting
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Description</h2>
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
            {posting.description}
          </div>
        </div>

        <div className="space-y-6 bg-white p-6 rounded-lg border">
          {/* The dynamic sidebar component renders the correct details */}
          <DetailsSidebar posting={posting} />
        </div>
      </div>
    </div>
  );
}
