import React, { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { GoArrowLeft, GoArrowRight } from "react-icons/go";
import { motion } from "framer-motion";

import "swiper/css";
import "swiper/css/effect-fade";
import { EffectFade, Autoplay, Navigation } from "swiper/modules";

function Slider() {
  const [loaded, setLoaded] = useState(false);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const homeBanner = [
    { img: "/massage/1.jpg", title: "NUAR", news: "LUXURY MASSAGE EXPERIENCE" },
    { img: "/massage/2.jpg", title: "RELAX", news: "TIME FOR YOUR BODY AND MIND" },
    { img: "/massage/3.jpg", title: "ATMOSPHERE", news: "CALM · ELEGANCE · HARMONY" },
  ];

  useEffect(() => {
    setLoaded(true); // ждём, пока стрелки появятся
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-3xl">
      {loaded && (
        <Swiper
          loop
          effect="fade"
          autoplay={{ delay: 8000, disableOnInteraction: false }}
          modules={[Autoplay, EffectFade, Navigation]}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onSwiper={(swiper) => {
            // обновляем ссылки
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
            swiper.navigation.init();
            swiper.navigation.update();
          }}
          className="w-full h-full"
        >
          {homeBanner.map(({ img, title, news }) => (
            <SwiperSlide key={title}>
              <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-secondaryColor/50 z-10" />

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

      {/* стрелки */}
      <div className="absolute inset-y-0 hidden sm:flex justify-between items-center px-6 sm:px-12 z-30 pointer-events-none">
        <span
          ref={prevRef}
          className="pointer-events-auto cursor-pointer text-gray-200 hover:text-white transition duration-300"
        >
          <GoArrowLeft className="text-4xl" />
        </span>
        <span
          ref={nextRef}
          className="pointer-events-auto cursor-pointer text-gray-200 hover:text-white transition duration-300"
        >
          <GoArrowRight className="text-4xl" />
        </span>
      </div>
    </div>
  );
}

export default Slider;
