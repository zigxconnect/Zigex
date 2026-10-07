"use client";

import "./globals.css";
import { ErrorScreen } from "@/components/errors/ErrorScreen";

/** Last resort when even the root layout fails: same friendly screen instead of Next's default. */
export default function GlobalError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ErrorScreen {...props} />
      </body>
    </html>
  );
}
