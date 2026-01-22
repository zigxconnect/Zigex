"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Loader2, AlertTriangle, Search, DownloadCloud,
  GraduationCap, Briefcase, MapPin, Calendar, Clock,
  Target, User, Mail, Phone, ChevronRight, Eye,
  CheckCircle2, XCircle, MoreHorizontal, Filter,
  Building2, Star, TrendingUp, Sparkles
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import Image from "next/image";

import { Applicant, ApplicantStatus, PaymentRecord } from "@/lib/types/applicants";
import { ApplicantDetail } from "@/components/sections/admin/applicants/ApplicantDetail";
import { ApplicantsTable } from "@/components/sections/admin/applicants/ApplicantsTable";
import { InternLedgerTable } from "@/components/sections/admin/applicants/InternLedgerTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LayoutGrid, List, Table as TableIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Info pill component
const InfoPill = ({ icon: Icon, value, variant = "default" }: { icon: any, value?: string, variant?: "default" | "primary" | "success" }) => {
  if (!value) return null;
  const variants = {
    default: "bg-slate-100 text-slate-600 border-slate-200",
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200"
  };
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border",
      variants[variant]
    )}>
      <Icon size={12} />
      {value}
    </span>
  );
};

function InternsPageComponent() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDomain, setFilterDomain] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table" | "ledger">("table");

  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedIdFromUrl = searchParams.get("selected");

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/api/companies/applications");
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Error ${response.status}`);
        }
        const data: Applicant[] = await response.json();
        // Filter internship applications - includes those with type "internship" OR those with an internshipId
        const internshipApps = data.filter(app => 
          app.applicationType === "internship" || 
          (app.internshipId && app.applicationType !== "program" && app.applicationType !== "event")
        );
        console.log("[INTERNS] Total apps:", data.length, "Internship apps:", internshipApps.length);
        setApplicants(internshipApps);


        if (selectedIdFromUrl) {
          const exists = internshipApps.some(app => app.id === selectedIdFromUrl);
          if (exists) {
            setSelectedApplicantId(selectedIdFromUrl);
            setIsSheetOpen(true);
          }
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "Could not connect to the server.");
        toast.error("Failed to load interns", { description: err.message });
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplicants();
  }, [selectedIdFromUrl]);

  const handleSelectApplicant = (id: string) => {
    setSelectedApplicantId(id);
    setIsSheetOpen(true);
    const url = new URL(window.location.href);
    url.searchParams.set("selected", id);
    window.history.replaceState({}, "", url.toString());
  };

  const handleUpdateStatus = async (applicantId: string, newStatus: ApplicantStatus) => {
    const originalApplicants = [...applicants];
    if (newStatus === "rejected") {
      setApplicants(prev => prev.filter(app => app.id !== applicantId));
    } else {
      setApplicants(prev =>
        prev.map(app => app.id === applicantId ? { ...app, status: newStatus } : app)
      );
    }

    try {
      const response = await fetch(`/api/companies/applications/${applicantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Update failed");
      toast.success(`Intern ${newStatus === "accepted" ? "accepted" : newStatus === "rejected" ? "rejected" : "updated"}!`);
      
      if (newStatus === "rejected") {
        setIsSheetOpen(false);
        setSelectedApplicantId(null);
      }
    } catch (err: any) {
      setApplicants(originalApplicants);
      toast.error("Update failed", { description: err.message });
    }
  };

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

  const handleUpdatePaymentLegacy = async (id: string, isPaid: boolean) => {
    try {
      const response = await fetch(`/api/companies/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_completed: isPaid }),
      });
      if (!response.ok) throw new Error("Update failed");
      setApplicants(prev => prev.map(a => a.id === id ? { ...a, isPaid } : a));
    } catch (err) {
      toast.error("Failed to update payment status");
    }
  };

  const handleDeleteApplicant = async (id: string) => {
    const originalApplicants = [...applicants];
    setApplicants(prev => prev.filter(app => app.id !== id));

    try {
      const response = await fetch(`/api/companies/applications/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");
      toast.success("Application deleted");
      if (selectedApplicantId === id) {
        setIsSheetOpen(false);
        setSelectedApplicantId(null);
      }
    } catch (err: any) {
      setApplicants(originalApplicants);
      toast.error("Delete failed", { description: err.message });
    }
  };

  // Get unique domains for filtering
  const domains = [...new Set(applicants.map(a => a.domain).filter(Boolean))];

  const filteredApplicants = applicants.filter(app => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.internshipTitle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.school || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDomain = !filterDomain || app.domain === filterDomain;
    
    return matchesSearch && matchesDomain;
  });

  const selectedApplicant = applicants.find(app => app.id === selectedApplicantId);

  // Stats
  const stats = {
    total: applicants.length,
    pending: applicants.filter(a => a.status === "pending").length,
    accepted: applicants.filter(a => a.status === "accepted").length,
    reviewing: applicants.filter(a => a.status === "reviewing").length,
  };

  const handleExportCSV = () => {
    if (filteredApplicants.length === 0) {
      toast.error("No interns to export");
      return;
    }

    const headers = ["Name", "Email", "Phone", "School", "Level", "Domain", "Duration", "Status", "Applied Date"];
    const csvRows = [headers.join(",")];

    filteredApplicants.forEach(app => {
      const row = [
        `"${app.name}"`,
        app.email,
        app.phone || "",
        app.school || "",
        app.schoolLevel || "",
        app.domain || "",
        app.duration || "",
        app.status,
        format(new Date(app.appliedDate), "yyyy-MM-dd")
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `interns_export_${format(new Date(), "yyyyMMdd")}.csv`;
    link.click();
    toast.success("Export complete!", { description: `${filteredApplicants.length} records exported.` });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
            <GraduationCap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
          </div>
          <p className="text-sm font-medium text-slate-500">Loading intern applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-rose-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Unable to load data</h2>
          <p className="text-sm text-slate-500">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-8 p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">Intern Applications</h1>
                <p className="text-sm text-slate-500">Manage and review internship candidates</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-100">
            <Button 
              variant={viewMode === "grid" ? "primary" : "ghost"}
              size="sm"
              className={cn("rounded-xl h-10 px-4", viewMode === "grid" ? "shadow-md" : "text-slate-500")}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid size={16} className="mr-2" /> Cards
            </Button>
            <Button 
              variant={viewMode === "table" ? "primary" : "ghost"}
              size="sm"
              className={cn("rounded-xl h-10 px-4", viewMode === "table" ? "shadow-md" : "text-slate-500")}
              onClick={() => setViewMode("table")}
            >
              <TableIcon size={16} className="mr-2" /> Table
            </Button>
            <Button 
              variant={viewMode === "ledger" ? "primary" : "ghost"}
              size="sm"
              className={cn("rounded-xl h-10 px-4", viewMode === "ledger" ? "shadow-md" : "text-slate-500")}
              onClick={() => setViewMode("ledger")}
            >
              <TrendingUp size={16} className="mr-2" /> Ledger
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleExportCSV} className="gap-2 rounded-xl h-12">
              <DownloadCloud size={16} />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-black text-slate-900">{stats.total}</p>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Total Applicants</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                <User size={20} className="text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-black text-amber-600">{stats.pending}</p>
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mt-1">Pending Review</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock size={20} className="text-amber-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-black text-blue-600">{stats.reviewing}</p>
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mt-1">Reviewing</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Eye size={20} className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 shadow-lg shadow-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-black text-white">{stats.accepted}</p>
                <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mt-1">Accepted</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <CheckCircle2 size={20} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name, email, school, or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 rounded-xl border-slate-200 focus:border-primary"
            />
          </div>
          {domains.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 h-12 rounded-xl">
                  <Filter size={16} />
                  {filterDomain || "All Domains"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuItem onClick={() => setFilterDomain(null)} className="rounded-lg">
                  All Domains
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {domains.map(domain => (
                  <DropdownMenuItem 
                    key={domain} 
                    onClick={() => setFilterDomain(domain!)}
                    className="rounded-lg"
                  >
                    {domain}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* View content */}
        {filteredApplicants.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
              <GraduationCap size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-700 mb-2">No Intern Applications</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              {searchQuery || filterDomain 
                ? "No applications match your current filters. Try adjusting your search."
                : "When students apply for your internships, they'll appear here."}
            </p>
          </div>
        ) : (
          <>
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredApplicants.map((applicant, index) => (
                  <div
                    key={applicant.id}
                    onClick={() => handleSelectApplicant(applicant.id)}
                    className={cn(
                      "group relative bg-white rounded-3xl border-2 p-5 cursor-pointer transition-all duration-300",
                      "hover:shadow-xl hover:shadow-slate-200/50 hover:border-primary/30 hover:-translate-y-1",
                      selectedApplicantId === applicant.id 
                        ? "border-primary shadow-lg shadow-primary/10" 
                        : "border-slate-100"
                    )}
                  >
                    {/* Status indicator */}
                    <div className="absolute top-4 right-4">
                      <StatusBadge status={applicant.status} />
                    </div>

                    {/* Avatar & Name */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        {applicant.avatarUrl && applicant.avatarUrl !== "/default-avatar.svg" ? (
                          <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-slate-100 group-hover:ring-primary/30 transition-all shadow-sm">
                            <Image 
                              src={applicant.avatarUrl} 
                              alt={applicant.name} 
                              width={56} 
                              height={56}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm transition-all",
                            index % 4 === 0 ? "bg-gradient-to-br from-violet-400 to-violet-600 text-white" :
                            index % 4 === 1 ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white" :
                            index % 4 === 2 ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white" :
                            "bg-gradient-to-br from-amber-400 to-amber-600 text-white"
                          )}>
                            {applicant.name?.charAt(0).toUpperCase() ?? "?"}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 truncate group-hover:text-primary transition-colors">
                          {applicant.name}
                        </h3>
                        <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                          <Mail size={10} />
                          {applicant.email}
                        </p>
                      </div>
                    </div>

                    {/* Position Applied */}
                    <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Applied For</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {applicant.internshipTitle || "General Internship"}
                      </p>
                    </div>

                    {/* Quick Info Pills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <InfoPill icon={GraduationCap} value={applicant.school} />
                      <InfoPill icon={Target} value={applicant.domain} variant="primary" />
                      <InfoPill icon={Clock} value={applicant.duration} />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-400">
                        {formatDistanceToNow(new Date(applicant.appliedDate), { addSuffix: true })}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-1 text-xs text-primary hover:bg-primary/10 rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectApplicant(applicant.id);
                        }}
                      >
                        View Profile
                        <ChevronRight size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === "table" && (
              <ApplicantsTable 
                applicants={filteredApplicants}
                selectedApplicantId={selectedApplicantId}
                onSelect={handleSelectApplicant}
                onDelete={handleDeleteApplicant}
                onUpdatePayment={handleUpdatePaymentLegacy}
              />
            )}

            {viewMode === "ledger" && (
              <InternLedgerTable 
                applicants={filteredApplicants}
                onDelete={handleDeleteApplicant}
                onUpdatePayment={handleUpdatePaymentLedger}
              />
            )}
          </>
        )}

        {/* Detail Dialog */}
        <Dialog open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl">
            {selectedApplicant && (
              <ApplicantDetail
                applicant={selectedApplicant}
                onUpdateStatus={(newStatus) => handleUpdateStatus(selectedApplicant.id, newStatus)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

export default function InternsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <InternsPageComponent />
    </Suspense>
  );
}
