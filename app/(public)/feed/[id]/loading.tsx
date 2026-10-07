import { Bone, Loading, Surface } from "@/components/skeletons/Skeleton";

/** An opportunity or program: back link, image, title, apply panel, description. */
export default function Load() {
  return (
    <Loading label="Loading">
      <div className="mx-auto w-full max-w-6xl">
        <Bone className="mb-6 h-5 w-40" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
          <div>
            <Bone className="aspect-[4/3] w-full rounded-2xl sm:aspect-[16/9]" />
            <Bone className="mt-6 h-7 w-28 rounded-full" />
            <Bone className="mt-3 h-9 w-4/5" />
            <div className="mt-4 flex items-center gap-3">
              <Bone className="h-10 w-10 rounded-lg" />
              <Bone className="h-4 w-32" />
            </div>
            <div className="mt-10 space-y-3">
              <Bone className="h-5 w-48" />
              <Bone className="h-3 w-full" />
              <Bone className="h-3 w-11/12" />
              <Bone className="h-3 w-4/5" />
            </div>
          </div>
          <Surface className="h-fit space-y-4">
            <Bone className="h-4 w-40" />
            <Bone className="h-12 w-full rounded-xl" />
            <div className="space-y-3 border-t border-[#EEF2FA] pt-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3">
                  <Bone className="h-4 w-24" />
                  <Bone className="h-4 flex-1" />
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </div>
    </Loading>
  );
}
