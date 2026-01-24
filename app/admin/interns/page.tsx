"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Loader2, AlertTriangle, Search, DownloadCloud,
  GraduationCap, Briefcase, MapPin, Calendar, Clock,
  Target, User, Mail, Phone, ChevronRight, Eye,
  CheckCircle2, XCircle, MoreHorizontal, Filter,
  Building2, Star, TrendingUp, Sparkles, Users, UserCheck
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import Image from "next/image";

import { Applicant, ApplicantStatus, PaymentRecord } from "@/lib/types/applicants";
import { ApplicantDetail } from "@/components/sections/admin/applicants/ApplicantDetail";
import { ApplicantsTable } from "@/components/sections/admin/applicants/ApplicantsTable";
import { InternLedgerTable } from "@/components/sections/admin/applicants/InternLedgerTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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

// Stat card component
const StatCard = ({ 
  label, 
  value, 
  sublabel, 
  icon: Icon, 
  variant = "default",
  className = ""
}: { 
  label: string;
  value: number;
  sublabel: string;
  icon: any;
  variant?: "default" | "warning" | "info" | "success";
  className?: string;
}) => {
  const variants = {
    default: {
      bg: "bg-white",
      border: "border-blue-50",
      iconBg: "bg-blue-50/50",
      iconColor: "text-blue-400",
      labelColor: "text-blue-400",
      valueColor: "text-slate-900",
      sublabelColor: "text-blue-400",
      hoverShadow: "hover:shadow-blue-200/50"
    },
    warning: {
      bg: "bg-white",
      border: "border-indigo-100",
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-500",
      labelColor: "text-indigo-500/70",
      valueColor: "text-indigo-600",
      sublabelColor: "text-indigo-500/70",
      hoverShadow: "hover:shadow-indigo-200/50"
    },
    info: {
      bg: "bg-white",
      border: "border-blue-100",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      labelColor: "text-blue-500/70",
      valueColor: "text-blue-600",
      sublabelColor: "text-blue-500/70",
      hoverShadow: "hover:shadow-blue-200/50"
    },
    success: {
      bg: "bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700",
      border: "border-transparent",
      iconBg: "bg-white/20",
      iconColor: "text-white",
      labelColor: "text-white/70",
      valueColor: "text-white",
      sublabelColor: "text-white/70",
      hoverShadow: "hover:shadow-blue-300/50"
    },
  };

  const v = variants[variant];

  return (
    <div className={cn(
      "relative overflow-hidden rounded-3xl p-6 border-2 transition-all duration-300 group",
      v.bg, v.border, v.hoverShadow,
      "hover:shadow-xl hover:-translate-y-1",
      className
    )}>
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className={cn("text-[10px] font-bold uppercase tracking-[0.2em] mb-1", v.labelColor)}>{label}</p>
          <p className={cn("text-4xl font-black tracking-tighter", v.valueColor)}>{value}</p>
          <p className={cn("text-[10px] font-bold uppercase mt-1", v.sublabelColor)}>{sublabel}</p>
        </div>
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110",
          v.iconBg
        )}>
          <Icon size={24} className={v.iconColor} />
        </div>
      </div>
      <div className={cn(
        "absolute -right-4 -bottom-4 w-24 h-24 rounded-full transition-all duration-500 group-hover:scale-110",
        variant === "success" ? "bg-white/10" : "bg-slate-50"
      )} />
    </div>
  );
};

// Info pill component
const InfoPill = ({ icon: Icon, value, variant = "default" }: { icon: any, value?: string, variant?: "default" | "primary" | "success" }) => {
  if (!value) return null;
  const variants = {
    default: "bg-slate-100 text-slate-600 border-slate-200",
    primary: "bg-blue-50 text-blue-600 border-blue-100",
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

  const fetchApplicants = useCallback(async () => {
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
  }, [selectedIdFromUrl]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const handleSelectApplicant = (id: string) => {
    setSelectedApplicantId(id);
    setIsSheetOpen(true);
    const url = new URL(window.location.href);
    url.searchParams.set("selected", id);
    window.history.replaceState({}, "", url.toString());
  };

  // Updated handler - returns a Promise and updates optimistically then confirms
  const handleUpdateStatus = useCallback(async (applicantId: string, newStatus: ApplicantStatus) => {
    const originalApplicants = [...applicants];
    
    // Optimistic update
    setApplicants(prev =>
      prev.map(app => app.id === applicantId ? { ...app, status: newStatus } : app)
    );

    try {
      const response = await fetch(`/api/companies/applications/${applicantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Update failed");
      }
      
      // Refresh the selected applicant data if sheet is open
      if (isSheetOpen && selectedApplicantId === applicantId) {
        // Update the local state with the confirmed new status
        setApplicants(prev =>
          prev.map(app => app.id === applicantId ? { ...app, status: newStatus } : app)
        );
      }
      
      if (newStatus === "rejected") {
        setIsSheetOpen(false);
        setSelectedApplicantId(null);
      }
      
      return Promise.resolve();
    } catch (err: any) {
      // Revert on error
      setApplicants(originalApplicants);
      toast.error("Failed to update status", { description: err.message });
      return Promise.reject(err);
    }
  }, [applicants, isSheetOpen, selectedApplicantId]);

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
    reviewing: applicants.filter(a => a.status === "reviewing" || a.status === "reviewed").length,
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
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto" />
            <GraduationCap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-600" />
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
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-8 p-6 md:p-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-xl shadow-blue-200">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Intern Applications</h1>
              <p className="text-sm text-slate-500">Manage and review internship candidates</p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200">
              <Button 
                variant={viewMode === "grid" ? "outline" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-xl h-10 px-4 font-medium transition-all duration-200",
                  viewMode === "grid" 
                    ? "bg-white shadow-md text-blue-600" 
                    : "text-slate-500 hover:text-slate-700"
                )}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid size={16} className="mr-2" />
                Cards
              </Button>
              <Button 
                variant={viewMode === "table" ? "outline" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-xl h-10 px-4 font-medium transition-all duration-200",
                  viewMode === "table" 
                    ? "bg-white shadow-md text-blue-600" 
                    : "text-slate-500 hover:text-slate-700"
                )}
                onClick={() => setViewMode("table")}
              >
                <TableIcon size={16} className="mr-2" />
                Table
              </Button>
              <Button 
                variant={viewMode === "ledger" ? "outline" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-xl h-10 px-4 font-medium transition-all duration-200",
                  viewMode === "ledger" 
                    ? "bg-white shadow-md text-blue-600" 
                    : "text-slate-500 hover:text-slate-700"
                )}
                onClick={() => setViewMode("ledger")}
              >
                <TrendingUp size={16} className="mr-2" />
                Ledger
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleExportCSV} 
              className="gap-2 rounded-xl h-12 border-slate-200 hover:border-blue-300 hover:bg-blue-50 font-medium"
            >
              <DownloadCloud size={16} />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          <StatCard
            label="Census"
            value={stats.total}
            sublabel="Candidates"
            icon={Users}
            variant="default"
          />
          <StatCard
            label="Awaiting"
            value={stats.pending}
            sublabel="Pending Review"
            icon={Clock}
            variant="warning"
          />
          <StatCard
            label="Active"
            value={stats.reviewing}
            sublabel="In Process"
            icon={Eye}
            variant="info"
          />
          <StatCard
            label="Success"
            value={stats.accepted}
            sublabel="Hired Interns"
            icon={UserCheck}
            variant="success"
          />
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input
              placeholder="Search by name, email, school, or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-100 text-sm"
            />
          </div>
          {domains.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 h-12 rounded-xl border-slate-200 hover:border-blue-300 min-w-[140px] justify-between">
                  <div className="flex items-center gap-2">
                    <Filter size={16} />
                    <span>{filterDomain || "All Domains"}</span>
                  </div>
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
          <div className="text-center py-20 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-lg">
              <GraduationCap size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Intern Applications</h3>
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
                      "hover:shadow-xl hover:shadow-blue-100/50 hover:border-blue-200 hover:-translate-y-1",
                      selectedApplicantId === applicant.id 
                        ? "border-blue-500 shadow-lg shadow-blue-100" 
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
                          <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-slate-100 group-hover:ring-blue-200 transition-all shadow-sm">
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
                            "w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-sm transition-all",
                            "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                          )}>
                            {applicant.name?.charAt(0).toUpperCase() ?? "?"}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {applicant.name}
                        </h3>
                        <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                          <Mail size={10} />
                          {applicant.email}
                        </p>
                      </div>
                    </div>

                    {/* Position Applied */}
                    <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <p className="text-[10px] font-bold text-blue-600/60 uppercase tracking-wider mb-1">Applied For</p>
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
                        className="gap-1 text-xs text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl border-0 shadow-2xl">
            <DialogTitle className="sr-only">Applicant Details - {selectedApplicant?.name}</DialogTitle>
            <DialogDescription className="sr-only">Detailed view and actions for the selected internship application.</DialogDescription>
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
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <InternsPageComponent />
    </Suspense>
  );
}
