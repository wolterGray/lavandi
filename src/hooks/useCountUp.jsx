import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

function getPrefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function CountUp({ value, suffix = "", duration = 4500, active }) {
  const [display, setDisplay] = useState(() => (getPrefersReducedMotion() ? value : 0));

  useEffect(() => {
    if (!active) return;

    if (getPrefersReducedMotion()) {
      setDisplay(value);
      return;
    }

    let frameId;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(easeOutCubic(progress) * value));
      if (progress < 1) frameId = requestAnimationFrame(tick);
      else setDisplay(value);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [active, value, duration]);

  return (
    <>
      {display.toLocaleString()}
      {suffix}
    </>
  );
}

export function useStatsInView() {
  return useInView({ triggerOnce: true, rootMargin: "-10% 0px" });
}
