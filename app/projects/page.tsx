import { redirect } from "next/navigation";

// Redirect legacy /projects to the dashboard projects page
export default function ProjectsPage() {
  redirect('/dashboard/projects');
}
