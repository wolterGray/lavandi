import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import LogoNuar from "./LogoNuar";

const MIN_MS = 1100;

export default function SplashScreen({ onDone }) {
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (prefersReducedMotion) {
      onDone?.();
      return;
    }

    const timer = window.setTimeout(() => {
      setVisible(false);
    }, MIN_MS);

    return () => window.clearTimeout(timer);
  }, [prefersReducedMotion, onDone]);

  if (prefersReducedMotion) return null;

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-void"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 60% at 50% 45%, rgba(154, 132, 88, 0.04) 0%, transparent 60%), radial-gradient(ellipse 100% 80% at 50% 100%, rgba(8, 6, 12, 0.55) 0%, transparent 70%)",
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.4, 1] }}
          aria-hidden="true"
        >
          <LogoNuar gold className="!mb-0 max-w-[7rem] sm:max-w-[9rem]" />
          <div
            className="mt-10 h-4 w-4 rounded-full border border-gold/15 border-t-gold/55 animate-spin"
            aria-hidden="true"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
