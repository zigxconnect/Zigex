import { Bone, CardBone, Loading, PageTitle } from "@/components/skeletons/Skeleton";

/** Programs: title, section heading, program cards. */
export default function Load() {
  return (
    <Loading label="Loading programs">
      <PageTitle />
      <Bone className="mb-4 h-5 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <CardBone key={i} />
        ))}
      </div>
    </Loading>
  );
}
