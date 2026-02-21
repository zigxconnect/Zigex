"use client";

import Link from "next/link";
// Import all possible icons and helper types here
import { ArrowRight, Briefcase, Calendar, Zap, LucideIcon } from "lucide-react";

// Define a type for the allowed icon names for better type safety
export type IconName = "Briefcase" | "Calendar" | "Zap";

// Create a map to associate the string names with the actual components
const iconMap: Record<IconName, LucideIcon> = {
  Briefcase,
  Calendar,
  Zap,
};

type OptionCardProps = {
  icon: IconName; // The prop is now one of the allowed string names
  title: string;
  description: string;
  href: string;
};

export const OptionCard = ({
  icon,
  title,
  description,
  href,
}: OptionCardProps) => {
  // Look up the correct icon component from the map
  const Icon = iconMap[icon];

  return (
    <Link href={href} passHref>
      <div className="group bg-white rounded-lg p-6 border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 group-hover:bg-blue-500 transition-colors duration-300">
          {/* Render the dynamically selected Icon component */}
          <Icon className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
        <div className="mt-4 flex items-center text-blue-600 font-semibold">
          <span>Get Started</span>
          <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </Link>
  );
};
