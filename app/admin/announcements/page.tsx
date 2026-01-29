import { AnnouncementBoardClient } from "@/components/sections/admin/announcements/AnnouncementBoardClient";
import { getAnnouncements } from "@/lib/actions/announcement.actions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Announcements | Zigex Admin",
  description: "Manage platform and company announcements",
};

export default async function AnnouncementsPage() {
  const [announcements, companies] = await Promise.all([
    getAnnouncements(),
    import("@/lib/actions/announcement.actions").then(mod => mod.getAllCompanies())
  ]);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Announcement Center</h1>
      <p className="text-muted-foreground mb-8">Post updates, news, and important information for your interns and supervisors.</p>
      
      <div className="bg-white dark:bg-slate-900 rounded-xl border p-6 shadow-sm">
        <AnnouncementBoardClient announcements={announcements} companies={companies} />
      </div>
    </div>
  );
}
