"use client";

import { useState, useEffect, Suspense, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2, AlertTriangle, Search, DownloadCloud,
  GraduationCap, Briefcase, MapPin, Calendar, Clock,
  Target, User, Mail, Phone, ChevronRight, Eye,
  CheckCircle2, XCircle, MoreHorizontal, Filter,
  Building2, Star, TrendingUp, Sparkles, Users, UserCheck, Award,
  ChevronDown, Landmark, PieChart as ChartPieIcon
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import Image from "next/image";

import { Applicant, ApplicantStatus, PaymentRecord } from "@/lib/types/applicants";
import { ApplicantDetail } from "@/components/sections/admin/applicants/ApplicantDetail";
import { ApplicantsTable } from "@/components/sections/admin/applicants/ApplicantsTable";
import { InternLedgerTable } from "@/components/sections/admin/applicants/InternLedgerTable";
import { InternManagementTable } from "@/components/sections/admin/applicants/InternManagementTable";
import { InternRecordsTable } from "@/components/sections/admin/applicants/InternRecordsTable";
import { InternsAnalytics } from "@/components/sections/admin/applicants/InternsAnalytics";

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
  className = "",
  loading = false
}: {
  label: string;
  value: number;
  sublabel: string;
  icon: any;
  variant?: "default" | "warning" | "info" | "success";
  className?: string;
  loading?: boolean;
}) => {
  const variants = {
    default: {
      bg: "bg-white",
      border: "border-slate-100",
      iconBg: "bg-blue-50",
      iconColor: "text-[#155DFC]",
      labelColor: "text-slate-400",
      valueColor: "text-slate-900",
      sublabelColor: "text-slate-400",
      hoverShadow: "hover:shadow-xl hover:shadow-[#155DFC]/5 hover:border-[#155DFC]/30"
    },
    warning: {
      bg: "bg-white",
      border: "border-amber-100/50",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
      labelColor: "text-amber-500/70",
      valueColor: "text-slate-900",
      sublabelColor: "text-amber-400/70",
      hoverShadow: "hover:shadow-amber-200/40"
    },
    info: {
      bg: "bg-white",
      border: "border-blue-50",
      iconBg: "bg-blue-50/50",
      iconColor: "text-[#155DFC]",
      labelColor: "text-blue-400",
      valueColor: "text-slate-900",
      sublabelColor: "text-blue-300",
      hoverShadow: "hover:shadow-blue-200/40 hover:border-[#155DFC]/20"
    },
    success: {
      bg: "bg-[#155DFC]",
      border: "border-transparent",
      iconBg: "bg-white/20",
      iconColor: "text-white",
      labelColor: "text-white/70",
      valueColor: "text-white",
      sublabelColor: "text-white/70",
      hoverShadow: "hover:shadow-blue-300/40"
    },
  };

  const v = variants[variant];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl p-7 border transition-all duration-500 group",
        v.bg, v.border, v.hoverShadow,
        className
      )}
    >
      <div className="relative z-10 flex items-center justify-between">
        <div className="space-y-1">
          <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", v.labelColor)}>{label}</p>
          {loading ? (
            <div className="h-10 w-16 bg-slate-100 animate-pulse rounded-xl mt-1" />
          ) : (
            <p className={cn("text-4xl font-black tracking-tighter leading-none transition-transform duration-300 group-hover:scale-105 origin-left", v.valueColor)}>
              {value}
            </p>
          )}
          <p className={cn("text-[10px] font-bold uppercase tracking-wider opacity-80", v.sublabelColor)}>{sublabel}</p>
        </div>
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6 group-hover:scale-110",
          v.iconBg
        )}>
          <Icon size={24} className={v.iconColor} />
        </div>
      </div>

      {/* Abstract Design Elements */}
      <div className={cn(
        "absolute -right-6 -bottom-6 w-32 h-32 rounded-full transition-all duration-700 group-hover:scale-150 opacity-[0.03] group-hover:opacity-[0.05]",
        variant === "success" ? "bg-white" : "bg-blue-600"
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
    success: "bg-blue-50 text-blue-700 border-blue-200"
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
  const [filterSchool, setFilterSchool] = useState<string | null>(null);
  const [filterCohort, setFilterCohort] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [cohortDetails, setCohortDetails] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "table" | "ledger" | "management" | "records" | "analytics">("table");
  const [companyId, setCompanyId] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedIdFromUrl = searchParams.get("selected");

  // Use a ref to store the latest applicants for use in stable callbacks without adding to deps
  const applicantsRef = useRef<Applicant[]>(applicants);
  useEffect(() => {
    applicantsRef.current = applicants;
  }, [applicants]);

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
      // Filter internship and program applications
      const targetApps = data.filter(app =>
        app.applicationType === "internship" || app.applicationType === "program" ||
        (app.internshipId && app.applicationType !== "event")
      );
      console.log("[INTERNS] Total apps:", data.length, "Intern/Program apps:", targetApps.length);
      setApplicants(targetApps);

      // Fetch cohorts (internships + programs)
      try {
        const [internshipsResp, programsResp] = await Promise.all([
          fetch("/api/companies/internships"),
          fetch("/api/companies/programs")
        ]);
        const internships = internshipsResp.ok ? await internshipsResp.json() : [];
        const programs = programsResp.ok ? await programsResp.json() : [];
        
        const combinedCohorts = [
          ...(Array.isArray(internships) ? internships : []).map((i: any) => ({ ...i, type: 'Internship' })),
          ...(Array.isArray(programs) ? programs : []).map((p: any) => ({ ...p, type: 'Program' }))
        ];
        setCohortDetails(combinedCohorts);
      } catch (err) {
        console.error("Failed to fetch cohort details", err);
      }

      // Fetch company profile to get ID
      const companyResp = await fetch("/api/companies/profiles");
      if (companyResp.ok) {
        const companyData = await companyResp.json();
        setCompanyId(companyData.id);
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Could not connect to the server.");
      toast.error("Failed to load interns", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  // Handle initial selection from URL separately
  useEffect(() => {
    if (selectedIdFromUrl && !isLoading && applicants.length > 0) {
      const exists = applicants.some(app => app.id === selectedIdFromUrl);
      if (exists && !selectedApplicantId) {
        setSelectedApplicantId(selectedIdFromUrl);
        setIsSheetOpen(true);
      }
    }
  }, [selectedIdFromUrl, isLoading, applicants.length, selectedApplicantId]);

  const handleSelectApplicant = (id: string) => {
    setSelectedApplicantId(id);
    setIsSheetOpen(true);
    const url = new URL(window.location.href);
    url.searchParams.set("selected", id);
    window.history.replaceState({}, "", url.toString());
  };

  // Updated handler - Stable reference using functional state updates
  const handleUpdateStatus = useCallback(async (applicantId: string, newStatus: ApplicantStatus) => {
    const previousApplicants = applicantsRef.current;
    console.log(`[STATUS_UPDATE] Initiating: ${applicantId} -> ${newStatus}`);

    // 1. Optimistic update
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
        if (response.status === 401) toast.error("Session Expired", { description: "Please login again." });
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const updatedData = await response.json();
      console.log(`[STATUS_UPDATE] Success:`, updatedData);

      // 2. Confirm state
      setApplicants(prev =>
        prev.map(app => {
          if (app.id !== applicantId) return app;
          return {
            ...app,
            status: updatedData?.status || newStatus
          };
        })
      );

      return Promise.resolve();
    } catch (err: any) {
      console.error("[STATUS_UPDATE] Failed:", err);
      // Revert state
      setApplicants(previousApplicants);
      toast.error("Update Failed", { description: err.message });
      return Promise.reject(err);
    }
  }, []); // Stable reference!

  const handleUpdatePaymentLedger = useCallback(async (appId: string, ledger: PaymentRecord[]) => {
    // Capture state for revert
    const previousApplicants = applicantsRef.current;
    console.group(`[FINANCIAL_SYNC] ${appId}`);

    // 1. Optimistic Update
    setApplicants(prev => prev.map(a => a.id === appId ? { ...a, paymentLedger: ledger } : a));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const resp = await fetch(`/api/companies/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_ledger: ledger }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        if (resp.status === 401) toast.error("Session Expired", { description: "Please refresh the page and log in again." });
        throw new Error(errorData.error || `Server Error (${resp.status})`);
      }

      const serverData = await resp.json();
      console.log("Sync Success:", serverData);

      // 2. Firmly commit the data with robust mapping
      setApplicants(prev => prev.map(a => {
        if (a.id !== appId) return a;
        // Map backend keys to frontend keys correctly
        return {
          ...a,
          paymentLedger: serverData?.payment_ledger || serverData?.paymentLedger || ledger,
          isPaid: serverData?.payment_completed ?? serverData?.is_paid_acknowledgement ?? a.isPaid
        };
      }));

    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("Sync Failed:", err);
      // Revert state on error to previousRef
      setApplicants(previousApplicants);

      const message = err.name === 'AbortError' ? "Request timed out" : (err.message || "Failed to save");
      toast.error("Process Failed", { description: message });
      throw err;
    } finally {
      console.groupEnd();
    }
  }, []); // Truly stable!

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

  // Get unique domains, schools, and cohorts for filtering
  const domains = [...new Set(applicants.map(a => a.domain).filter(Boolean))];
  const schools = [...new Set(applicants.map(a => a.school).filter(Boolean))].sort();
  const cohorts = [...new Set(applicants.map(a => a.internshipTitle).filter(Boolean))].sort();

  const filteredApplicants = applicants.filter(app => {
    const searchTerms = [
      app.name,
      app.email,
      app.internshipTitle,
      app.school,
      app.domain,
      app.studentId,
      app.userId,
      app.id
    ].filter(Boolean).map(t => String(t).toLowerCase());

    const matchesSearch = !searchQuery || searchTerms.some(term => term.includes(searchQuery.toLowerCase()));
    const matchesDomain = !filterDomain || app.domain === filterDomain;
    const matchesSchool = !filterSchool || app.school === filterSchool;
    const matchesCohort = !filterCohort || app.internshipTitle === filterCohort;
    const matchesType = !filterType || app.applicationType === filterType;

    return matchesSearch && matchesDomain && matchesSchool && matchesCohort && matchesType;
  });

  const selectedApplicant = applicants.find(app => app.id === selectedApplicantId);

  // Stats derived from filtered results for live feedback
  const stats = {
    total: filteredApplicants.length,
    pending: filteredApplicants.filter(a => a.status === "pending").length,
    accepted: filteredApplicants.filter(a => a.status === "accepted").length,
    reviewing: filteredApplicants.filter(a => a.status === "reviewing" || a.status === "reviewed").length,
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
              <Button
                variant={viewMode === "management" ? "outline" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-xl h-10 px-4 font-medium transition-all duration-200",
                  viewMode === "management"
                    ? "bg-white shadow-md text-blue-600"
                    : "text-slate-500 hover:text-slate-700"
                )}
                onClick={() => setViewMode("management")}
              >
                <CheckCircle2 size={16} className="mr-2" />
                Management
              </Button>
              <Button
                variant={viewMode === "records" ? "outline" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-xl h-10 px-4 font-medium transition-all duration-200",
                  viewMode === "records"
                    ? "bg-white shadow-md text-blue-600"
                    : "text-slate-500 hover:text-slate-700"
                )}
                onClick={() => setViewMode("records")}
              >
                <Award size={16} className="mr-2" />
                Records
              </Button>
              <Button
                variant={viewMode === "analytics" ? "outline" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-xl h-10 px-4 font-medium transition-all duration-200",
                  viewMode === "analytics"
                    ? "bg-white shadow-md text-blue-600"
                    : "text-slate-500 hover:text-slate-700"
                )}
                onClick={() => setViewMode("analytics")}
              >
                <ChartPieIcon size={16} className="mr-2" />
                Analytics
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

        {/* Stats Section with improved spacing */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard
            label="Total Census"
            value={stats.total}
            sublabel="Candidates"
            icon={Users}
            variant="default"
            loading={isLoading}
          />
          <StatCard
            label="Pending Review"
            value={stats.pending}
            sublabel="Direct Action Needed"
            icon={Clock}
            variant="warning"
            loading={isLoading}
          />
          <StatCard
            label="Under Review"
            value={stats.reviewing}
            sublabel="Active Screening"
            icon={Eye}
            variant="info"
            loading={isLoading}
          />
          <StatCard
            label="Onboarded"
            value={stats.accepted}
            sublabel="Confirmed Interns"
            icon={UserCheck}
            variant="success"
            loading={isLoading}
          />
        </div>

        {/* Command Center: Premium Filter & Search */}
        <div className="bg-white/70 backdrop-blur-xl p-4 md:p-6 rounded-3xl border border-blue-50/50 shadow-xl shadow-blue-500/5 flex flex-col gap-6">
          <div className="relative w-full group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <Search className="w-5 h-5 text-slate-400 group-focus-within:text-[#155DFC] transition-all duration-300" />
            </div>
            <Input
              placeholder="Search by name, school, email, or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 h-14 md:h-16 rounded-2xl border-slate-200 bg-white focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-900 placeholder:text-slate-400 shadow-sm w-full text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {/* Type Filter Pill */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "group relative gap-3 h-14 px-5 rounded-xl border transition-all duration-300 w-full justify-between overflow-hidden",
                    filterType
                      ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                  )}
                >
                  <div className="flex items-center gap-3 relative z-10 w-full overflow-hidden">
                    <Filter size={18} className={cn("shrink-0", filterType ? "text-blue-600" : "text-slate-400")} />
                    <div className="flex flex-col items-start leading-none ml-1 w-full overflow-hidden">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Type</span>
                      <span className="text-sm font-semibold truncate w-full text-left block">
                        {filterType ? (filterType.charAt(0).toUpperCase() + filterType.slice(1)) : "All Types"}
                      </span>
                    </div>
                  </div>
                  <ChevronDown size={16} className={cn("transition-transform duration-300 group-hover:translate-y-0.5 relative z-10 shrink-0", filterType ? "text-blue-600" : "text-slate-400")} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[280px] rounded-2xl p-2 border-slate-200 shadow-xl bg-white z-[100]">
                <DropdownMenuItem
                  onClick={() => setFilterType(null)}
                  className="rounded-xl py-3 px-4 font-semibold text-sm cursor-pointer hover:bg-slate-50 text-slate-700"
                >
                  All Types
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-slate-100" />
                <DropdownMenuItem
                  onClick={() => setFilterType("internship")}
                  className={cn(
                    "rounded-xl py-3 px-4 font-medium text-sm cursor-pointer transition-all",
                    filterType === "internship"
                      ? "bg-blue-50 text-blue-700"
                      : "hover:bg-slate-50 text-slate-700"
                  )}
                >
                  Internships
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFilterType("program")}
                  className={cn(
                    "rounded-xl py-3 px-4 font-medium text-sm cursor-pointer transition-all",
                    filterType === "program"
                      ? "bg-blue-50 text-blue-700"
                      : "hover:bg-slate-50 text-slate-700"
                  )}
                >
                  Programs
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cohort / Program Filter Pill */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "group relative gap-3 h-14 px-5 rounded-xl border transition-all duration-300 w-full justify-between overflow-hidden",
                    filterCohort
                      ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                  )}
                >
                  <div className="flex items-center gap-3 relative z-10 w-full overflow-hidden">
                    <Target size={18} className={cn("shrink-0", filterCohort ? "text-blue-600" : "text-slate-400")} />
                    <div className="flex flex-col items-start leading-none ml-1 w-full overflow-hidden">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Cohort</span>
                      <span className="text-sm font-semibold truncate w-full text-left block">
                        {filterCohort || "All Cohorts"}
                      </span>
                    </div>
                  </div>
                  <ChevronDown size={16} className={cn("transition-transform duration-300 group-hover:translate-y-0.5 relative z-10 shrink-0", filterCohort ? "text-blue-600" : "text-slate-400")} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[320px] rounded-2xl p-2 border-slate-200 shadow-xl bg-white z-[100]">
                <DropdownMenuItem
                  onClick={() => setFilterCohort(null)}
                  className="rounded-xl py-3 px-4 font-semibold text-sm cursor-pointer hover:bg-slate-50 text-slate-700"
                >
                  All Cohorts
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-slate-100" />
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col gap-1 p-1">
                  {cohorts.map(cohort => (
                    <DropdownMenuItem
                      key={cohort}
                      onClick={() => setFilterCohort(cohort!)}
                      className={cn(
                        "rounded-xl py-3 px-4 font-medium text-sm cursor-pointer transition-all",
                        filterCohort === cohort 
                          ? "bg-blue-50 text-blue-700" 
                          : "hover:bg-slate-50 text-slate-700"
                      )}
                    >
                      <div className="truncate w-full">{cohort}</div>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* School Filter Pill */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "group relative gap-3 h-14 px-5 rounded-xl border transition-all duration-300 w-full justify-between overflow-hidden",
                    filterSchool
                      ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                  )}
                >
                  <div className="flex items-center gap-3 relative z-10 w-full overflow-hidden">
                    <Building2 size={18} className={cn("shrink-0", filterSchool ? "text-blue-600" : "text-slate-400")} />
                    <div className="flex flex-col items-start leading-none ml-1 w-full overflow-hidden">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Institute</span>
                      <span className="text-sm font-semibold truncate w-full text-left block">
                        {filterSchool || "All Institutes"}
                      </span>
                    </div>
                  </div>
                  <ChevronDown size={16} className={cn("transition-transform duration-300 group-hover:translate-y-0.5 relative z-10 shrink-0", filterSchool ? "text-blue-600" : "text-slate-400")} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[320px] rounded-2xl p-2 border-slate-200 shadow-xl bg-white z-[100]">
                <DropdownMenuItem
                  onClick={() => setFilterSchool(null)}
                  className="rounded-xl py-3 px-4 font-semibold text-sm cursor-pointer hover:bg-slate-50 text-slate-700"
                >
                  All Institutes
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-slate-100" />
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col gap-1 p-1">
                  {schools.map(school => (
                    <DropdownMenuItem
                      key={school}
                      onClick={() => setFilterSchool(school!)}
                      className={cn(
                        "rounded-xl py-3 px-4 font-medium text-sm cursor-pointer transition-all",
                        filterSchool === school 
                          ? "bg-blue-50 text-blue-700" 
                          : "hover:bg-slate-50 text-slate-700"
                      )}
                    >
                      <div className="truncate w-full">{school}</div>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Expertise Filter Pill */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "group relative gap-3 h-14 px-5 rounded-xl border transition-all duration-300 w-full justify-between overflow-hidden",
                    filterDomain
                      ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                  )}
                >
                  <div className="flex items-center gap-3 relative z-10 w-full overflow-hidden">
                    <Briefcase size={18} className={cn("shrink-0", filterDomain ? "text-blue-600" : "text-slate-400")} />
                    <div className="flex flex-col items-start leading-none ml-1 w-full overflow-hidden">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Domain</span>
                      <span className="text-sm font-semibold truncate w-full text-left block">
                        {filterDomain || "All Domains"}
                      </span>
                    </div>
                  </div>
                  <ChevronDown size={16} className={cn("transition-transform duration-300 group-hover:translate-y-0.5 relative z-10 shrink-0", filterDomain ? "text-blue-600" : "text-slate-400")} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[320px] rounded-2xl p-2 border-slate-200 shadow-xl bg-white z-[100]">
                <DropdownMenuItem
                  onClick={() => setFilterDomain(null)}
                  className="rounded-xl py-3 px-4 font-semibold text-sm cursor-pointer hover:bg-slate-50 text-slate-700"
                >
                  All Domains
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-slate-100" />
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col gap-1 p-1">
                  {domains.map(domain => (
                    <DropdownMenuItem
                      key={domain}
                      onClick={() => setFilterDomain(domain!)}
                      className={cn(
                        "rounded-xl py-3 px-4 font-medium text-sm cursor-pointer transition-all",
                        filterDomain === domain 
                          ? "bg-blue-50 text-blue-700" 
                          : "hover:bg-slate-50 text-slate-700"
                      )}
                    >
                      <div className="truncate w-full">{domain}</div>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Dynamic Cohort Info Card */}
        {filterCohort && (() => {
          const cohort = cohortDetails.find(c => c.title === filterCohort);
          if (cohort) {
            return (
              <div className="bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border-2 border-indigo-50/50 shadow-2xl shadow-indigo-500/5 ring-4 ring-indigo-50/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <GraduationCap size={160} />
                </div>
                <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
                  {cohort.program_picture_url || cohort.cover_image_url ? (
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] overflow-hidden shrink-0 ring-4 ring-white shadow-xl bg-slate-100">
                      <img src={cohort.program_picture_url || cohort.cover_image_url} alt={cohort.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] shrink-0 ring-4 ring-white shadow-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                      <GraduationCap className="w-12 h-12 text-white/90" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-4 py-1.5 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
                        {cohort.type}
                      </span>
                      {cohort.is_paid && (
                        <span className="px-4 py-1.5 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-sm">
                          <Landmark size={12} /> Paid Opportunity
                        </span>
                      )}
                      {cohort.status === 'active' && (
                        <span className="px-4 py-1.5 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
                          Currently Active
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-3">{cohort.title}</h2>
                    <div className="flex flex-wrap gap-5 text-sm font-bold text-slate-500 mb-5">
                      {cohort.location && (
                        <div className="flex items-center gap-2"><MapPin size={18} className="text-indigo-400"/> {cohort.location}</div>
                      )}
                      {(cohort.start_date || cohort.end_date) && (
                        <div className="flex items-center gap-2"><Calendar size={18} className="text-blue-400"/> 
                          {cohort.start_date ? format(new Date(cohort.start_date), 'MMM d, yyyy') : 'TBD'} - {cohort.end_date ? format(new Date(cohort.end_date), 'MMM d, yyyy') : 'TBD'}
                        </div>
                      )}
                      {cohort.whatsapp_link && (
                        <a href={cohort.whatsapp_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:underline bg-green-50 px-3 py-1 rounded-xl transition-colors">
                          <Sparkles size={16} /> Community Link
                        </a>
                      )}
                    </div>
                    {cohort.required_skills && cohort.required_skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {cohort.required_skills.slice(0, 6).map((skill: string, i: number) => (
                          <span key={i} className="px-3 py-1.5 bg-slate-100/80 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-xl border border-slate-200">
                            {skill}
                          </span>
                        ))}
                        {cohort.required_skills.length > 6 && (
                          <span className="px-3 py-1.5 bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider rounded-xl border border-slate-100">
                            +{cohort.required_skills.length - 6} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })()}

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
                      <InfoPill icon={Target} value={applicant.domain} />
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
              <InternsAnalytics applicants={applicants} />
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
                companyId={companyId || ""}
                onUpdateStatus={(newStatus) => handleUpdateStatus(selectedApplicant.id, newStatus)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider >
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
