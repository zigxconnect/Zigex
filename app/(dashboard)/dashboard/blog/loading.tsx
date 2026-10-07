import { Bone, Loading, PageTitle, Surface } from "@/components/skeletons/Skeleton";

/** Announcements: timeline of notices and the blog column. */
export default function Load() {
  return (
    <Loading label="Loading announcements">
      <PageTitle />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,44rem)_300px]">
        <div className="space-y-4">
          <Bone className="h-4 w-32" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="grid grid-cols-[56px_minmax(0,1fr)] gap-3 sm:grid-cols-[64px_minmax(0,1fr)] sm:gap-4">
              <Bone className="mt-4 h-12 w-12 rounded-xl sm:h-14 sm:w-14" />
              <Surface>
                <div className="flex items-center gap-2.5">
                  <Bone className="h-7 w-7 rounded-full" />
                  <Bone className="h-3 w-32" />
                </div>
                <Bone className="mt-4 h-5 w-2/3" />
                <Bone className="mt-3 h-3 w-full" />
                <Bone className="mt-2 h-3 w-4/5" />
              </Surface>
            </div>
          ))}
        </div>
        <div className="hidden space-y-3 lg:block">
          <Bone className="h-4 w-36" />
          <Surface className="p-0">
            <Bone className="aspect-[16/9] w-full rounded-b-none rounded-t-2xl" />
            <div className="space-y-2 p-4">
              <Bone className="h-4 w-4/5" />
              <Bone className="h-3 w-1/2" />
            </div>
          </Surface>
        </div>
      </div>
    </Loading>
  );
}
