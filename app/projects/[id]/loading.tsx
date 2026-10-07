import { Bone, Loading, Surface } from "@/components/skeletons/Skeleton";

/** Project page: cover, title, owner, description. */
export default function Load() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Loading label="Loading project">
        <Bone className="aspect-[16/7] w-full rounded-2xl" />
        <Bone className="mt-6 h-8 w-2/3" />
        <div className="mt-4 flex items-center gap-3">
          <Bone className="h-10 w-10 rounded-full" />
          <Bone className="h-4 w-40" />
        </div>
        <Surface className="mt-6 space-y-3">
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-11/12" />
          <Bone className="h-4 w-4/5" />
        </Surface>
      </Loading>
    </div>
  );
}
