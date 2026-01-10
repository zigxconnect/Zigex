import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ProgramContentForm } from "@/components/sections/admin/programs/ProgramContentForm";
import { Card } from "@/components/ui/card";
import { BookOpen, AlertCircle } from "lucide-react";

export default async function ProgramContentPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get company profile
  const { data: company } = await supabase
    .from("company_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!company) {
    return (
      <div className="p-8 text-center text-red-500">
        You must be a company admin to access this page.
      </div>
    );
  }

  // Get programs for this company - UPDATED QUERY
  const { data: programs, error } = await supabase
    .from("programs")
    .select("id, title, is_paid, price_xaf")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching programs:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header matching DashboardHeader style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <BookOpen size={14} className="text-primary" />
             <span className="text-[10px] font-bold text-primary uppercase tracking-wider">LMS Management</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-heading font-bold text-slate-900 tracking-tight">
            Program <span className="text-primary">Content</span>
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-md font-medium">
             Create and manage curriculum content, assignments, and resources for your enrolled students.
          </p>
        </div>
        <ProgramContentForm programs={programs || []} />
      </div>

      {!programs || programs.length === 0 ? (
        <Card className="p-12 text-center bg-slate-50 border-dashed border-2 border-slate-200 rounded-3xl">
          <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
            <BookOpen size={32} />
          </div>
          <h3 className="font-bold text-slate-900 text-lg mb-2">No Programs Found</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            You haven't created any programs yet. Go to "Postings" to create your first program before adding content.
          </p>
        </Card>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          <Card className="p-6 border-l-4 border-l-primary shadow-sm bg-gradient-to-r from-blue-50/50 to-transparent">
             <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm ring-1 ring-slate-100">
                   <AlertCircle className="text-primary" size={24} />
                </div>
                <div>
                   <h3 className="font-bold text-slate-900">Content Management Guide</h3>
                   <p className="text-sm text-slate-600 mt-1 leading-relaxed max-w-3xl font-medium">
                      Content is organized by weeks. Published content is immediately visible to accepted students.
                      <span className="block mt-1 text-slate-500">
                        • <strong>Paid students</strong> get full access to all resources.
                        • <strong>Unpaid students</strong> see blurred content previews.
                      </span>
                   </p>
                </div>
             </div>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {programs.map(program => (
                <Link key={program.id} href={`/admin/programs/content/${program.id}`}>
                  <Card className="group p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border-slate-100 hover:border-primary/20 rounded-2xl cursor-pointer bg-white relative overflow-hidden h-full">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all -mr-8 -mt-8" />
                     
                     <div className="relative">
                       <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-4 text-slate-500 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                          <BookOpen size={20} />
                       </div>
                       <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors mb-2 text-lg">{program.title}</h3>
                       <p className="text-sm text-slate-500 mb-6 font-medium">Manage curriculum and updates for this program.</p>
                       
                       <div className="flex items-center text-xs font-bold text-slate-400 group-hover:text-primary transition-colors">
                          View Content <BookOpen size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1" />
                       </div>
                     </div>
                  </Card>
                </Link>
             ))}
          </div>
        </div>
      )}
    </div>
  );
}
