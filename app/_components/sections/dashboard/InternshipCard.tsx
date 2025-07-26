// 1. Import the Link component
import Link from "next/link";

import { Card } from "@/app/_components/ui/Card";
import { Badge } from "@/app/_components/ui/Badge";
import { Tag } from "@/app/_components/ui/Tag";
import { Button } from "@/app/_components/ui/Button";
import { MapPin } from "lucide-react";

export type Internship = {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: number;
  isPaid: boolean;
  skills: string[];
  companyInitial: string;
  office: string;
};

export const InternshipCard = ({ internship }: { internship: Internship }) => {
  return (
    // 2. Wrap the entire card in a Link component
    // The `href` is dynamically created using the internship's ID.
    // The `block` class ensures the link takes up the full space.
    <Link href="/internships/1" className="block hover:no-underline">
      {/*
              3. Added transition and hover classes for a nice visual effect.
              Added h-full to ensure all cards in a row have the same height.
            */}
      <Card className="flex flex-col p-0 overflow-hidden h-full transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ">
        <div className="md:h-50 h-60 bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-xl relative">
          <img src={internship.office} alt="office" className="md:h-50 md:w-90 w-100 h-60" /> 
          <div className="absolute top-2 right-2">
            <Badge variant={internship.isPaid ? "paid" : "unpaid"}>
              {internship.isPaid ? "Paid" : "Unpaid"}
            </Badge>
          </div>
        </div>
        <div className="flex flex-col p-6 flex-grow">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#EA580C] rounded-md flex-shrink-0 flex items-center justify-center text-white font-bold text-xl">
              {internship.companyInitial}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{internship.title}</h3>
              <p className="text-sm text-gray-600">{internship.company}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <MapPin size={12} /> {internship.location}
              </div>
            </div>
          </div>
          <div className="flex-grow mt-4">
            <div className="flex flex-wrap gap-2">
              {internship.skills.map((skill) => (
                <Tag key={skill}>{skill}</Tag>
              ))}
            </div>
          </div>
          <div className="flex items-end justify-between mt-6">
            <div className="text-lg font-bold text-gray-900">
              ${internship.salary}
              <span className="text-sm font-normal text-gray-500">/month</span>
            </div>
            {/* Important Note: This button will now also link to the details page. */}
            <Button variant="orange" asChild>
              {/* We use asChild to prevent nested <a> tags, letting the parent <Link> control navigation */}
              <div>Apply</div>
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
};
