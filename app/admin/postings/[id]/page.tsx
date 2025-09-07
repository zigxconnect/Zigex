import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Edit,
  Briefcase,
  Clock,
  MapPin,
  Calendar,
  CheckCircle,
  LucideIcon,
} from "lucide-react";

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

export default async function PostingDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  );

  const { data: posting, error } = await supabase
    .from("internships")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !posting) {
    notFound();
  }

  const status = new Date(posting.deadline) < new Date() ? "Expired" : "Active";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
            Internship
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
          <h2 className="text-lg font-bold mb-4 text-gray-800">
            Job Description
          </h2>
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
            {posting.description}
          </div>
        </div>

        <div className="space-y-6 bg-white p-6 rounded-lg border">
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
          <DetailItem icon={Briefcase} label="Type" value={posting.type} />
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
          <DetailItem
            icon={CheckCircle}
            label="Skills"
            value={
              <div className="flex flex-wrap gap-2 mt-1">
                {posting.required_skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
