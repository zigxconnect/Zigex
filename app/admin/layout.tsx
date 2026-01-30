import { ReactNode } from "react";
import { AdminLayoutProvider } from "@/components/layout/admin/AdminLayoutProvider";

export default async function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AdminLayoutProvider>
      {children}
    </AdminLayoutProvider>
  );
}

