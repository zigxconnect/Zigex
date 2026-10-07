"use client";

import { ErrorScreen } from "@/components/errors/ErrorScreen";

/** Any public page (landing, feed, sign-in, company pages) that failed to load. */
export default function AppError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorScreen {...props} />;
}
