import React, {useState} from "react";
import {Swiper, SwiperSlide} from "swiper/react";
import {EffectCoverflow, Pagination} from "swiper/modules";
import {motion, AnimatePresence} from "framer-motion";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

import "./stylesCarousel.css";
import {LuEye, LuEyeClosed} from "react-icons/lu";

export default function CarouselServices({services}) {
  return (
    <Swiper
      effect="coverflow"
      loop
      grabCursor
      centeredSlides
      slidesPerView="auto"
      coverflowEffect={{
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: false,
      }}
      pagination={{clickable: true}}
      modules={[EffectCoverflow, Pagination]}
      className="carousel pb-10">
      {services.map((service) => (
        <SwiperSlide key={service.title}>
          <ServiceCard {...service} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

function ServiceCard({img, title, desc}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="select-none">
      <div className="text-center">
        <div
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }}
          className="relative rounded-3xl overflow-hidden h-60 cursor-pointer group">
          <img src={img} alt={title} className="w-full h-full object-cover" />

          {/* Toggle icon */}
          <motion.div
            className="absolute top-2 right-2 z-10"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{delay: 0.2}}>
            <div className="bg-black/50  rounded-full text-2xl text-primaryColor p-2 hover:bg-black/80 shadow-md">
              {open ? (
                // Close modern eye off icon
                <LuEyeClosed />
              ) : (
                // Open modern eye icon
                <LuEye />
              )}
            </div>
          </motion.div>

          {/* Dark overlay with description */}
          <AnimatePresence>
            {open && (
              <motion.div
                className="absolute inset-0  bg-black/70 text-white flex items-center justify-center p-4"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                transition={{duration: 0.3}}>
                <motion.p
                  initial={{scale: 0, opacity: 0}}
                  animate={{scale: 1, opacity: 1}}
                  transition={{duration: 0.6}}
                  exit={{scale: 0, opacity: 0}}
                  className="text-lg font-semibold  leading-relaxed">
                  {desc}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <h3 className="text-2xl pt-5 font-medium mb-2">{title}</h3>
      </div>
    </div>
  );
}
