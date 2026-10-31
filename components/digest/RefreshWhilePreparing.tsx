"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function RefreshWhilePreparing() {
  const router = useRouter();

  useEffect(() => {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      router.refresh();
      if (attempts >= 10) clearInterval(timer);
    }, 12_000);

    return () => clearInterval(timer);
  }, [router]);

  return null;
}