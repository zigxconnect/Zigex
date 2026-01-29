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
    <Card className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-indigo-100/20 border-indigo-100/50 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
      <div className="p-10 pb-6">
        <div className="flex justify-between items-center sm:items-end">
          <div className="space-y-1">
            <h1 className="text-2xl font-heading font-black text-slate-900 tracking-tighter">
              Candidate <span className="text-primary italic">Pipeline</span>
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Intelligence Stream • Real-time processing</p>
          </div>
          <Link href="/admin/applicants">
            <Button variant="ghost" className="rounded-2xl h-11 px-6 text-[10px] font-black uppercase tracking-widest gap-2 text-primary hover:text-white hover:bg-primary transition-all active:scale-95">
              Explore Analytics
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
              <tr className="bg-white/50 backdrop-blur-md">
                <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-indigo-50">
                  Candidate Profile
                </th>
                <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-indigo-50">
                  Target Opportunity
                </th>
                <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-indigo-50">
                  Status
                </th>
                <th className="px-10 py-5 border-b border-indigo-50 text-right">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-50/50">
              {(applicationsData.data ?? []).map((app, index) => (
                <tr
                  key={app.id}
                  onClick={() => router.push(`/admin/applicants?selected=${app.id}`)}
                  className="group hover:bg-white/80 transition-all duration-500 cursor-pointer"
                >
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center font-black text-lg shadow-lg group-hover:scale-110 transition-all duration-700 ${
                        index % 4 === 0 ? 'bg-gradient-to-br from-primary to-secondary text-white' :
                        index % 4 === 1 ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white' :
                        index % 4 === 2 ? 'bg-gradient-to-br from-emerald-400 to-teal-600 text-white' :
                        'bg-gradient-to-br from-amber-400 to-orange-600 text-white'
                      }`}>
                        {app.name?.charAt(0) ?? "?"}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">
                          {app.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 opacity-60">ID: #{String(app.id).slice(-4).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col">
                       <span className="text-sm font-black text-slate-800 tracking-tight truncate max-w-[240px]">{app.field}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span
                      className={`inline-flex items-center px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl shadow-sm ${getStatusStyles(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:bg-primary/10 group-hover:rotate-12 transition-all duration-500 ml-auto border border-transparent group-hover:border-primary/10">
                      <Eye size={18} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="p-8 bg-indigo-50/20 flex justify-center">
             <button 
               onClick={() => router.push('/admin/applicants')}
               className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] hover:text-primary transition-all hover:scale-105"
             >
               Explore comprehensive pipeline analytics
             </button>
          </div>
        </div>
      )}
    </Card>
  );
};

