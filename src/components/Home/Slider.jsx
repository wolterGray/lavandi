import React, {useRef} from "react";
import {Swiper, SwiperSlide} from "swiper/react";
import {GoArrowLeft, GoArrowRight} from "react-icons/go";
import {motion} from "framer-motion";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {EffectFade, Autoplay, Navigation} from "swiper/modules";

import "./stylesSlider.css";

function Slider() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const homeBanner = [
    {
      img: "/massage/1.jpg",
      title: "Lato z Lavandi – chwile relaksu i odprężenia!",
      news: "Lato to czas, kiedy warto zadbać o swoje ciało i umysł. W Lavandi oferujemy orzeźwiające masaże, które pomogą Ci się zrelaksować i nabrać energii na całe lato. Sprawdź nasze letnie pakiety i poczuj prawdziwy komfort!",
    },
    {
      img: "/massage/2.webp",
      title: "Czas na relaks i pielęgnację w Lavandi",
      news: "Zadbaj o siebie w przyjaznej, odprężającej atmosferze. W Lavandi oferujemy profesjonalne masaże i rytuały, które łączą relaks z troską o Twoje ciało i samopoczucie. Odwiedź nas i poczuj różnicę.",
    },
    {
      img: "/massage/3.webp",
      title: "Do 20% rabatu na wszystkie masaże w Lavandi!",
      news: "Skorzystaj z naszej specjalnej oferty i zrelaksuj się z 20% zniżką na wszystkie masaże. Profesjonalna opieka i wyjątkowa atmosfera czekają na Ciebie. Promocja trwa do odwołania — nie przegap!",
    },
    {
      img: "/massage/4.webp",
      title: "Masaż marzeń w Lavandi – czas na prawdziwy relaks",
      news: "Zapomnij o codziennym stresie i pozwól sobie na chwilę prawdziwego odprężenia. Nasz masaż marzeń w Lavandi to połączenie delikatnych technik i profesjonalnej troski, które odmienią Twoje ciało i umysł. Odwiedź nas i przekonaj się, jak wygląda prawdziwa harmonia i regeneracja.",
    },
  ];

  return (
    <div className="relative w-full h-[80vh] rounded-3xl overflow-hidden z-10">
      <h1 className="sr-only">Najlepszy masaż w Warszawie</h1>

      {/* Навигационные стрелки */}
      <div className="absolute z-30 w-full top-1/2 -translate-y-1/2 flex justify-between  text-white text-2xl sm:text-5xl pointer-events-none">
        <span
          ref={prevRef}
          className="pointer-events-auto active:-translate-x-1 cursor-pointer hover:scale-110 transition-transform hover:text-primaryColor-500">
          <GoArrowLeft />
        </span>
        <span
          ref={nextRef}
          className="pointer-events-auto hover:text-primaryColor-500 cursor-pointer hover:scale-110 transition-transform active:translate-x-1">
          <GoArrowRight />
        </span>
      </div>

      {/* Свайпер */}
      <Swiper
        loop
        effect="fade"
        centeredSlides
        autoplay={{
          delay: 10000,
          disableOnInteraction: false,
        }}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        modules={[Autoplay, EffectFade, Navigation]}
        className="w-full h-full">
        {homeBanner.map(({img, title, news}) => (
          <SwiperSlide key={title}>
            <div className="relative w-full h-full">
              {/* Затемнение */}
              <div className="absolute inset-0 bg-black/50 z-10" />

              {/* Контент */}
              <motion.div
                initial={{translateY: 500}}
                animate={{translateY: 0}}
                transition={{duration: 1, delay: 1.2, ease: "easeOut"}}
                className="absolute z-10 bottom-32 left-6 sm:left-16 max-w-2xl text-white">
                <h2 className="text-3xl font-comforta sm:text-5xl font-thin mb-4">
                  {title}
                </h2>
                <p className="text-base sm:text-lg">{news}</p>
              </motion.div>

              {/* Фоновое изображение */}
              <img
                src={img}
                alt={title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default Slider;
