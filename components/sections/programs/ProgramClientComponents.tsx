"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const ProgramActions = dynamic(
  () => import("@/components/sections/dashboard/ProgramActions"),
  {
    loading: () => <div className="animate-pulse h-10 bg-gray-200 rounded-md w-32" />,
    ssr: false,
  }
);

interface ClientComponentsProps {
  programId: string;
}

export default function ProgramClientComponents({ programId }: ClientComponentsProps) {
  return (
    <Suspense fallback={<div className="animate-pulse h-10 bg-gray-200 rounded-md w-32" />}>
      <div className="space-y-3">
        <ProgramActions programId={programId} />
      </div>
    </Suspense>
  );
}