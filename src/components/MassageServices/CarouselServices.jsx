import React, {useRef, useState} from "react";
// Import Swiper React components
import {Swiper, SwiperSlide} from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

import "./stylesCarousel.css";

// import required modules
import {EffectCoverflow, Pagination} from "swiper/modules";

export default function CarouselServices({services}) {
  return (
    <>
      <Swiper
        effect={"coverflow"}
        loop={true}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={"auto"}
        
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
        {services.map(({img, title}) => (
          <SwiperSlide key={title}>
            <div className=" select-none">
              <div className="text-center">
                <div className="rounded-3xl overflow-hidden h-60 ">
                  <img className=" " src={img} alt="" />
                </div>
                <h3 className="text-2xl pt-5 font-medium mb-2 group-hover:text-goldHover">
                  {title}
                </h3>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
