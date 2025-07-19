import { InternshipSearch } from "@/app/_components/sections/dashboard/InternshipSearch";
import { InternshipGrid } from "@/app/_components/sections/dashboard/InternshipGrid";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <InternshipSearch />
      <InternshipGrid />
    </div>
  );
}
