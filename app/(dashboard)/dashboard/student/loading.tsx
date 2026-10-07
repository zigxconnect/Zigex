import { Bone, Loading, PageTitle, Surface } from "@/components/skeletons/Skeleton";

/** Students: your card, search, people grid. */
export default function Load() {
  return (
    <Loading label="Loading students">
      <PageTitle />
      <Surface className="mb-8 flex items-center gap-4">
        <Bone className="h-14 w-14 rounded-full" />
        <div className="flex-1 space-y-2">
          <Bone className="h-3 w-40" />
          <Bone className="h-4 w-48" />
        </div>
      </Surface>
      <Bone className="h-12 max-w-xl rounded-xl" />
      <Bone className="mt-4 h-3 w-36" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 9 }, (_, i) => (
          <Surface key={i} className="flex items-center gap-4 p-4">
            <Bone className="h-14 w-14 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Bone className="h-4 w-3/4" />
              <Bone className="h-3 w-1/2" />
            </div>
          </Surface>
        ))}
      </div>
    </Loading>
  );
}
