import {AiFillStar} from "react-icons/ai";
import {Swiper, SwiperSlide} from "swiper/react";
import {Pagination, Autoplay} from "swiper/modules";
import {motion} from "framer-motion";
import "swiper/css";
import "swiper/css/pagination";
import SectionTitle from "../../ui/SectionTitle";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";

const reviews = [
  {
    name: "Anna K.",
    text: "To było niesamowite doświadczenie. Relaks na najwyższym poziomie, jak w luksusowym spa.",
    rating: 5,
  },
  {
    name: "Marcin W.",
    text: "Magia dotyku i cudowna atmosfera. Ciało i dusza naprawdę odpoczęły.",
    rating: 5,
  },
  {
    name: "Ewelina Z.",
    text: "Wspaniałe podejście, spokój i najwyższa jakość. Czuję się odmieniona!",
    rating: 5,
  },
  {
    name: "Karol N.",
    text: "Relaks totalny. Nigdzie wcześniej nie czułem się tak komfortowo.",
    rating: 5,
  },
  {
    name: "Joanna M.",
    text: "Dotyk profesjonalizmu. Polecam każdemu, kto chce naprawdę odpocząć.",
    rating: 5,
  },
];

const getInitials = (name) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const ReviewCard = ({name, text, rating}) => (
  <motion.div
    initial={{opacity: 0, y: 30}}
    whileInView={{opacity: 1, y: 0}}
    transition={{duration: 0.5}}
    viewport={{once: true}}
    className="relative bg-black/50 border border-[#333] rounded-2xl p-6 shadow-md h-full flex flex-col gap-4">
    <div className="flex items-center gap-4">
      <div className="bg-[#292929] text-white w-12 h-12 flex items-center justify-center rounded-full text-lg font-semibold">
        {getInitials(name)}
      </div>
      <div className="flex flex-col">
        <p className="text-sm text-white font-semibold">{name}</p>
        <div className="flex text-[#FFD700] text-sm">
          {Array.from({length: rating}).map((_, i) => (
            <AiFillStar key={i} className="w-4 h-4" />
          ))}
        </div>
      </div>
    </div>

    <div className="relative bg-indigo-100 text-black p-4 rounded-2xl text-base leading-relaxed before:absolute before:bottom-0 before:left-5 before:translate-y-full before:border-[8px] before:border-transparent before:border-t-indigo-100 font-extrabold">
      {text}
    </div>
  </motion.div>
);

export default function ReviewsSection() {
  return (
    <section
      className="relative bg-fixed bg-center bg-cover select-none overflow-hidden"
      style={{
        backgroundImage: "url('/reviews-img/rev.webp')",
      }}
      id="opinie">
      {/* Чёрный фильтр поверх картинки */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black bg-opacity-80 pointer-events-none z-0" />

      {/* Контент поверх фильтра */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <ScrollAnimationWrapper>
          <SectionTitle
            initial={{opacity: 0, y: -20}}
            whileInView={{opacity: 1, y: 0}}
            transition={{duration: 0.6}}
            viewport={{once: true}}>
            Opinie
          </SectionTitle>

          <p className="text-center pb-10 text-xl italic text-white">
            Ponad 50 pozytywnych opinii na{" "}
            <span className="text-primaryColor-500 border-b-primaryColor-500 border-b">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://booksy.com/pl-pl/262690_lavandi-studio-masazu_masaz_3_warszawa#ba_s=seo">
                Booksy
              </a>
            </span>
          </p>

          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              640: {slidesPerView: 1},
              768: {slidesPerView: 2},
              1024: {slidesPerView: 3},
            }}
            autoplay={{delay: 7000, disableOnInteraction: false}}
            loop={true}
            pagination={{clickable: true}}
            className="pb-10">
            {reviews.map((review, index) => (
              <SwiperSlide key={index} className="h-auto">
                <ReviewCard {...review} />
              </SwiperSlide>
            ))}
          </Swiper>

          <p className="text-center mt-4 text-sm text-gray-300">
            Przesuń w bok, aby zobaczyć więcej opinii →
          </p>
        </ScrollAnimationWrapper>
      </div>
    </section>
  );
}
