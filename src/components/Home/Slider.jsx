import React, { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import { motion } from "framer-motion";

import "swiper/css";
import "swiper/css/effect-fade";
import { EffectFade, Autoplay, Navigation } from "swiper/modules";

function Slider({homeBanner}) {
  const [loaded, setLoaded] = useState(false);

  

  useEffect(() => {
    setLoaded(true); // ждём, пока стрелки появятся
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden ">
      {loaded && (
        <Swiper
          loop
          effect="fade"
          autoplay={{ delay: 8000, disableOnInteraction: false }}
          modules={[Autoplay, EffectFade, Navigation]}
          
          className="w-full h-full"
        >
          {homeBanner.map(({ img, title, news }) => (
            <SwiperSlide key={title}>
              <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-secondaryColor/40 z-10 " />

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white z-20 px-6">
                  <motion.h2
                    key={title}
                    initial={{ opacity: 0, y: -40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="text-5xl hyphens-auto sm:text-7xl font-[Cormorant_Garamond] tracking-widest font-bold uppercase mb-6"
                  >
                    {title}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="text-sm sm:text-lg font-light tracking-[0.3em] text-gray-200"
                  >
                    {news}
                  </motion.p>
                </div>

                <img src={img} alt={title} className="w-full h-full object-cover" loading="lazy" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

   
    </div>
  );
}

export default Slider;
