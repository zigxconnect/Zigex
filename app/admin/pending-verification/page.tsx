import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Clock, Building2, Mail, ArrowLeft, ShieldCheck } from "lucide-react";
import { getAuthenticatedCompanyProfile } from "@/lib/data/postings";

export default async function PendingVerificationPage() {
  const companyProfile = await getAuthenticatedCompanyProfile();

  // If no profile, redirect to sign in
  if (!companyProfile) {
    return redirect("/sign-in");
  }

  // If verified, redirect to dashboard
  if (companyProfile.is_verified) {
    return redirect("/admin/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-200/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-200/30 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        {/* Back to home link */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 group transition-colors"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Main card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/50 shadow-2xl shadow-slate-200/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
            
            <div className="relative z-10 flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-xl overflow-hidden">
                {companyProfile.logo_url ? (
                  <Image 
                    src={companyProfile.logo_url} 
                    alt={companyProfile.company_name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 size={32} className="text-white" />
                )}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 mb-1">
                  Welcome to Zigex
                </p>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {companyProfile.company_name}
                </h1>
                {companyProfile.industry && (
                  <p className="text-sm font-medium text-blue-100 mt-1">
                    {companyProfile.industry}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 sm:p-10">
            {/* Status badge */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                <Clock size={24} className="text-amber-500" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                  Verification Status
                </p>
                <p className="text-lg font-bold text-slate-900">Pending Review</p>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p className="text-lg font-medium text-slate-900">
                Thank you for registering with Zigex!
              </p>
              <p>
                Your company account is currently under review by our team. We verify all organizations 
                to ensure the highest quality experience for students and professionals on our platform.
              </p>
              <p>
                This process typically takes <span className="font-semibold text-slate-900">24-48 hours</span>. 
                Once verified, you&apos;ll have full access to:
              </p>
            </div>

            {/* Features list */}
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {[
                "Post internship opportunities",
                "Manage applicants & candidates",
                "Create events and programs",
                "Access analytics dashboard"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={12} className="text-emerald-600" />
                  </div>
                  <span className="text-slate-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 my-8" />

            {/* Contact info */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <Mail size={18} className="text-slate-400" />
                <p className="text-sm font-bold text-slate-900">Need help?</p>
              </div>
              <p className="text-sm text-slate-600">
                If you have any questions or need to expedite your verification, 
                please contact us at{" "}
                <a 
                  href="mailto:support@zigex.io" 
                  className="text-blue-600 font-semibold hover:underline"
                >
                  support@zigex.io
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400 mt-6">
          © {new Date().getFullYear()} Zigex. All rights reserved.
        </p>
      </div>
    </div>
  );
}
