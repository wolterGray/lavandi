import React, {useEffect} from "react"; // добавь React и useEffect
import {useAnimation, motion} from "framer-motion";
import {useInView} from "react-intersection-observer";

export default function ScrollAnimationWrapper({
  children,
  delay = 0,
  once = false,
}) {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: once,
    rootMargin: "-150px 0px",
  });

  React.useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: {duration: 1, delay: 0.5},
      });
    }
  }, [inView, controls]);

  return (
    <motion.div ref={ref} initial={{opacity: 0, y: 200}} animate={controls}>
      {children}
    </motion.div>
  );
}
