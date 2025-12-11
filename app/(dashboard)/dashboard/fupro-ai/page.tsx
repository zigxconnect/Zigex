import { ZigAgentInterface } from "@/components/sections/ZigAgent/ZigAgentInterface";

export const metadata = {
  title: "ZigAgent AI | Future Prospect",
  description: "Your personal AI research assistant.",
};

export default function ZigAgentPage() {
  return (
    <div className="h-screen w-full bg-white overflow-hidden">
        <ZigAgentInterface />
    </div>
  );
}
