import { AdminHeader } from "@/app/_components/layout/admin/AdminHeader";
import { AdminSidebar } from "../_components/layout/admin/AdminSiderbar";

// In a real app, this data would be fetched from your database
const headerStats = {
  total: 6,
  active: 4,
  applications: 110,
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 text-gray-800">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Pass the stats object as a prop to the header */}
        <AdminHeader stats={headerStats} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
