import type { Metadata } from "next";
import { getMyProfile } from "@/lib/api/services/profile";
import { ZilaPage } from "@/components/zila/ZilaPage";

export const metadata: Metadata = { title: "Zila AI" };

/** Zila AI isn't open yet: what it will do, and a one-tap "notify me". */
export default async function ZilaAIPage() {
  const p = (await getMyProfile().catch(() => null)) as Record<string, any> | null;
  return <ZilaPage email={String(p?.email ?? "")} firstName={String(p?.first_name ?? "").trim()} />;
}
