import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  Clock, 
  Building2, 
  Mail, 
  ArrowLeft, 
  ShieldCheck, 
  RefreshCw,
  LayoutDashboard,
  Users,
  Briefcase,
  TrendingUp
} from "lucide-react";
import { getAuthenticatedCompanyProfile } from "@/lib/data/postings";
import { cn } from "@/lib/utils";

export default async function PendingVerificationPage() {
  const companyProfile = await getAuthenticatedCompanyProfile();

  // If no profile, redirect to sign in
  if (!companyProfile) {
    return redirect("/sign-in");
  }

  // If verified, redirect to dashboard
  if (companyProfile.is_verified || companyProfile.is_super_admin) {
    return redirect("/admin/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-blue-500/10 to-indigo-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-gradient-to-tr from-violet-500/10 to-transparent rounded-full blur-[120px] animation-delay-2000" />
      </div>

      <div className="relative z-10 max-w-3xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* Navigation / Actions */}
        <div className="flex items-center justify-between px-2">
          <Link 
            href="/"
            className="group flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-slate-900 transition-colors">
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            </div>
            Back to Zigex
          </Link>
          
          <Link
            href="/admin/pending-verification"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <RefreshCw size={14} className="text-primary" />
            Check Status
          </Link>
        </div>

        {/* Main Interface */}
        <div className="bg-white rounded-[3rem] border border-slate-200/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden">
          
          {/* Hero Section */}
          <div className="relative p-8 sm:p-12 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.15),_transparent_40%)]" />
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-8">
              <div className="relative group">
                <div className="absolute -inset-4 bg-white/10 rounded-[2.5rem] blur-xl group-hover:bg-white/20 transition-all duration-500" />
                <div className="relative w-24 h-24 rounded-[2rem] bg-white flex items-center justify-center p-1 shadow-2xl overflow-hidden ring-4 ring-white/10">
                  {companyProfile.logo_url ? (
                    <Image 
                      src={companyProfile.logo_url} 
                      alt={companyProfile.company_name}
                      fill
                      className="object-cover p-2"
                    />
                  ) : (
                    <Building2 size={40} className="text-slate-900" />
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Application Status: Pending</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  {companyProfile.company_name}
                </h1>
                <p className="text-slate-400 font-medium max-w-md">
                  Setting up your organization on the world&apos;s leading internship platform.
                </p>
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-8 sm:p-12 lg:p-16 grid lg:grid-cols-5 gap-12 items-center">
            
            <div className="lg:col-span-3 space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-slate-900">Establishing Excellence</h2>
                <p className="text-slate-500 leading-relaxed text-lg">
                  We&apos;re currently verifying your company details to maintain the integrity and quality of the Zigex ecosystem. 
                  This rigorous process ensures a safe and productive environment for both employers and students.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Briefcase, label: "Post Vacancies", color: "bg-blue-50 text-blue-600" },
                  { icon: Users, label: "Manage Talent", color: "bg-indigo-50 text-indigo-600" },
                  { icon: LayoutDashboard, label: "Advanced Insights", color: "bg-violet-50 text-violet-600" },
                  { icon: TrendingUp, label: "Market Analytics", color: "bg-emerald-50 text-emerald-600" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", item.color)}>
                      <item.icon size={20} />
                    </div>
                    <span className="font-bold text-slate-900 text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="p-8 rounded-[2rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Clock size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">24-48 Hours</h3>
                    <p className="text-indigo-100 text-sm font-medium leading-relaxed">
                      Average verification time for new organizations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-[2rem] border border-slate-200 bg-white hover:border-slate-900 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Mail size={18} className="text-slate-600" />
                  </div>
                  <h3 className="font-black text-slate-900 tracking-tight">Support center</h3>
                </div>
                <p className="text-sm text-slate-500 mb-6 font-medium">
                  Need to expedite your verification or have questions?
                </p>
                <a 
                  href="mailto:partnerships@zigex.io"
                  className="inline-flex items-center justify-center w-full py-4 px-6 rounded-2xl bg-slate-900 text-white font-black text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Bar */}
        <div className="flex items-center justify-between px-4 text-slate-400">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Trusted by over 500+ Institutions</p>
          <div className="flex gap-4 opacity-30 grayscale contrast-125">
             <div className="w-16 h-4 bg-slate-400 rounded" />
             <div className="w-20 h-4 bg-slate-400 rounded" />
             <div className="w-14 h-4 bg-slate-400 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
