"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Crown, 
  Mail,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  ChevronDown
} from "lucide-react";
import { verifyCompany, revokeCompanyVerification } from "@/lib/actions/company-verification.actions";
import { cn } from "@/lib/utils";

interface Company {
  id: string;
  company_name: string;
  industry?: string;
  logo_url?: string;
  is_verified?: boolean;
  is_super_admin?: boolean;
  created_at: string;
  email: string;
}

interface CompanyManagementClientProps {
  companies: Company[];
}

export default function CompanyManagementClient({ companies: initialCompanies }: CompanyManagementClientProps) {
  const [companies, setCompanies] = useState(initialCompanies);
  const [filter, setFilter] = useState<"all" | "pending" | "verified">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const filteredCompanies = companies.filter((company) => {
    // Apply status filter
    if (filter === "pending" && company.is_verified) return false;
    if (filter === "verified" && !company.is_verified) return false;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        company.company_name.toLowerCase().includes(query) ||
        company.email.toLowerCase().includes(query) ||
        company.industry?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const handleVerify = async (companyId: string) => {
    setLoading(companyId);
    const result = await verifyCompany(companyId);
    if (result.success) {
      setCompanies(prev => prev.map(c => 
        c.id === companyId ? { ...c, is_verified: true } : c
      ));
    }
    setLoading(null);
  };

  const handleRevoke = async (companyId: string) => {
    if (!confirm("Are you sure you want to revoke verification for this company?")) return;
    
    setLoading(companyId);
    const result = await revokeCompanyVerification(companyId);
    if (result.success) {
      setCompanies(prev => prev.map(c => 
        c.id === companyId ? { ...c, is_verified: false } : c
      ));
    }
    setLoading(null);
  };

  const stats = {
    total: companies.length,
    verified: companies.filter(c => c.is_verified).length,
    pending: companies.filter(c => !c.is_verified).length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manage Companies</h1>
          <p className="text-sm text-slate-500 mt-1">Review and verify company accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={16} className="text-slate-500" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <Building2 size={18} className="text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-500 font-medium">Total Companies</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-600">{stats.verified}</p>
              <p className="text-xs text-slate-500 font-medium">Verified</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-amber-600">{stats.pending}</p>
              <p className="text-xs text-slate-500 font-medium">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "verified"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                filter === f
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Companies List */}
      <div className="space-y-4">
        {filteredCompanies.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
            <Building2 size={40} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No companies found</p>
          </div>
        ) : (
          filteredCompanies.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Logo */}
                <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {company.logo_url ? (
                    <Image
                      src={company.logo_url}
                      alt={company.company_name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 size={24} className="text-slate-400" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 truncate">{company.company_name}</h3>
                    {company.is_super_admin && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-black uppercase">
                        <Crown size={10} />
                        Super Admin
                      </span>
                    )}
                    {company.is_verified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase">
                        <CheckCircle2 size={10} />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-black uppercase">
                        <Clock size={10} />
                        Pending
                      </span>
                    )}
                  </div>
                  {company.industry && (
                    <p className="text-sm text-slate-500 mt-0.5">{company.industry}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Mail size={12} />
                      {company.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(company.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!company.is_super_admin && (
                    company.is_verified ? (
                      <button
                        onClick={() => handleRevoke(company.id)}
                        disabled={loading === company.id}
                        className="px-4 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        {loading === company.id ? "..." : "Revoke"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleVerify(company.id)}
                        disabled={loading === company.id}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                      >
                        {loading === company.id ? "..." : "Verify"}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
