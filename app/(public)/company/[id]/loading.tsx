import { Bone, CardBone, Loading } from "@/components/skeletons/Skeleton";

/** Company: cover, logo and name, about and postings. */
export default function Load() {
  return (
    <Loading label="Loading company">
      <div className="mx-auto w-full max-w-6xl">
        <Bone className="mb-6 h-5 w-40" />
        <Bone className="aspect-[3/1] w-full rounded-2xl sm:aspect-[4/1]" />
        <div className="-mt-10 px-6">
          <Bone className="h-20 w-20 rounded-2xl ring-4 ring-white sm:h-24 sm:w-24" />
          <Bone className="mt-3 h-7 w-56" />
          <Bone className="mt-2 h-4 w-40" />
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:max-w-[calc(100%-360px)]">
          <CardBone />
          <CardBone />
        </div>
      </div>
    </Loading>
  );
}
