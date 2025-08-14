import {AiFillStar} from "react-icons/ai";
import {Swiper, SwiperSlide} from "swiper/react";
import {Pagination, Autoplay} from "swiper/modules";
import {motion} from "framer-motion";
import "swiper/css";
import "swiper/css/pagination";
import SectionTitle from "../../ui/SectionTitle";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";

const GOLD = "#D6B16A";
const EGGPLANT = "#100613";

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

function PremiumStars({rating = 5, className = ""}) {
  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      aria-label={`Ocena ${rating} na 5`}>
      {Array.from({length: rating}).map((_, i) => (
        <AiFillStar
          key={i}
          className="w-4 h-4"
          style={{
            color: GOLD,
            filter: "drop-shadow(0 0 6px rgba(214,177,106,.25))",
          }}
        />
      ))}
    </div>
  );
}

function ReviewCard({name, text, rating}) {
  return (
    <motion.figure
      initial={{opacity: 0, y: 24}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true}}
      transition={{duration: 0.5, ease: "easeOut"}}
      className="relative w-full h-[180px] sm:h-[180px] lg:h-[200px] rounded-2xl p-[1px] bg-gradient-to-br"
      style={{
        backgroundImage: `linear-gradient(120deg, ${GOLD}99, transparent 35%, ${GOLD}22)`,
      }}>
      <div className="relative rounded-2xl h-full bg-secondaryColor/60 backdrop-blur-lg px-6 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_10px_30px_rgba(0,0,0,0.4)] flex flex-col">
        <div
          className="pointer-events-none absolute -top-3 left-6 text-5xl leading-none select-none"
          style={{color: `${GOLD}66`}}>
          “
        </div>

        <div className="flex items-center gap-4 mb-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full grid place-items-center bg-white/5 text-white font-semibold">
              {getInitials(name)}
            </div>
            <span
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{boxShadow: `inset 0 0 0 1px ${GOLD}55`}}
            />
          </div>

          <div className="flex flex-col">
            <span className="text-sm tracking-[0.12em] uppercase text-white font-medium">
              {name}
            </span>
            <PremiumStars rating={rating} />
          </div>
        </div>

        <blockquote
          className="text-base leading-relaxed text-white/90"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 5,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
          {text}
        </blockquote>

        <div className="mt-auto pt-3">
          <div className="h-px w-1/3" style={{backgroundColor: `${GOLD}66`}} />
        </div>
      </div>
    </motion.figure>
  );
}

export default function ReviewsSection() {
  return (
    <section
      id="opinie"
      className="relative select-none overflow-hidden"
      style={{
        backgroundColor: EGGPLANT,
        backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.8), rgba(0,0,0,0.85)), url('/reviews-img/rev.webp')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{boxShadow: "inset 0 0 200px rgba(0,0,0,0.8)"}}
      />

      <div className="relative z-10 container mx-auto px-4 py-20">
        <ScrollAnimationWrapper>
          <SectionTitle>Opinie</SectionTitle>

          {/* бейдж доверия — 5.0/5 + ссылка */}
          <div className="text-center pb-8">
            <span className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 text-white/90 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <PremiumStars rating={5} />
              <span className="text-sm tracking-[0.18em] uppercase">
                5.0 / 5 na Booksy
              </span>
              <span className="hidden sm:inline text-white/60">
                • 50+ opinii
              </span>
              <a
                href="https://booksy.com/pl-pl/262690_lavandi-studio-masazu_masaz_3_warszawa#ba_s=seo"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 underline decoration-2 underline-offset-4"
                style={{color: GOLD, textDecorationColor: `${GOLD}99`}}>
                Zobacz więcej
              </a>
            </span>
          </div>

          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{768: {slidesPerView: 2}, 1200: {slidesPerView: 3}}}
            autoplay={{delay: 7000, disableOnInteraction: false}}
            loop
           
            className="pb-10 [--swiper-theme-color:theme(colors.white)]">
            {reviews.map((r, i) => (
              <SwiperSlide key={i} className="h-auto will-change-transform">
                <div className="h-full">
                  <ReviewCard {...r} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </ScrollAnimationWrapper>
      </div>
    </section>
  );
}
