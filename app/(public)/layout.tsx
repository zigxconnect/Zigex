/**
 * Public route-group layout.
 *
 * This layout wraps all pages under app/(public)/ — currently /feed and /feed/[id].
 * It uses `getOptionalAuth()` which never redirects, returning null for
 * unauthenticated visitors.  The PublicShell component then decides whether to
 * render the full authenticated dashboard or the slim public header.
 */

import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public/PublicShell";
import { getOptionalAuth } from "@/lib/utils/auth-context";

export const metadata: Metadata = {
  title: { template: "%s | Zigex", default: "Opportunities" },
  description: "Find internships, training programs and events from companies in Bamenda and across Cameroon.",
};

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getOptionalAuth();

  return (
    <PublicShell user={user}>
      {children}
    </PublicShell>
  );
}
