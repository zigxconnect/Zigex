"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Inbox, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const EmptyTableState = ({
  title,
  message,
}: {
  title: string;
  message: string;
}) => (
  <div className="text-center py-20 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100 m-8">
    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-100">
       <Inbox className="h-8 w-8 text-slate-200" />
    </div>
    <h3 className="text-lg font-bold text-slate-700 font-heading">{title}</h3>
    <p className="mt-2 text-xs text-slate-400 max-w-[240px] mx-auto leading-relaxed">{message}</p>
  </div>
);

type Application = {
  id: string | number;
  name: string;
  field: string;
  status: string;
};

type ApplicationsData = {
  hasData: boolean;
  data?: Application[];
  emptyState?: { title: string; message: string };
};

export const RecentApplicationsTable = ({
  applicationsData,
}: {
  applicationsData: ApplicationsData;
}) => {
  const router = useRouter();

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-emerald-50 text-emerald-600 ring-emerald-600/10";
      case "reviewed":
        return "bg-blue-50 text-blue-600 ring-blue-600/10";
      case "pending":
        return "bg-amber-50 text-amber-600 ring-amber-600/10";
      case "rejected":
        return "bg-rose-50 text-rose-600 ring-rose-600/10";
      default:
        return "bg-slate-50 text-slate-600 ring-slate-600/10";
    }
  };

  return (
    <Card className="bg-white rounded-[2.5rem] shadow-sm border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
      <div className="p-8 pb-4">
        <div className="flex justify-between items-center sm:items-end">
          <div>
            <h3 className="text-xl font-heading font-black text-slate-900 tracking-tight">
              Candidate <span className="text-primary">Pipeline</span>
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wide">Latest submissions needing your attention</p>
          </div>
          <Link href="/admin/applicants">
            <Button variant="ghost" className="rounded-xl h-9 text-xs font-bold gap-2 text-primary hover:text-primary hover:bg-primary/5">
              Explore Full Filter
              <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </div>

      {!applicationsData.hasData ? (
        <EmptyTableState
          title={applicationsData.emptyState?.title ?? "Pipeline Empty"}
          message={
            applicationsData.emptyState?.message ??
            "Candidates who apply to your postings will appear here for initial screening."
          }
        />
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-white">
                <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] border-b border-slate-50">
                  Candidate Profile
                </th>
                <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] border-b border-slate-50">
                  Target Opportunity
                </th>
                <th className="px-8 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] border-b border-slate-50">
                  Status
                </th>
                <th className="px-8 py-4 border-b border-slate-50" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50/50">
              {(applicationsData.data ?? []).map((app, index) => (
                <tr
                  key={app.id}
                  onClick={() => router.push(`/admin/applicants?selected=${app.id}`)}
                  className="group hover:bg-slate-50/50 transition-all duration-300 cursor-pointer"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm ring-1 ring-slate-100 group-hover:scale-110 transition-transform duration-500 ${
                        index % 2 === 0 ? 'bg-indigo-50 text-indigo-600 ring-indigo-100' : 'bg-blue-50 text-blue-600 ring-blue-100'
                      }`}>
                        {app.name?.charAt(0) ?? "?"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                          {app.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">Candidate ID: #{String(app.id).slice(-4)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                       <span className="text-sm font-semibold text-slate-700 truncate max-w-[200px]">{app.field}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg ring-1 ring-inset ${getStatusStyles(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:bg-primary/5 transition-all outline-none">
                      <Eye size={16} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="p-6 bg-slate-50/30 flex justify-center">
             <button 
               onClick={() => router.push('/admin/applicants')}
               className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"
             >
               View all candidates in pipeline
             </button>
          </div>
        </div>
      )}
    </Card>
  );
};

