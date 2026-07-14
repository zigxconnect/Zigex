"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, AlertTriangle, Filter, Search, DownloadCloud, Plus, LayoutGrid, List, Briefcase, Calendar, GraduationCap, ArrowLeft } from "lucide-react";

import { Applicant, ApplicantStatus, PaymentRecord, ApplicationType } from "@/lib/types/applicants";
import { ApplicantsTable } from "@/components/sections/admin/applicants/ApplicantsTable";
import { InternLedgerTable } from "@/components/sections/admin/applicants/InternLedgerTable";
import { InternManagementTable } from "@/components/sections/admin/applicants/InternManagementTable";
import { InternRecordsTable } from "@/components/sections/admin/applicants/InternRecordsTable";
import { InternsAnalytics } from "@/components/sections/admin/applicants/InternsAnalytics";
import { ApplicantDetail } from "@/components/sections/admin/applicants/ApplicantDetail";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Table as TableIcon, TrendingUp, CheckCircle2, Award, PieChart as ChartPieIcon } from "lucide-react";

type ViewState = "categories" | "postings" | "applicants";
type CategoryType = "internship" | "event" | "program";

function ApplicantsPageComponent() {
  const [currentView, setCurrentView] = useState<ViewState>("categories");
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [selectedPosting, setSelectedPosting] = useState<any | null>(null);

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [postings, setPostings] = useState({
    internship: [] as any[],
    event: [] as any[],
    program: [] as any[]
  });

  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table" | "ledger" | "management" | "records" | "analytics">("grid");
  const [companyId, setCompanyId] = useState<string | null>(null);

  const handleUpdatePaymentLedger = async (appId: string, ledger: PaymentRecord[]) => {
    try {
      const resp = await fetch(`/api/companies/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_ledger: ledger })
      });
      if (!resp.ok) throw new Error("Update failed");
      
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, paymentLedger: ledger } : a));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedIdFromUrl = searchParams.get("selected");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Fetching intelligence data...");

        const [appRes, compRes, intRes, evtRes, progRes] = await Promise.all([
          fetch("/api/companies/applications"),
          fetch("/api/companies/profiles"),
          fetch("/api/companies/internships"),
          fetch("/api/companies/events"),
          fetch("/api/companies/programs")
        ]);

        if (!appRes.ok) {
          const errorData = await appRes.json().catch(() => ({}));
          throw new Error(errorData.error || `Error ${appRes.status}`);
        }
        
        const data: Applicant[] = await appRes.json();
        setApplicants(data);

        if (compRes.ok) {
           const companyData = await compRes.json();
           setCompanyId(companyData.id);
        }

        const internships = intRes.ok ? await intRes.json() : [];
        const events = evtRes.ok ? await evtRes.json() : [];
        const programs = progRes.ok ? await progRes.json() : [];

        setPostings({ internship: internships, event: events, program: programs });

        // Handle URL selection
        if (selectedIdFromUrl) {
           const exists = data.find(app => app.id === selectedIdFromUrl);
           if (exists) {
              setSelectedApplicantId(selectedIdFromUrl);
              setIsSheetOpen(true);
              
              // To show the right view context:
              // Note: the URL deep link directly opens the applicant modal, but does not auto-drill down
              // into the postings view. The user can still see the modal above the categorires.
           }
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        const errorMessage = err.message || "Could not connect to the server.";
        setError(errorMessage);
        toast.error("Failed to load applicant intelligence", { description: errorMessage });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedIdFromUrl]);

  const handleSelectApplicant = (id: string) => {
    setSelectedApplicantId(id);
    setIsSheetOpen(true);
    // Silent update of URL for sharing/refreshing
    const url = new URL(window.location.href);
    url.searchParams.set("selected", id);
    window.history.replaceState({}, "", url.toString());
  };

  const handleUpdateStatus = async (
    applicantId: string,
    newStatus: ApplicantStatus
  ) => {
    const originalApplicants = [...applicants];
    setApplicants((prev) =>
      prev.map((app) =>
        app.id === applicantId ? { ...app, status: newStatus } : app
      )
    );

    try {
      const response = await fetch(
        `/api/companies/applications/${applicantId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Update failed");
      }
      toast.success(`Applicant marked as ${newStatus}`);
    } catch (err: any) {
      setApplicants(originalApplicants);
      toast.error("Update failed", { description: err.message });
    }
  };

  const handleUpdateSupervisor = (applicantId: string, supervisor: any) => {
    setApplicants((prev) =>
      prev.map((app) =>
        app.id === applicantId ? { ...app, supervisorId: supervisor.id, supervisor } : app
      )
    );
  };

  const handleDeleteApplicant = async (id: string) => {
    // Optimistic UI Update
    const originalApplicants = [...applicants];
    setApplicants((prev) => prev.filter((app) => app.id !== id));

    try {
      const response = await fetch(`/api/companies/applications/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete application");
      }
      
      toast.success("Application deleted successfully", {
        description: "The record has been permanently removed.",
        icon: "🗑️"
      });
      
      // If the deleted one was selected, close the modal
      if (selectedApplicantId === id) {
        setIsSheetOpen(false);
        setSelectedApplicantId(null);
      }
    } catch (err: any) {
      setApplicants(originalApplicants); // Revert
      toast.error("Delete failed", { description: err.message });
    }
  };

  const handleUpdatePayment = async (id: string, isPaid: boolean) => {
    // Optimistic UI update
    const originalApplicants = [...applicants];
    setApplicants((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, isPaid } : app
      )
    );

    try {
      const response = await fetch(`/api/companies/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_completed: isPaid }),
      });

      if (!response.ok) {
        throw new Error("Failed to update payment status");
      }

      toast.success(
        isPaid ? "Payment confirmed!" : "Payment status removed",
        {
          description: isPaid 
            ? "Student now has full access to program resources." 
            : "Student access has been revoked.",
          icon: isPaid ? "💳" : "🔒"
        }
      );
    } catch (err: any) {
      setApplicants(originalApplicants); // Revert
      toast.error("Update failed", { description: err.message });
    }
  };

  // Determine current applicants scope
  let currentApplicants = applicants;
  if (currentView === "applicants" && selectedPosting) {
    currentApplicants = applicants.filter(app => app.internshipId === selectedPosting.id);
  }

  const filteredApplicants = currentApplicants.filter(app => 
     app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
     (app.internshipTitle || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedApplicant = applicants.find(app => app.id === selectedApplicantId);


  const handleExportCSV = () => {
    if (filteredApplicants.length === 0) {
      toast.error("No applicants to export");
      return;
    }

    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Applied For",
      "Type",
      "Status",
      "Applied Date",
      "Payment Status",
      "Department",
      "Level",
      "Comments"
    ];

    const csvRows = [headers.join(",")];

    filteredApplicants.forEach(app => {
      const row = [
        app.id,
        app.name,
        app.email,
        app.phone,
        app.internshipTitle, // this holds title for all types based on api mapping
        app.applicationType,
        app.status,
        new Date(app.appliedDate).toLocaleDateString(),
        app.isPaid ? "Paid" : "Unpaid",
        app.department || "N/A",
        app.level || "N/A",
        app.comments || ""
      ].map(field => {
        // Handle special characters and quotes
        const stringField = String(field || "");
        if (stringField.includes(",") || stringField.includes('"') || stringField.includes("\n")) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      });
      
      csvRows.push(row.join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `applicants_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderCategories = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {[
        { id: "internship", title: "Internships", icon: Briefcase, color: "bg-blue-500", count: postings.internship.length },
        { id: "program", title: "Programs", icon: GraduationCap, color: "bg-purple-500", count: postings.program.length },
        { id: "event", title: "Events", icon: Calendar, color: "bg-amber-500", count: postings.event.length },
      ].map(cat => (
        <div 
          key={cat.id} 
          onClick={() => { setSelectedCategory(cat.id as CategoryType); setCurrentView("postings"); }}
          className="group relative bg-white border border-slate-100 p-8 rounded-3xl shadow-sm hover:shadow-xl hover:border-slate-200 transition-all cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -z-10 group-hover:bg-slate-100/50 transition-colors" />
          <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
            <cat.icon size={28} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 font-heading mb-2">{cat.title}</h3>
          <p className="text-slate-500 font-medium">{cat.count} posted {cat.title.toLowerCase()}</p>
          <div className="mt-8 flex items-center text-primary font-bold text-sm tracking-wide group-hover:translate-x-2 transition-transform">
             VIEW POSTINGS <ArrowLeft className="ml-2 rotate-180" size={16} />
          </div>
        </div>
      ))}
    </div>
  );

  const renderPostings = () => {
    if (!selectedCategory) return null;
    const items = postings[selectedCategory];
    
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {items.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-200 rounded-3xl bg-slate-50">
             <p className="text-slate-500 font-medium">No {selectedCategory}s found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => {
               // Calculate applicants for this specific posting
               const applicantCount = applicants.filter(app => app.internshipId === item.id).length;
               
               return (
                 <div 
                   key={item.id}
                   onClick={() => { setSelectedPosting(item); setCurrentView("applicants"); setSearchQuery(""); }}
                   className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col h-full"
                 >
                    {item.cover_image_url || item.program_picture_url || item.event_picture_url || item.image_url ? (
                      <div className="w-full h-40 mb-5 rounded-2xl overflow-hidden bg-slate-100 relative shadow-inner">
                         <img src={item.cover_image_url || item.program_picture_url || item.event_picture_url || item.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.title} />
                      </div>
                    ) : (
                      <div className="w-full h-40 mb-5 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                         <Briefcase className="text-slate-300" size={40} />
                      </div>
                    )}
                    <h3 className="font-bold text-xl text-slate-900 leading-tight mb-3 line-clamp-2">{item.title}</h3>
                    
                    <div className="mt-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                           <span className="text-sm text-slate-500 font-medium truncate mr-2">{item.location || 'Remote'}</span>
                           <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                           <span className="text-primary font-black bg-primary/10 px-4 py-1.5 rounded-xl text-sm border border-primary/20">
                              {applicantCount} Applicant{applicantCount !== 1 ? 's' : ''}
                           </span>
                           <span className="text-sm font-bold text-slate-400 group-hover:text-primary transition-colors flex items-center bg-slate-50 group-hover:bg-primary/5 px-3 py-1.5 rounded-xl">
                              View <ArrowLeft size={14} className="ml-1 rotate-180" />
                           </span>
                        </div>
                    </div>
                 </div>
               )
            })}
          </div>
        )}
      </div>
    );
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
        <h3 className="text-sm font-bold uppercase tracking-widest">Hydrating Pipeline...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-rose-50/50 border border-rose-100 p-12 rounded-3xl m-6 animate-in zoom-in-95">
        <AlertTriangle size={48} className="mb-4 text-rose-500" />
        <h3 className="text-xl font-black text-rose-900 font-heading">Sync Failure</h3>
        <p className="text-sm text-rose-600/70 mt-2 max-w-sm">{error}</p>
        <Button variant="outline" className="mt-6 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-100" onClick={() => window.location.reload()}>Retry Connection</Button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-12 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 pb-2 border-b border-slate-100">
        <div className="w-full max-w-full">
          <nav className="flex items-center space-x-2 text-sm font-bold text-slate-500 mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
             <button onClick={() => { setCurrentView("categories"); setSelectedCategory(null); setSelectedPosting(null); }} className={cn("hover:text-primary transition-colors", currentView === "categories" ? "text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20" : "")}>
                Categories
             </button>
             {selectedCategory && (
                <>
                   <span className="text-slate-300">/</span>
                   <button onClick={() => { setCurrentView("postings"); setSelectedPosting(null); }} className={cn("hover:text-primary transition-colors flex items-center capitalize", currentView === "postings" ? "text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20" : "")}>
                      {selectedCategory}s
                   </button>
                </>
             )}
             {selectedPosting && (
                <>
                   <span className="text-slate-300">/</span>
                   <button className="text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20 transition-colors flex items-center max-w-[200px] sm:max-w-sm truncate pr-4">
                      {selectedPosting.title}
                   </button>
                </>
             )}
          </nav>

          <h1 className="text-4xl font-heading font-black text-slate-900 tracking-tight mb-3 flex flex-wrap gap-2 items-center">
             {currentView === "categories" && <>Overview <span className="text-primary italic">Categories</span></>}
             {currentView === "postings" && <><span className="text-primary italic capitalize">{selectedCategory}</span> Postings</>}
             {currentView === "applicants" && <span className="truncate max-w-full md:max-w-2xl text-slate-900">{selectedPosting?.title}</span>}
          </h1>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest flex items-center gap-2 mt-2 md:mt-0">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
             {currentView === "categories" && "Select a category to manage applications"}
             {currentView === "postings" && `Select a posting to view its applicants`}
             {currentView === "applicants" && `${filteredApplicants.length} Candidates applied`}
          </p>
        </div>
        
        {currentView === "applicants" && (
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full xl:w-auto shrink-0 mt-4 xl:mt-0">
             <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                   <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                   <Input 
                     placeholder="Find candidates..." 
                     className="pl-11 h-12 w-full rounded-2xl bg-white border-slate-100 shadow-sm focus:ring-primary focus:border-primary transition-all"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="h-12 rounded-2xl border-slate-100 shadow-sm gap-2 font-bold text-slate-600">
                     <Filter size={16} /> Filters
                  </Button>
                  <Button 
                   variant="outline" 
                   onClick={handleExportCSV}
                   className="h-12 w-12 rounded-2xl border-slate-100 shadow-sm p-0 flex items-center justify-center text-slate-600 hover:bg-primary/5 hover:text-primary transition-colors shrink-0"
                   title="Export CSV"
                 >
                    <DownloadCloud size={18} />
                 </Button>
                </div>
             </div>

             <div className="w-full lg:w-auto overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
               <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-2xl border border-slate-100 min-w-max">
                <Button 
                  variant={viewMode === "grid" ? "primary" : "ghost"}
                  size="sm"
                  className={cn("rounded-xl h-10 px-4 transition-all", viewMode === "grid" ? "shadow-md bg-white border border-slate-200 text-primary" : "text-slate-500 hover:bg-slate-200/50")}
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid size={16} className="mr-2" /> Cards
                </Button>
                <Button 
                  variant={viewMode === "table" ? "primary" : "ghost"}
                  size="sm"
                  className={cn("rounded-xl h-10 px-4 transition-all", viewMode === "table" ? "shadow-md bg-white border border-slate-200 text-primary" : "text-slate-500 hover:bg-slate-200/50")}
                  onClick={() => setViewMode("table")}
                >
                  <TableIcon size={16} className="mr-2" /> Table
                </Button>
                <Button 
                  variant={viewMode === "ledger" ? "primary" : "ghost"}
                  size="sm"
                  className={cn("rounded-xl h-10 px-4 transition-all", viewMode === "ledger" ? "shadow-md bg-white border border-slate-200 text-primary" : "text-slate-500 hover:bg-slate-200/50")}
                  onClick={() => setViewMode("ledger")}
                >
                  <TrendingUp size={16} className="mr-2" /> Ledger
                </Button>
                <Button 
                  variant={viewMode === "management" ? "primary" : "ghost"}
                  size="sm"
                  className={cn("rounded-xl h-10 px-4 transition-all", viewMode === "management" ? "shadow-md bg-white border border-slate-200 text-primary" : "text-slate-500 hover:bg-slate-200/50")}
                  onClick={() => setViewMode("management")}
                >
                  <CheckCircle2 size={16} className="mr-2" /> Management
                </Button>
                <Button 
                  variant={viewMode === "records" ? "primary" : "ghost"}
                  size="sm"
                  className={cn("rounded-xl h-10 px-4 transition-all", viewMode === "records" ? "shadow-md bg-white border border-slate-200 text-primary" : "text-slate-500 hover:bg-slate-200/50")}
                  onClick={() => setViewMode("records")}
                >
                  <Award size={16} className="mr-2" /> Records
                </Button>
                <Button 
                  variant={viewMode === "analytics" ? "primary" : "ghost"}
                  size="sm"
                  className={cn("rounded-xl h-10 px-4 transition-all", viewMode === "analytics" ? "shadow-md bg-white border border-slate-200 text-primary" : "text-slate-500 hover:bg-slate-200/50")}
                  onClick={() => setViewMode("analytics")}
                >
                  <ChartPieIcon size={16} className="mr-2" /> Analytics
                </Button>
               </div>
             </div>
          </div>
        )}
      </header>

      {currentView === "categories" && renderCategories()}
      
      {currentView === "postings" && renderPostings()}

      {currentView === "applicants" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {filteredApplicants.map(applicant => (
                 <div
                   key={applicant.id}
                   className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-lg transition-all flex flex-col"
                 >
                   <div className="flex items-center gap-4 mb-4">
                     <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                       {applicant.name.charAt(0).toUpperCase()}
                     </div>
                     <div className="overflow-hidden">
                       <h3 className="font-bold text-slate-900 truncate">{applicant.name}</h3>
                       <p className="text-sm text-slate-500 truncate">{applicant.email}</p>
                     </div>
                   </div>
                   
                   <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl">
                         <span className="text-xs font-semibold text-slate-400 uppercase">Status</span>
                         <span className={cn(
                           "text-xs font-bold px-2.5 py-1 rounded-lg",
                           applicant.status === "hired" ? "bg-emerald-100 text-emerald-700" :
                           applicant.status === "rejected" ? "bg-rose-100 text-rose-700" :
                           applicant.status === "interviewing" ? "bg-blue-100 text-blue-700" :
                           "bg-amber-100 text-amber-700"
                         )}>
                            {applicant.status.replace("_", " ")}
                         </span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl">
                         <span className="text-xs font-semibold text-slate-400 uppercase">Applied</span>
                         <span className="text-xs font-bold text-slate-600">
                            {new Date(applicant.appliedDate).toLocaleDateString()}
                         </span>
                      </div>
                   </div>
                   
                   <div className="mt-auto">
                     <Button 
                       variant="outline" 
                       className="w-full rounded-xl border-slate-200 text-slate-600 hover:border-primary hover:text-primary transition-colors"
                       onClick={() => handleSelectApplicant(applicant.id)}
                     >
                       Review Application
                     </Button>
                   </div>
                 </div>
               ))}
               {filteredApplicants.length === 0 && (
                 <div className="col-span-full p-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-500 font-medium">No candidates match your criteria.</p>
                 </div>
               )}
            </div>
          )}
          {viewMode === "table" && (
            <ApplicantsTable 
              applicants={filteredApplicants}
              selectedApplicantId={selectedApplicantId}
              onSelect={handleSelectApplicant}
              onDelete={handleDeleteApplicant}
              onUpdatePayment={handleUpdatePayment}
            />
          )}
          {viewMode === "ledger" && (
            <InternLedgerTable 
              applicants={filteredApplicants}
              onDelete={handleDeleteApplicant}
              onUpdatePayment={handleUpdatePaymentLedger}
              companyId={companyId || ""}
            />
          )}
          {viewMode === "management" && (
            <InternManagementTable
              applicants={filteredApplicants}
              companyId={companyId || ""}
              onSelect={handleSelectApplicant}
            />
          )}
          {viewMode === "records" && (
             <InternRecordsTable
                applicants={filteredApplicants}
                companyId={companyId || ""}
             />
          )}
          {viewMode === "analytics" && (
             <InternsAnalytics applicants={filteredApplicants} />
          )}
        </div>
      )}

      {/* Focus Modal for Candidate Review */}
      <Dialog open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-y-auto max-h-[90vh] custom-scrollbar border-none shadow-3xl bg-slate-50/95 backdrop-blur-xl rounded-3xl">
           <div className="p-8 lg:p-12">
            {selectedApplicant ? (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <ApplicantDetail
                  applicant={selectedApplicant}
                  companyId={companyId || ""}
                  onUpdateStatus={(newStatus) =>
                    handleUpdateStatus(selectedApplicant.id, newStatus)
                  }
                  onUpdateSupervisor={(supervisor) => 
                    handleUpdateSupervisor(selectedApplicant.id, supervisor)
                  }
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-20 text-center text-slate-400">
                <Loader2 size={48} className="mb-4 animate-spin text-primary/20" />
                <h3 className="text-lg font-bold text-slate-900">Loading Intelligence...</h3>
              </div>
            )}
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ApplicantsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen text-slate-400">
          <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-widest">Preparing View...</h3>
        </div>
      }
    >
      <ApplicantsPageComponent />
    </Suspense>
  );
}
