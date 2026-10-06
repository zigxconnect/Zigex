"use client";

import { useEffect, useState } from "react";

export function LoaderProvider() {
  const [Loader, setLoader] = useState<any>(null);

  useEffect(() => {
    import("nextjs-toploader")
      .then((mod) => {
        const m = mod as any;
        if (m.default && typeof m.default.default === "function") {
          setLoader(() => m.default.default);
        } else if (m.default && typeof m.default === "function") {
          setLoader(() => m.default);
        } else if (typeof m === "function") {
          setLoader(() => m);
        } else {
          setLoader(() => m.default || m);
        }
      })
      .catch((err) => {
        console.error("Failed to load nextjs-toploader client-side:", err);
      });
  }, []);

  if (!Loader) return null;

  const TopLoader = Loader;

  return (
    <TopLoader 
      color="#2563EB"
      initialPosition={0.08}
      crawlSpeed={200}
      height={3}
      crawl={true}
      showSpinner={false}
      easing="ease"
      speed={200}
      shadow="0 0 10px #2563EB,0 0 5px #2563EB"
      zIndex={1600}
      showAtBottom={false}
    />
  );
}

export default LoaderProvider;
