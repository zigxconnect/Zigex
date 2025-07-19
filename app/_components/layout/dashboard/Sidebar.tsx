import Link from "next/link";
import { Logo } from "@/app/_components/ui/Logo";
import { Button } from "@/app/_components/ui/Button";
import { User, Upload, Briefcase, LogOut } from "lucide-react";
import { Tag } from "@/app/_components/ui/Tag"; // Import the new Tag component

// Mock data - this would come from a user session
const userData = {
  name: "John Kamdem",
  university: "University of Bamenda",
  avatar: "JK",
  skills: ["JavaScript", "React", "Python", "UI/UX Design"],
};

export const Sidebar = () => {
  return (
    <aside className="w-72 flex-col bg-white border-r p-6 hidden md:flex">
      <Logo />
      <div className="flex flex-col items-center mt-10 text-center">
        <div className="w-24 h-24 bg-blue-900 rounded-full flex items-center justify-center text-white text-4xl font-bold">
          {userData.avatar}
        </div>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">
          {userData.name}
        </h2>
        <p className="text-sm text-gray-500">{userData.university}</p>
      </div>
      <div className="mt-6">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Skills
        </h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {userData.skills.map((skill) => (
            <Tag key={skill}>{skill}</Tag>
          ))}
        </div>
      </div>
      <nav className="flex-1 mt-10 space-y-2">
        <Link
          href="#"
          className="flex items-center gap-3 px-3 py-2 text-gray-600 rounded-md hover:bg-gray-100"
        >
          <User size={20} />
          <span>Profile Settings</span>
        </Link>
        <Link
          href="#"
          className="flex items-center gap-3 px-3 py-2 text-gray-600 rounded-md hover:bg-gray-100"
        >
          <Upload size={20} />
          <span>Upload Resume</span>
        </Link>
        <Link
          href="#"
          className="flex items-center gap-3 px-3 py-2 text-blue-600 bg-blue-50 rounded-md font-semibold"
        >
          <Briefcase size={20} />
          <span>Applied Internships</span>
        </Link>
      </nav>
      <div className="mt-auto">
        <Button variant="secondary" className="w-full justify-start gap-3">
          <LogOut size={20} />
          <span>Sign Out</span>
        </Button>
      </div>
    </aside>
  );
};
