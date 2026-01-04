"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, AlertTriangle, Filter, Search, DownloadCloud, Plus } from "lucide-react";

import { Applicant, ApplicantStatus } from "@/lib/types/applicants";
import { ApplicantsTable } from "@/components/sections/admin/applicants/ApplicantsTable";
import { ApplicantDetail } from "@/components/sections/admin/applicants/ApplicantDetail";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function ApplicantsPageComponent() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedIdFromUrl = searchParams.get("selected");

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log("Fetching applicants...");
        const response = await fetch("/api/companies/applications");
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Error ${response.status}`);
        }
        const data: Applicant[] = await response.json();
        console.log("Applicants fetched:", data.length);
        setApplicants(data);

        // Handle URL selection
        if (selectedIdFromUrl) {
           const exists = data.some(app => app.id === selectedIdFromUrl);
           if (exists) {
              setSelectedApplicantId(selectedIdFromUrl);
              setIsSheetOpen(true);
           }
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        const errorMessage = err.message || "Could not connect to the server.";
        setError(errorMessage);
        toast.error("Failed to load applicants", { description: errorMessage });
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplicants();
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

  const filteredApplicants = applicants.filter(app => 
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
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-rose-50/50 border border-rose-100 p-12 rounded-[2.5rem] m-6 animate-in zoom-in-95">
        <AlertTriangle size={48} className="mb-4 text-rose-500" />
        <h3 className="text-xl font-black text-rose-900 font-heading">Sync Failure</h3>
        <p className="text-sm text-rose-600/70 mt-2 max-w-sm">{error}</p>
        <Button variant="outline" className="mt-6 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-100" onClick={() => window.location.reload()}>Retry Connection</Button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-12 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-4xl font-heading font-black text-slate-900 tracking-tight leading-none mb-3">
             Applicant <span className="text-primary italic">Tracking</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest flex items-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
             {filteredApplicants.length} Candidates in current view
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
           <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder="Find candidates..." 
                className="pl-11 h-12 rounded-2xl bg-white border-slate-100 shadow-sm focus:ring-primary focus:border-primary transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           <Button variant="outline" className="h-12 rounded-2xl border-slate-100 shadow-sm gap-2 font-bold text-slate-600">
              <Filter size={16} /> Filters
           </Button>
           <Button 
             variant="outline" 
             onClick={handleExportCSV}
             className="h-12 w-12 rounded-2xl border-slate-100 shadow-sm p-0 flex items-center justify-center text-slate-600 hover:bg-primary/5 hover:text-primary transition-colors"
             title="Export CSV"
           >
              <DownloadCloud size={18} />
           </Button>
        </div>
      </header>

      <ApplicantsTable 
        applicants={filteredApplicants}
        selectedApplicantId={selectedApplicantId}
        onSelect={handleSelectApplicant}
        onDelete={handleDeleteApplicant}
        onUpdatePayment={handleUpdatePayment}
      />

      {/* Focus Modal for Candidate Review */}
      <Dialog open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-y-auto max-h-[90vh] custom-scrollbar border-none shadow-3xl bg-slate-50/95 backdrop-blur-xl rounded-[2.5rem]">
           <div className="p-8 lg:p-12">
            {selectedApplicant ? (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <ApplicantDetail
                  applicant={selectedApplicant}
                  onUpdateStatus={(newStatus) =>
                    handleUpdateStatus(selectedApplicant.id, newStatus)
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
