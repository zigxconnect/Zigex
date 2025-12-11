import { ZigAgentInterface } from "@/components/sections/ZigAgent/ZigAgentInterface";
import { getProfileInfo } from "@/lib/actions/profile.actions";

export const metadata = {
  title: "ZigAgent AI | Future Prospect",
  description: "Your personal AI research assistant.",
};

export default async function ZigAgentPage() {
  const user = await getProfileInfo();

  return (
    // Height calculation:
    // Mobile: 100vh - Header (4rem/64px) - Mobile Tabs (5rem/80px) = calc(100vh - 9rem)
    // Desktop: 100vh - Header (4rem/64px) = calc(100vh - 4rem)
    // using dvh for better mobile browser support
    <div className="h-[calc(100dvh-9rem)] lg:h-[calc(100dvh-4rem)] w-full bg-white overflow-hidden">
        <ZigAgentInterface user={user} />
    </div>
  );
}
