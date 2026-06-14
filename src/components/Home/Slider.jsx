import SiteImage from "../../ui/SiteImage";
import { Swiper, SwiperSlide } from "swiper/react";
import { motion } from "framer-motion";

import "swiper/css";
import "swiper/css/effect-fade";
import { EffectFade, Autoplay } from "swiper/modules";

function Slider({ homeBanner }) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <Swiper
        loop
        effect="fade"
        autoplay={{ delay: 8000, disableOnInteraction: false }}
        modules={[Autoplay, EffectFade]}
        className="w-full h-full"
      >
        {homeBanner.map(({ img, title, news }, index) => (
          <SwiperSlide key={title}>
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-secondaryColor/40 z-10" />

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white z-20 px-6">
                <motion.h2
                  key={title}
                  initial={{ opacity: 0, y: -40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="mb-6 hyphens-auto font-display text-5xl font-bold uppercase tracking-widest sm:text-7xl"
                >
                  {title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-sm sm:text-lg font-light tracking-[0.3em] text-gray-200"
                >
                  {news}
                </motion.p>
              </div>

              <SiteImage
                src={img}
                alt={title}
                fill
                className="object-cover"
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                decoding={index === 0 ? "sync" : "async"}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default Slider;
