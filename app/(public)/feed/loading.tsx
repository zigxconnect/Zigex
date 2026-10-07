import { Bone, CardBone, Loading, Surface } from "@/components/skeletons/Skeleton";

/** Opportunities: greeting, filter panel, two-column cards, side panel. */
export default function Load() {
  return (
    <Loading label="Loading opportunities">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 space-y-2.5">
          <Bone className="h-8 w-64" />
          <Bone className="h-4 w-96 max-w-full" />
        </div>
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-9">
            <Surface className="flex flex-wrap gap-4">
              <Bone className="h-12 w-full max-w-md rounded-xl" />
              <Bone className="h-12 w-40 rounded-xl" />
              <Bone className="h-12 w-40 rounded-xl" />
            </Surface>
            <Bone className="mt-6 h-3 w-40" />
            <div className="mt-3 grid gap-5 sm:grid-cols-2">
              <CardBone />
              <CardBone />
            </div>
          </div>
          <div className="space-y-4 lg:col-span-3">
            <Surface className="h-32" />
            <Surface className="h-64" />
          </div>
        </div>
      </div>
    </Loading>
  );
}
