import { useEffect } from "react";
import { useAnimation, motion, useReducedMotion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function ScrollAnimationWrapper({
  children,
  delay = 0,
  once = true,
  className = "",
}) {
  const prefersReducedMotion = useReducedMotion();
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: once,
    rootMargin: "-8% 0px",
  });

  useEffect(() => {
    if (prefersReducedMotion) {
      controls.set({ opacity: 1, y: 0 });
      return;
    }
    if (inView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
      });
    }
  }, [inView, controls, delay, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={controls}
      className={className}
    >
      {children}
    </motion.div>
  );
}
