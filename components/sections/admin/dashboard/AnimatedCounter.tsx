"use client";
import { useState, useEffect } from "react";

export const AnimatedCounter = ({
  target,
  duration = 1500,
}: {
  target: number;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(target * progress));
      if (progress < 1) requestAnimationFrame(animate);
    };
    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);

  return <>{count}</>;
};
