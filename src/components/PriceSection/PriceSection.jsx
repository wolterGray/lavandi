import React, {useState} from "react";
import {FaClock} from "react-icons/fa";
import SectionTitle from "../../ui/SectionTitle";
import {AnimatePresence, motion} from "framer-motion";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";

function PriceSection({services}) {
  const [selectedTime, setSelectedTime] = useState("60");

  // Получаем индекс времени (30, 60, 90, 120)
  const timeIndex = ["30", "60", "90", "120"].indexOf(selectedTime);

  return (
    <section className="relative select-none  bg-gradient-to-b  rounded-3xl">
      <ScrollAnimationWrapper>
        <SectionTitle className="text-4xl font-bold text-center">
          Cennik
        </SectionTitle>
        <div id="prices" className=" mx-auto  rounded-3xl shadow-2xl">
          {/* Табы */}
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            {["30", "60", "90", "120"].map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`relative px-6 py-2 text-lg font-medium rounded-full border 
                transition-all duration-300 overflow-hidden
                ${
                  selectedTime === time
                    ? "text-primaryColor-950 font-extrabold bg-primaryColor-500 shadow-md border-primaryColor-950"
                    : "text-primaryColor-500/30 border-primaryColor-500/30 hover:bg-primaryColor-500 hover:text-primaryColor-950"
                }`}>
                {time} min
              </button>
            ))}
          </div>

          {/* Цены */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <AnimatePresence>
              {services
                .filter((service) => service.time.includes(+selectedTime)) // +selectedTime чтобы строку превратить в число
                .map((service, index) => {
                  const timeIdx = service.time.indexOf(+selectedTime);
                  return (
                    <motion.div
                      layout
                      initial={{opacity: 0}}
                      animate={{opacity: 1}}
                      exit={{opacity: 0}}
                      transition={{duration: 1, ease: "easeInOut"}}
                      key={index}
                      className="p-6 overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 flex justify-between items-center border border-primaryColor-500/60">
                      <div>
                        <h3 className="text-xl font-semibold text-mainColor mb-1">
                          {service.title}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="flex items-center gap-1  font-bold text-lg">
                          <FaClock /> {service.time[timeIdx]} min
                        </span>
                        <p className="text-xl font-bold text-primaryColor-500">
                          {service.price[timeIdx]} zł
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
            </AnimatePresence>
          </div>
        </div>
      </ScrollAnimationWrapper>
    </section>
  );
}

export default PriceSection;
