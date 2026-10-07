import { Bone, Loading } from "@/components/skeletons/Skeleton";

/** Article: back link, title, byline, cover, paragraphs. */
export default function Load() {
  return (
    <Loading label="Loading article">
      <Bone className="mb-6 h-5 w-36" />
      <div className="mx-auto max-w-[720px]">
        <Bone className="h-4 w-24" />
        <Bone className="mt-3 h-10 w-full" />
        <Bone className="mt-2 h-10 w-3/4" />
        <div className="mt-6 flex items-center gap-3 border-y border-[#EEF2FA] py-4">
          <Bone className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Bone className="h-3 w-28" />
            <Bone className="h-3 w-40" />
          </div>
        </div>
        <Bone className="mt-8 aspect-[16/9] w-full rounded-2xl" />
        <div className="mt-8 space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Bone key={i} className="h-4" />
          ))}
        </div>
      </div>
    </Loading>
  );
}
