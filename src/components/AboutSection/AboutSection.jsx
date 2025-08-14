import React from "react";
import SectionTitle from "../../ui/SectionTitle";
import { useAnimation, motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const GOLD = "#D6B16A";

export default function AboutSection() {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, rootMargin: "-300px 0px" });

  React.useEffect(() => {
    if (inView) {
      controls.start({ opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } });
    }
  }, [inView, controls]);

  return (
    <motion.section
      ref={ref}
      id="about"
      initial={{ opacity: 0, y: 120 }}
      animate={controls}
      className="custom-cont max-w-7xl mx-auto px-4 sm:px-6 py-20 select-none"
    >
      <SectionTitle>O nas</SectionTitle>
      <div className="mx-auto mt-4 mb-12 h-[2px] w-24 rounded-full" style={{ backgroundColor: GOLD }} />

      <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
        {/* текст */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
          className="lg:w-1/2 text-white/85 leading-relaxed text-base sm:text-lg"
        >
          <p className="mb-6">
            Mamy ponad 10 lat doświadczenia w pracy z ciałem i dbamy o indywidualne potrzeby każdego
            klienta. Nasze masaże łączą wiedzę z pasją do relaksu i zdrowia.
          </p>
          <p>
            Stawiamy na atmosferę spokoju, naturalne olejki i profesjonalne podejście, byś mógł w pełni
            odprężyć się i odzyskać energię.
          </p>
        </motion.div>

        {/* фото с золотым кантом */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="lg:w-1/2 w-full"
        >
          <div
            className="rounded-3xl p-[1px] overflow-hidden"
            style={{ backgroundImage: `linear-gradient(140deg, ${GOLD}99, transparent 40%, ${GOLD}33)` }}
          >
            <div className="rounded-[inherit] overflow-hidden shadow-lg">
              <img
                src="/about/about.webp"
                alt="NUAR — o nas"
                className="object-cover w-full h-full max-h-[420px] aspect-video"
                loading="lazy"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
