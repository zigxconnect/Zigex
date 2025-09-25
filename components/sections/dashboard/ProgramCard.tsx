"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, ExternalLink, GraduationCap } from "lucide-react";
import { Program } from "@/lib/types/dashoard";
import { SharePopover } from "@/components/SharePopover";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export const ProgramCard = ({ program }: { program: Program }) => {
  const companyName = program.company?.company_name || "Community Program";
  const coverImage = program.program_picture_url || "/program-placeholder.jpg";

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group relative">
      <div className="relative h-40 w-full overflow-hidden">
        <Image
          src={coverImage}
          alt={`Cover for ${program.title}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30" />
        <div className="absolute bottom-3 left-3">
          <span className="capitalize px-3 py-1.5 text-xs text-white bg-purple-800/90 rounded-full font-medium backdrop-blur-sm border border-white/20">
            {program.program_category}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-md bg-purple-500">
            <GraduationCap size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 line-clamp-2">
              {program.title}
            </h3>
            <p className="text-sm text-purple-800 font-medium truncate">
              {companyName}
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center justify-center bg-purple-100 text-purple-700 p-1 rounded-full">
              <MapPin size={12} />
            </div>
            <span className="truncate capitalize">
              {program.location || program.type}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center justify-center bg-purple-100 text-purple-700 p-1 rounded-full">
              <Clock size={12} />
            </div>
            <span>Starts: {formatDate(program.start_date)}</span>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center gap-3">
          <Link href={`/programs/${program.id}`} className="block flex-grow">
            <Button className="w-full bg-purple-700 hover:bg-purple-600 text-white rounded-lg py-3 flex items-center justify-center gap-2 group/btn">
              <span>View Program</span>
              <ExternalLink
                size={14}
                className="transition-transform group-hover/btn:translate-x-0.5"
              />
            </Button>
          </Link>
          <SharePopover
            title={program.title}
            urlPath={`/programs/${program.id}`}
          />
        </div>
      </div>
    </div>
  );
};
