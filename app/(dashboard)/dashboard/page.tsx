// app/(dashboard)/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getProfileInfo } from "@/lib/actions/profile.actions";
import { WelcomeCard } from "@/components/sections/dashboard/WelcomeCard";

export default async function DashboardPage() {
  const userData = await getProfileInfo();

  if (!userData) {
    redirect("/sign-in");
  }

  // Redirect to the feed page
  redirect("/feed");
}

// Alternative: If you want to keep a dashboard home
// export default async function DashboardPage() {
//   const userData = await getProfileInfo();
//
//   if (!userData) {
//     redirect("/sign-in");
//   }
//
//   return (
//     <div className="md:p-6 lg:p-8 space-y-8 w-full overflow-x-hidden">
//       <WelcomeCard user={userData} />
//       
//       {/* Dashboard Overview Content */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         <Card className="p-6">
//           <h3 className="text-lg font-semibold mb-2">Quick Stats</h3>
//           <p className="text-gray-600">Your activity overview</p>
//         </Card>
//         
//         <Card className="p-6">
//           <h3 className="text-lg font-semibold mb-2">Recent Applications</h3>
//           <p className="text-gray-600">Track your submissions</p>
//         </Card>
//         
//         <Card className="p-6">
//           <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
//           <p className="text-gray-600">Opportunities for you</p>
//         </Card>
//       </div>
//       
//       {/* CTA to browse feed */}
//       <div className="text-center">
//         <Link 
//           href="/feed" 
//           className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//         >
//           Browse All Opportunities
//           <ArrowRight size={20} />
//         </Link>
//       </div>
//     </div>
//   );
// }