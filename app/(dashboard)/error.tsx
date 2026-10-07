"use client";

import { ErrorScreen } from "@/components/errors/ErrorScreen";

/** A page inside the app failed to load: the sidebar and header stay, only the page area explains and retries. */
export default function DashboardError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorScreen {...props} compact />;
}
