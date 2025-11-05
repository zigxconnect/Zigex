"use client";
import { useState, useEffect, useRef } from "react";

export const AnimatedCounter = ({
  target,
  duration = 1500,
}: {
  target: number;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);
  // A ref is used to store the animation frame ID across renders without causing re-renders.
  const frameIdRef = useRef<number>();

  useEffect(() => {
    let startTime: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(target * progress));

      // If the animation is not finished, schedule the next frame
      // and store its ID in our ref.
      if (progress < 1) {
        frameIdRef.current = requestAnimationFrame(animate);
      }
    };

    // Start the animation and store the first frame ID.
    frameIdRef.current = requestAnimationFrame(animate);

    // The cleanup function is crucial. It will run when the component unmounts.
    return () => {
      // We check if frameIdRef.current has a value and, if so, cancel
      // that animation frame. This stops the animation loop.
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [target, duration]);

  // Format the number with commas for better readability (e.g., 1,234)
  return <>{count.toLocaleString()}</>;
};
