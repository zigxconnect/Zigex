"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  id: string;
  revalidate?: () => Promise<void>;
};

export function ProgramInteractiveButtons({ id, revalidate }: Props) {
  const router = useRouter();

  const handleRefresh = async () => {
    try {
      await revalidate?.();
      router.refresh();
    } catch (error) {
      console.error("Failed to refresh:", error);
    }
  };

  return (
    <div className="flex gap-3">
      <Button onClick={handleRefresh} variant="secondary-outline">
        Refresh
      </Button>
    </div>
  );
}

export default function ProgramInteractiveButtonsWrapper(props: Props) {
  return (
    <Suspense fallback={<div className="animate-pulse h-10 w-20 bg-gray-200 rounded" />}>
      <ProgramInteractiveButtons {...props} />
    </Suspense>
  );
}