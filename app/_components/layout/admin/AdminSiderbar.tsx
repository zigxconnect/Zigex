import Link from "next/link";
import { Logo } from "@/app/_components/ui/Logo";
import { Button } from "@/app/_components/ui/Button";
import {
  FileText,
  Users,
  FileEdit,
  CheckCheck,
  Sparkles,
  LogOut,
} from "lucide-react";

const companyData = {
  name: "TechCorp Bamenda",
  industry: "Technology Solutions",
  initials: "TC",
  description:
    "Leading technology company specializing in software development and digital solutions for businesses across Cameroon.",
};

// THE FIX IS HERE: The href values now include the /admin prefix.
const navLinks = [
  {
    href: "/admin/postings",
    icon: FileText,
    label: "Internship Postings",
    active: true,
  },
  { href: "/admin/applicants", icon: Users, label: "Applicants" },
  { href: "/admin/drafts", icon: FileEdit, label: "Draft Internships" },
  { href: "/admin/accepted", icon: CheckCheck, label: "Accepted Interns" },
];

export const AdminSidebar = () => {
  return (
    <aside className="w-80 flex-col bg-white border-r border-gray-200 p-6 flex">
      <Logo />

      <div className="flex flex-col items-center mt-8 text-center">
        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 text-3xl font-bold">
          {companyData.initials}
        </div>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">
          {companyData.name}
        </h2>
        <p className="text-sm text-gray-500">{companyData.industry}</p>
        <p className="mt-2 text-xs text-gray-600 leading-relaxed">
          {companyData.description}
        </p>
      </div>

      <nav className="flex-1 mt-8 space-y-2">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors
                        ${
                          link.active
                            ? "bg-slate-100 text-blue-700 font-semibold"
                            : "text-gray-600 hover:bg-slate-50"
                        }
                    `}
          >
            <link.icon size={20} /> <span>{link.label}</span>
          </Link>
        ))}
        <Link
          href="/admin/fupro-ai" // Also update this link
          className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:bg-slate-50"
        >
          <div className="flex items-center gap-3">
            <Sparkles size={20} className="text-orange-500" />{" "}
            <span>FuproAI</span>
          </div>
          <span className="text-xs font-bold text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full">
            NEW
          </span>
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
