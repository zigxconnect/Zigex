import { Button } from "@/app/_components/ui/Button";
import { Menu } from "lucide-react";

export const DashboardHeader = () => {
  return (
    <header className="flex items-center justify-between p-6 border-b bg-white">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-gray-600">
          <Menu />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Discover Internships
        </h1>
      </div>
      <Button variant="orange">Post Job</Button>
    </header>
  );
};
