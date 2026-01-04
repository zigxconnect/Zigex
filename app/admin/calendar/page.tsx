import { redirect } from "next/navigation";
import { getAuthenticatedCompanyProfile } from "@/lib/data/postings";
import { CalendarHeader } from "@/components/sections/admin/calendar/CalendarHeader";
import { CalendarGrid } from "@/components/sections/admin/calendar/CalendarGrid";
import { UpcomingEvents } from "@/components/sections/admin/calendar/UpcomingEvents";

export default async function CalendarPage() {
  const companyProfile = await getAuthenticatedCompanyProfile();
  if (!companyProfile) return redirect("/sign-in");

  return (
    <div className="space-y-8 pb-12">
      <CalendarHeader />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <CalendarGrid />
        </div>
        <div className="lg:col-span-4">
          <UpcomingEvents />
        </div>
      </div>
    </div>
  );
}
