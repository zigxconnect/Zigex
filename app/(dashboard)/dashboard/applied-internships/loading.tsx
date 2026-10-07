import { Bone, Loading, PageTitle, RowBone } from "@/components/skeletons/Skeleton";

/** My applications: filters and application rows. */
export default function Load() {
  return (
    <Loading label="Loading your applications">
      <PageTitle />
      <div className="mb-5 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <Bone key={i} className="h-10 w-24 rounded-full" />
        ))}
      </div>
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <RowBone key={i} />
        ))}
      </div>
    </Loading>
  );
}
