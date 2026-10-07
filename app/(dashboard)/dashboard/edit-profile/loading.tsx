import { Bone, Loading, Surface } from "@/components/skeletons/Skeleton";

/** Edit profile: live header with photo and strength, then setting rows. */
export default function Load() {
  return (
    <Loading label="Loading your profile">
      <Surface className="p-0">
        <Bone className="h-24 w-full rounded-b-none rounded-t-2xl sm:h-28" />
        <div className="grid gap-6 px-6 pb-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <Bone className="-mt-12 h-24 w-24 rounded-full ring-4 ring-white" />
            <Bone className="mt-4 h-7 w-56" />
            <Bone className="mt-2 h-4 w-72 max-w-full" />
          </div>
          <Bone className="h-28 rounded-xl lg:mt-5" />
        </div>
      </Surface>
      <Surface className="mt-6 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:p-8">
        <div className="space-y-2">
          <Bone className="h-4 w-24" />
          <Bone className="h-3 w-40" />
        </div>
        <div className="space-y-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="grid gap-5 sm:grid-cols-2">
              <Bone className="h-12 rounded-xl" />
              <Bone className="h-12 rounded-xl" />
            </div>
          ))}
        </div>
      </Surface>
    </Loading>
  );
}
