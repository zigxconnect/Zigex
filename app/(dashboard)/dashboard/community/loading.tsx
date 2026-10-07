import { Bone, Loading, PageTitle, Surface } from "@/components/skeletons/Skeleton";

/** Communities: Discord card with chat area, side panels. */
export default function Load() {
  return (
    <Loading label="Loading communities">
      <PageTitle />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Surface className="p-0">
          <div className="space-y-3 p-6">
            <div className="flex items-center gap-4">
              <Bone className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <Bone className="h-4 w-40" />
                <Bone className="h-3 w-24" />
              </div>
            </div>
            <Bone className="h-3 w-full" />
            <Bone className="h-3 w-3/4" />
          </div>
          <Bone className="h-[420px] w-full rounded-none rounded-b-2xl" />
        </Surface>
        <div className="space-y-6">
          <Surface className="h-40" />
          <Surface className="h-56" />
        </div>
      </div>
    </Loading>
  );
}
