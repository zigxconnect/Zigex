import { redirect } from 'next/navigation';

export default function LegacyDashboardProjectsPage() {
  redirect('/dashboard/programs');
}
