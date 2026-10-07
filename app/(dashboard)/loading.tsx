import { Loading, PageTitle, Surface } from "@/components/skeletons/Skeleton";

/** Fallback for pages without their own skeleton: just the title area, no fake layout. */
export default function DashboardLoading() {
  return (
    <Loading label="Loading">
      <PageTitle />
      <Surface className="h-64" />
    </Loading>
  );
}
