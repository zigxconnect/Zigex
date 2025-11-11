// app/(dashboard)/feed/layout.tsx
import { ReactNode } from "react";

export default function FeedLayout({ children }: { children: ReactNode }) {
  // This is now just a pass-through layout
  // The tabs and search will be handled by the FeedPage component itself
  return <>{children}</>;
}