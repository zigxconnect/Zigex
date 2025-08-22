import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Edit } from "lucide-react";

interface WelcomeCardProps {
  user: {
    name: string;
    avatarUrl: string | null;
    initials: string;
    university: string;
    skills: string[];
    coverImageUrl: string;
  };
}

export const WelcomeCard = ({ user }: WelcomeCardProps) => {
  return (
    <div className="relative bg-white md:rounded-2xl shadow-lg md:border md:border-gray-200 overflow-hidden">
      <div className="h-40 md:h-48 bg-blue-800" />
      <div className="p-6">
        <div className="flex justify-between items-start -mt-20 md:-mt-24">
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-md flex-shrink-0 overflow-hidden">
            <Image
              src="/gita.png"
              alt={`${user.name}'s profile picture`}
              width={128}
              height={128}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <Link href="/profile-settings">
            <Button
              variant=""
              className="bg-blue-700 hover:bg-blue-600 text-white"
            >
              <Edit size={16} className="mr-2" />
              <span>Edit Profile</span>
            </Button>
          </Link>
        </div>
        <div className="mt-4">
          <h2 className="text-2xl font-bold text-blue-900">{user.name}</h2>
          <p className="text-md text-blue-800">{user.university}</p>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">
            Your Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 text-xs text-white bg-blue-800 rounded-full font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};