import React, {useState} from "react";
import {FaClock} from "react-icons/fa";
import SectionTitle from "../../ui/SectionTitle";
import {motion, AnimatePresence} from "framer-motion";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";

import {Swiper, SwiperSlide} from "swiper/react";
import {Navigation, Pagination} from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

function PriceSection({services}) {
  const [selectedTime, setSelectedTime] = useState("60");

  const filtered = services.filter((service) =>
    service.time.includes(+selectedTime)
  );

  // группируем по 3 карточки
  const groupedServices = [];
  for (let i = 0; i < filtered.length; i += 3) {
    groupedServices.push(filtered.slice(i, i + 3));
  }

  return (
    <section className="relative select-none  ">
      <ScrollAnimationWrapper>
        <SectionTitle className="text-4xl font-bold text-center">
          Cennik
        </SectionTitle>

        <div id="prices" className="mx-auto rounded-3xl">
          {/* Таб кнопки */}
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            {["30", "60", "75", "90", "120"].map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`
    relative w-full max-w-[100px] sm:max-w-[150px] px-3 py-2 sm:px-6 sm:py-3 text-sm sm:text-lg font-semibold rounded-full border
    transition-all duration-300 overflow-hidden text-center
    ${
      selectedTime === time
        ? "text-primaryColor-950 bg-primaryColor-500 border-primaryColor-950"
        : "text-primaryColor-500/40 border-primaryColor-500/40 hover:bg-primaryColor-500 hover:text-primaryColor-950"
    }
  `}>
                {time} min
              </button>
            ))}
          </div>

          {/* Карусель вертикальных блоков */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTime}
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              transition={{duration: 0.5}}>
              <Swiper
                modules={[Pagination]}
                loop={true}
                pagination={{clickable: true}}
                spaceBetween={30}
                slidesPerView={1}
                className="pb-10">
                {groupedServices.map((group, idx) => (
                  <SwiperSlide key={idx}>
                    <div className="grid gap-6">
                      {group.map((service, index) => {
                        const timeIdx = service.time.indexOf(+selectedTime);
                        return (
                          <motion.div
                            key={index}
                            layout
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            transition={{duration: 0.5, ease: "easeInOut"}}
                            className="p-3 sm:p-4 md:p-6 overflow-hidden rounded-2xl transition-all duration-300 flex justify-between items-center border border-primaryColor-500/60">
                            <div>
                              <h3 className="text-xl font-semibold text-mainColor mb-1">
                                {service.title}
                              </h3>
                            </div>
                            <div className="text-right">
                              <span className="flex items-center gap-1 font-bold text-lg">
                                <FaClock /> {service.time[timeIdx]} min
                              </span>
                              <p className="text-xl font-bold text-primaryColor-500">
                                {service.price[timeIdx]} zł
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </motion.div>
          </AnimatePresence>
        </div>
      </ScrollAnimationWrapper>
    </section>
  );
}

export default PriceSection;
