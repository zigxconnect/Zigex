import { Input } from "@/app/_components/ui/Input";
import { Button } from "@/app/_components/ui/Button";
import { Search } from "lucide-react";

export const DashboardSearch = () => {
  return (
    <div className="relative px-6 md:px-0">
      <Search
        className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-400"
        size={20}
      />
      <Input
        type="text"
        placeholder="Search for your next internship..."
        className="w-full pl-12 pr-32 h-14 text-base"
      />
      <Button
        variant="primary-orange"
        className="absolute right-2.5 top-1/2 -translate-y-1/2 h-10 px-6"
      >
        Search
      </Button>
    </div>
  );
};
