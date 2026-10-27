import { Bone, Loading, Surface } from "@/components/skeletons/Skeleton";

/** A student profile: header with photo and name, then work and details. */
export default function Load() {
  return (
    <Loading label="Loading profile">
      <Bone className="mb-6 h-5 w-28" />
      <Surface className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
        <Bone className="h-24 w-24 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2.5">
          <Bone className="h-7 w-56" />
          <Bone className="h-4 w-80 max-w-full" />
          <Bone className="h-3 w-64 max-w-full" />
        </div>
      </Surface>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Surface className="space-y-3">
            <Bone className="h-4 w-20" />
            <Bone className="h-3 w-full" />
            <Bone className="h-3 w-4/5" />
          </Surface>
          <Surface className="space-y-3">
            <Bone className="h-4 w-16" />
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3].map((i) => (
                <Bone key={i} className="h-7 w-24 rounded-full" />
              ))}
            </div>
          </Surface>
        </div>
        <Surface className="h-56" />
      </div>
    </Loading>
  );
}
