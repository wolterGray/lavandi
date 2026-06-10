import { motion, useReducedMotion } from "framer-motion";

export const SCROLL_REVEAL_EASE = [0.22, 1, 0.36, 1];
export const SCROLL_REVEAL_DURATION = 0.8;
export const SCROLL_REVEAL_OFFSET = 36;
export const SCROLL_REVEAL_VIEWPORT = { margin: "-6% 0px" };

const DIRECTION_OFFSET = {
  up: { x: 0, y: SCROLL_REVEAL_OFFSET },
  left: { x: -SCROLL_REVEAL_OFFSET, y: 0 },
  right: { x: SCROLL_REVEAL_OFFSET, y: 0 },
};

export default function ScrollAnimationWrapper({
  children,
  delay = 0,
  once = true,
  className = "",
  direction = "up",
  y,
}) {
  const prefersReducedMotion = useReducedMotion();

  const offset =
    direction === "up"
      ? { x: 0, y: y ?? DIRECTION_OFFSET.up.y }
      : DIRECTION_OFFSET[direction] ?? DIRECTION_OFFSET.up;

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: SCROLL_REVEAL_DURATION, delay, ease: SCROLL_REVEAL_EASE }}
      viewport={{ once, ...SCROLL_REVEAL_VIEWPORT }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
